import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 역할: 13공정 관리 및 토론 주도
 * - 수정: 라운드 로빈 로직 강화 (무한 루프 방지)
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();

  // 토론 참여자 정의 (공정별)
  // [주의] 실제 에이전트 ID와 일치해야 함
  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po', 'dev'], // 기획 단계 (ux는 아직 구현 안 됨, po->dev 순서)
    [Status.FUE]: ['dev', 'po', 'qa'], // 개발 단계
    [Status.FUQ]: ['qa', 'dev'], // QA 단계
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
        console.log(`   -> [상태 변경] ${currentStatus} -> PF (기획 착수)`);
        // 상태가 바뀌었으니 lastSpeaker는 초기화된 것으로 간주하고 첫 타자 호출
        return this.createSpawnAction('po', task, "기획서를 작성하고 발제하세요.");
    }

    // 2. 토론 루프 (Discussion Loop)
    const requiredMembers = this.participants[currentStatus];
    
    if (requiredMembers) {
        // [로직 수정] lastSpeaker가 현재 단계의 멤버가 아니면(예: 이전 단계 사람이면) 무시하고 첫 타자부터 시작
        let nextIndex = 0;

        if (lastSpeaker && requiredMembers.includes(lastSpeaker)) {
            const currentIndex = requiredMembers.indexOf(lastSpeaker);
            nextIndex = currentIndex + 1;
        }

        if (nextIndex < requiredMembers.length) {
            // 다음 타자 호출
            const nextMember = requiredMembers[nextIndex];
            console.log(`   -> [순서] ${nextIndex + 1}/${requiredMembers.length}번째 발언자: ${nextMember}`);
            return this.createSpawnAction(nextMember, task, `이전 발언자(${lastSpeaker})의 내용을 검토하고 작업을 수행하세요.`);
        } else {
            // 한 바퀴 다 돌았으면 합의 완료로 간주하고 다음 단계로 전이
            console.log(`   -> [합의] ${currentStatus} 단계 토론 완료.`);
            return await this.advanceToNextStage(task, docRef);
        }
    } else {
        // 정의되지 않은 상태면 종료 (DONE 등)
        console.log(`   -> [종료] 더 이상 진행할 공정이 없습니다.`);
        return null;
    }
  }

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FUE; break;
          case Status.FUE: nextStatus = Status.FUQ; break;
          case Status.FUQ: nextStatus = Status.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          console.log(`   -> [상태 전이] ${task.status} -> ${nextStatus}`);
          
          // 바뀐 단계의 첫 타자 호출 (재귀 호출 대신 Action 리턴)
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              const firstMember = nextMembers[0];
              return this.createSpawnAction(firstMember, { ...task, status: nextStatus }, "새로운 단계입니다. 작업을 시작하세요.");
          }
      }

      return null; // 끝
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
