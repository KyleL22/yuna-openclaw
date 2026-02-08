import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 역할: 13공정 관리 및 토론 주도
 * - 수정: [FIX] Total Gate Control (모든 단계 종료 시 CEO 승인 필수)
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

  /**
   * Task 진행 및 토론 주재
   */
  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}, Intent: ${intent || '-'}`);

    // [0. CEO 승인 처리]
    // 현재 상태가 '승인 대기중(WAIT)'이 아니더라도, 승인 의도가 들어오면 다음 단계로 강제 전이(Super Pass 가능)
    if (intent === 'CEO_APPROVE') {
        await this.logChronicle('MODERATION', 'CEO 승인이 확인되었습니다. 다음 단계로 전이합니다.', {
            emotion: 'Relieved',
            thought: '드디어 승인이 났다. 이제 진짜 일 시작이다.',
            intent: 'TRANSITION_STAGE'
        });
        return await this.advanceToNextStage(task, docRef);
    }

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        await this.logChronicle('MODERATION', `Task 접수 완료. 기획(PF) 단계로 착수합니다.`, {
            emotion: 'Determined',
            thought: '새로운 에픽이다. 기획부터 꼼꼼히 챙겨야지.',
            intent: 'START_PLANNING'
        });
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
            await this.logChronicle('MODERATION', `${currentStatus} 단계 진행을 위해 ${nextMember} 가재에게 발언권을 넘깁니다.`);
            return this.createSpawnAction(nextMember, task, `현재 ${currentStatus} 단계입니다. 맡은 바 임무를 수행하세요.`);
        } else {
            // [핵심 수정] 한 바퀴 돌았으면 무조건 '승인 대기' 상태로 보고만 함. (자동 전이 X)
            console.log(`   -> [완료] ${currentStatus} 단계 작업 완료. CEO 승인 대기.`);
            await this.logChronicle('MODERATION', `${currentStatus} 단계의 모든 작업이 완료되었습니다. CEO 승인을 기다립니다.`);
            
            // 여기서 더 이상 Spawn 하지 않고 null 리턴 -> 그래프 종료 -> 대기 상태
            return null; 
        }
    }

    return null;
  }

  // 다음 단계로 전이 (CEO 승인 시에만 호출됨)
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      // 13단계 순차 전이 로직
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break;
          case Status.FBS: nextStatus = Status.RFD; break;
          case Status.RFD: nextStatus = Status.FBD; break;
          case Status.FBD: nextStatus = Status.RFE_RFK; break;
          case Status.RFE_RFK: nextStatus = Status.FUE; break;
          case Status.FUE: nextStatus = Status.RFQ; break;
          case Status.RFQ: nextStatus = Status.FUQ; break;
          case Status.FUQ: nextStatus = Status.RFT; break;
          case Status.RFT: nextStatus = Status.FUT; break;
          case Status.FUT: nextStatus = Status.FL; break;
          case Status.FL: nextStatus = Status.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          await this.logChronicle('MODERATION', `단계 전이: ${task.status} -> ${nextStatus}`);
          
          // 바뀐 단계의 첫 타자 호출
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              return this.createSpawnAction(nextMembers[0], { ...task, status: nextStatus }, "새로운 단계입니다. 작업을 시작하세요.");
          }
      }

      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        
        [Output Format]
        Answer in JSON: { "emotion": "...", "thought": "...", "intent": "...", "response": "..." }
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }

  private async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content,
      metadata: metadata
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
