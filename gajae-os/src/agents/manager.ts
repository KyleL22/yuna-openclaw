import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 수정: 로그 기록 (logChronicle) 추가
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();
  private agentId = 'pm'; // 매니저가재 ID

  // 토론 참여자 정의 (공정별)
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

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}`);

    // [0. CEO 승인 처리]
    if (intent === 'CEO_APPROVE') {
        await this.logChronicle('MODERATION', 'CEO 승인이 확인되었습니다. 다음 단계로 전이합니다.');
        return await this.advanceToNextStage(task, docRef);
    }

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        await this.logChronicle('MODERATION', `Task 접수 완료. 기획(PF) 단계로 착수합니다.`);
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
            console.log(`   -> [완료] ${currentStatus} 단계 작업 완료. CEO 승인 대기.`);
            await this.logChronicle('MODERATION', `${currentStatus} 단계의 모든 작업이 완료되었습니다. CEO 승인을 기다립니다.`);
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
          
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              return this.createSpawnAction(nextMembers[0], { ...task, status: nextStatus }, "새로운 단계입니다. 작업을 시작하세요.");
          }
      }

      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      return this.openclaw.spawnAgent(agentId, `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        [Reference] Firestore Task ID: ${task.id}
      `, { taskId: task.id });
  }

  // Chronicle 로그 (BaseAgent 상속 안 받아서 직접 구현 - Mixin 고려 가능하지만 일단 중복)
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
