import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator (Kinetic 13 Standard)
 * - 역할: 13공정 관리 및 토론 주도
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();

  // 토론 참여자 정의 (공정별)
  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po'], // 기획: PO 단독 (또는 PO->DEV)
    [Status.FBS]: ['dev'], // 기술검토: DEV
    [Status.RFD]: ['ux'], // 디자인요청: UX
    [Status.FBD]: ['ux', 'po', 'dev'], // 디자인완료: UX->PO/DEV 리뷰
    [Status.RFE_RFK]: ['po', 'dev'], // 개발착수승인: PO/DEV 최종확인 -> CEO승인
    [Status.FUE]: ['dev'], // 개발: DEV 구현
    [Status.RFQ]: ['dev', 'qa'], // QA요청: DEV->QA
    [Status.FUQ]: ['qa'], // QA진행: QA
    [Status.RFT]: ['qa', 'po'], // 배포승인: QA/PO 확인 -> CEO승인
    [Status.FUT]: ['dev', 'qa'], // 스테이징: DEV 배포 -> QA 확인
    [Status.FL]: ['po', 'mkt'], // 출시: PO/MKT
  };

  /**
   * Task 진행 및 토론 주재
   */
  async processTask(taskId: string, lastSpeaker?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}`);

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        return this.createSpawnAction('po', task, "기획서를 작성하고 발제하세요.");
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
            console.log(`   -> [순서] ${nextMember} 호출`);
            return this.createSpawnAction(nextMember, task, `현재 ${currentStatus} 단계입니다. 맡은 바 임무를 수행하세요.`);
        } else {
            console.log(`   -> [완료] ${currentStatus} 단계 종료.`);
            return await this.advanceToNextStage(task, docRef);
        }
    }

    return null;
  }

  // 13단계 정석 전이 로직
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break;
          case Status.FBS: nextStatus = Status.RFD; break;
          case Status.RFD: nextStatus = Status.FBD; break;
          case Status.FBD: nextStatus = Status.RFE_RFK; break;
          case Status.RFE_RFK: nextStatus = Status.FUE; break; // (CEO 승인 필요)
          case Status.FUE: nextStatus = Status.RFQ; break;
          case Status.RFQ: nextStatus = Status.FUQ; break;
          case Status.FUQ: nextStatus = Status.RFT; break; // (CEO 승인 필요)
          case Status.RFT: nextStatus = Status.FUT; break;
          case Status.FUT: nextStatus = Status.FL; break;
          case Status.FL: nextStatus = Status.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          console.log(`   -> [상태 전이] ${task.status} -> ${nextStatus}`);
          
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
}
