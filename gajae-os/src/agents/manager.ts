import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';
import { BaseAgent } from './base_agent';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 수정: 하드코딩된 순서 삭제 -> LLM에게 다음 행동 위임 (ASK_LLM)
 */
export class ManagerAgent extends BaseAgent { // BaseAgent 상속으로 변경 (Context 활용 위함)
  
  constructor() {
    super('pm');
  }

  // [Mod] llmAnswer 추가
  async processTask(taskId: string, lastSpeaker?: string, intent?: string, llmAnswer?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Status: ${currentStatus}, Last: ${lastSpeaker || '-'}, Intent: ${intent || '-'}`);

    // [0] CEO 승인 처리 (이건 Rule로 남김 - 안전장치)
    if (intent === 'CEO_APPROVE') {
        return await this.advanceToNextStage(task, docRef);
    }

    // [1] 초기 스케줄링 (Rule)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        return this.createSpawnAction('po', task, "백로그를 분석하고 우선순위를 보고하세요.");
    }

    // [2] 토론/공정 진행 (LLM 판단)
    
    // LLM 답변이 없으면 -> 판단 요청
    if (!llmAnswer) {
        const contextString = await this.buildContext(taskId);
        const prompt = `
            [Role] 너는 가재 컴퍼니의 매니저가재(Process Manager)다.
            [Situation] 현재 '${currentStatus}' 단계가 진행 중이다. 마지막 발언자는 '${lastSpeaker || '없음'}'이다.
            
            ${contextString}

            [Goal] 다음 행동을 결정하라.
            
            [Options]
            1. 특정 에이전트 호출: { "action": "CALL", "target": "po|dev|ux|qa...", "instruction": "..." }
            2. 합의 완료/단계 종료: { "action": "DONE", "reason": "..." }
            
            [Output] 오직 JSON 객체만 출력하라.
        `;
        return this.openclaw.askLLM(prompt, { step: 'DECIDE_NEXT_STEP' });
    }

    // LLM 답변이 있으면 -> 행동 수행
    try {
        const decision = JSON.parse(llmAnswer);
        console.log(`👔 [매니저가재] LLM 판단:`, decision);

        if (decision.action === 'CALL') {
            return this.createSpawnAction(decision.target, task, decision.instruction);
        } else if (decision.action === 'DONE') {
            console.log(`   -> [완료] ${currentStatus} 단계 종료. CEO 승인 대기.`);
            return null; // 그래프 종료 -> 승인 대기
        }
    } catch (e) {
        console.error("LLM JSON Parse Error:", e);
        return null;
    }

    return null;
  }

  // 다음 단계로 전이 (여기는 상태 머신 Rule 유지 - 13공정 순서는 지켜야 하므로)
  // 단, 이것조차 LLM에게 물어볼 수도 있지만, 일단 뼈대는 남겨둠.
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break;
          case Status.FBS: nextStatus = Status.RFD; break;
          // ... (기존 switch case 유지) ...
          case Status.FL: nextStatus = Status.DONE; break;
          default: nextStatus = Status.FUE; // Fallback
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          
          // 바뀐 단계의 첫 타자는 일단 LLM에게 물어보기 위해 null 리턴 -> 다음 턴에 processTask가 돌면서 ASK_LLM 함
          // (단, processTask를 다시 호출해줘야 함. workflow에서 처리)
          return null; 
      }
      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        [Output Format] JSON { "emotion": "...", "thought": "...", "intent": "...", "response": "..." }
      `;
      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }
}
