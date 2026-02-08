import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Logic Only
 * - 수정: 로그 기록 삭제, 상태 변경은 유지
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();
  private agentId = 'pm';

  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po'],
    [Status.FBS]: ['dev'],
    [Status.RFD]: ['ux'],
    [Status.FBD]: ['ux', 'po', 'dev'],
    [Status.RFE_RFK]: ['po', 'dev'],
    [Status.FUE]: ['dev'],
    [Status.RFQ]: ['dev', 'qa'],
    [Status.FUQ]: ['qa'],
    [Status.RFT]: ['qa', 'po'],
    [Status.FUT]: ['dev', 'qa'],
    [Status.FL]: ['po', 'mkt'],
  };

  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Logic Check - Status: ${currentStatus}`);

    // [0. CEO 승인 처리]
    if (intent === 'CEO_APPROVE') {
        return await this.advanceToNextStage(task, docRef);
    }

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        return this.createSpawnAction('po', task, "백로그를 분석하고 우선순위를 보고하세요.");
    }

    // 2. 토론 루프
    const requiredMembers = this.participants[currentStatus];
    if (requiredMembers) {
        let nextIndex = 0;
        if (lastSpeaker && requiredMembers.includes(lastSpeaker)) {
            nextIndex = requiredMembers.indexOf(lastSpeaker) + 1;
        }

        if (nextIndex < requiredMembers.length) {
            const nextMember = requiredMembers[nextIndex];
            return this.createSpawnAction(nextMember, task, `현재 ${currentStatus} 단계입니다. 맡은 바 임무를 수행하세요.`);
        } else {
            console.log(`   -> [완료] ${currentStatus} 단계 종료. CEO 승인 대기.`);
            // 로그는 Main Agent가 남김 (여기선 return null)
            return null; 
        }
    }

    return null;
  }

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break;
          case Status.FBS: nextStatus = Status.RFD; break;
          // ... (생략) ...
          case Status.RFE_RFK: nextStatus = Status.FUE; break;
          // ...
          case Status.FL: nextStatus = Status.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              return this.createSpawnAction(nextMembers[0], { ...task, status: nextStatus }, "새로운 단계입니다. 작업을 시작하세요.");
          }
      }
      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      // JSON 포맷 강제
      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        
        [Output Format]
        Answer in JSON: { "emotion": "...", "thought": "...", "intent": "...", "response": "..." }
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }
}
