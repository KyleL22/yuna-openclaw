import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 역할: 13공정 관리 및 토론 주도
 * - 수정: [FIX] CEO 승인 없이 자동 전이 금지
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();

  // 토론 참여자 정의 (공정별)
  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po'], // 기획: PO 단독 (우선순위/기획서 초안)
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
  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}`);

    // [0. CEO 승인 처리]
    if (intent === 'CEO_APPROVE') {
        return await this.advanceToNextStage(task, docRef);
    }

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        console.log(`   -> [상태 변경] ${currentStatus} -> PF (기획 착수)`);
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
            // [핵심 수정] 한 바퀴 돌았으면 '자동 전이'하지 않고 '승인 대기' 상태로 보고만 함.
            console.log(`   -> [완료] ${currentStatus} 단계 작업 완료. CEO 승인 대기.`);
            // 여기서 null을 리턴하면 그래프가 종료되고, "CEO 승인이 필요합니다"라는 메시지가 나감.
            return null; 
        }
    }

    return null;
  }

  // 다음 단계로 전이 (CEO 승인 시에만 호출됨)
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break; // 기획 -> 기술검토
          case Status.FBS: nextStatus = Status.RFD; break; // 기술검토 -> 디자인요청
          case Status.RFD: nextStatus = Status.FBD; break; // 디자인요청 -> 디자인완료
          case Status.FBD: nextStatus = Status.RFE_RFK; break; // 디자인완료 -> 개발승인대기
          case Status.RFE_RFK: nextStatus = Status.FUE; break; // 승인 -> 개발착수
          // ... (나머지 동일)
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          console.log(`   -> [상태 전이] ${task.status} -> ${nextStatus} (CEO Approved)`);
          
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              return this.createSpawnAction(nextMembers[0], { ...task, status: nextStatus }, "승인되었습니다. 다음 단계 작업을 시작하세요.");
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
