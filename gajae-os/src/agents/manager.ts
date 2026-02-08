import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 역할: 13공정 관리 및 토론 주도
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();

  // 토론 참여자 정의 (공정별)
  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po', 'dev', 'ux'], // 기획 단계: PO발제 -> DEV/UX 검토
    [Status.FUE]: ['dev', 'po', 'qa'], // 개발 단계: DEV구현 -> PO/QA 확인
    [Status.FUQ]: ['qa', 'dev', 'po'], // QA 단계: QA테스트 -> DEV/PO 확인
  };

  /**
   * Task 진행 및 토론 주재
   * - 현재 상태에 따라 다음 발언자(Next Speaker)를 결정하여 Spawn 요청을 보냄.
   */
  async processTask(taskId: string, lastSpeaker?: string): Promise<AgentAction | null> {
    console.log(`👔 [매니저가재] Task(ID:${taskId}) 공정 관리 중... (Last Speaker: ${lastSpeaker})`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    // 1. 초기 스케줄링 (INBOX -> PF)
    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        console.log(`   -> [상태 변경] ${currentStatus} -> PF (기획 착수)`);
        // 기획 단계의 첫 타자는 항상 PO
        return this.createSpawnAction('po', task, "기획서를 작성하고 발제하세요.");
    }

    // 2. 토론 루프 (Discussion Loop)
    const requiredMembers = this.participants[currentStatus];
    if (requiredMembers) {
        // [간이 로직] 순차적으로 발언권 부여 (Round Robin)
        // 실제로는 LLM이 대화 맥락을 보고 "누가 말할 차례인가"를 판단해야 함.
        // 여기서는 [PO -> DEV -> UX -> PO(정리)] 순서로 하드코딩 시뮬레이션.

        if (!lastSpeaker) {
             // 아무도 말 안 했으면 첫 타자 (보통 Owner)
             return this.createSpawnAction(requiredMembers[0], task, "작업을 시작하고 결과를 보고하세요.");
        }

        const currentIndex = requiredMembers.indexOf(lastSpeaker);
        const nextIndex = currentIndex + 1;

        if (nextIndex < requiredMembers.length) {
            // 다음 타자 호출
            const nextMember = requiredMembers[nextIndex];
            return this.createSpawnAction(nextMember, task, `이전 발언자(${lastSpeaker})의 내용을 검토하고 의견을 내세요.`);
        } else {
            // 한 바퀴 다 돌았으면 합의(Consensus) 체크
            // (여기서는 무조건 합의되었다고 가정하고 다음 단계로 넘김)
            return await this.advanceToNextStage(task, docRef);
        }
    }

    return null; // 할 일 없음
  }

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      let nextMessage = "";

      switch (task.status) {
          case Status.PF:
              nextStatus = Status.FUE; // (원래는 승인 대기지만 Fast Track)
              nextMessage = "기획 합의 완료. 개발(FUE)로 넘어갑니다.";
              break;
          case Status.FUE:
              nextStatus = Status.FUQ;
              nextMessage = "개발 완료. QA(FUQ)로 넘어갑니다.";
              break;
          case Status.FUQ:
              nextStatus = Status.DONE;
              nextMessage = "QA 통과. 최종 완료(DONE).";
              break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          console.log(`   -> [상태 전이] ${task.status} -> ${nextStatus}`);
          
          // 상태가 바뀌었으니, 바뀐 상태의 첫 타자를 바로 호출
          const nextMembers = this.participants[nextStatus];
          if (nextMembers) {
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
