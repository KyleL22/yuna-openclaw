import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Consensus Moderator
 * - 역할: 5단계 공정 + 만장일치 합의 유도
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();
  private agentId = 'pm';

  // [Phase Definition]
  private readonly phaseConfig: Record<string, { members: string[], goal: string, deliverable: string }> = {
    [TaskStatus.PLAN]: { members: ['po', 'ux', 'dev'], goal: "Define Requirements", deliverable: "PRD" },
    [TaskStatus.DESIGN]: { members: ['ux', 'po', 'dev'], goal: "Design UI/UX", deliverable: "Design Spec" },
    [TaskStatus.DEV]: { members: ['dev', 'po'], goal: "Implement Feature", deliverable: "Code" },
    [TaskStatus.TEST]: { members: ['qa', 'dev'], goal: "Verify Quality", deliverable: "QA Report" },
    [TaskStatus.RELEASE]: { members: ['po'], goal: "Deploy", deliverable: "Release Note" }
  };

  /**
   * Task 진행 및 토론 주재
   */
  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status as TaskStatus;

    console.log(`👔 [매니저] Status: ${currentStatus}, Speaker: ${lastSpeaker}, Intent: ${intent}`);

    // [0. CEO 승인]
    if (intent === 'CEO_APPROVE') {
        return await this.advanceToNextStage(task, docRef);
    }

    // [1. 초기화]
    if (currentStatus === TaskStatus.INBOX) {
        await docRef.update({ status: TaskStatus.PLAN, updated_at: new Date().toISOString() });
        return this.createSpawnAction('po', task, "기획안(PRD) 초안을 작성하고 텔레그램 그룹에 공유하세요.");
    }

    // [2. 합의 판정 (Consensus Check)]
    if (lastSpeaker) {
        // LLM에게 물어보기 (ASK_LLM 대신 여기서 바로 판단 로직 구현 - 단순화)
        // 실제로는 여기서 `this.openclaw.askLLM(...)`을 불러서 판단해야 하지만,
        // 지금은 데모를 위해 "DEV가 반대하면 PO를 부른다"는 하드코딩 로직을 살짝 섞겠습니다.
        // (나중에 진짜 LLM 판단으로 교체)
        
        // 예시 시나리오:
        // UX -> DEV (Review) -> PO (Adjust) -> ALL AGREE
        
        const phaseMembers = this.phaseConfig[currentStatus].members;
        const nextIndex = phaseMembers.indexOf(lastSpeaker) + 1;

        if (nextIndex < phaseMembers.length) {
            const nextMember = phaseMembers[nextIndex];
            return this.createSpawnAction(nextMember, task, `이전 발언자의 내용에 대해 검토(Review)하고, 동의하면 'AGREE', 반대하면 이유와 대안을 제시하세요.`);
        } else {
            // 한 바퀴 돌았음. 여기서 "모두 동의했나?" 체크해야 함.
            // 일단은 "토론 종료"로 간주하고 CEO 승인 대기.
            console.log(`👔 [매니저] 토론 라운드 종료. CEO 승인 대기.`);
            return null;
        }
    }

    return null;
  }

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      const currentStatus = task.status as TaskStatus;
      
      switch (currentStatus) {
          case TaskStatus.PLAN: nextStatus = TaskStatus.DESIGN; break;
          case TaskStatus.DESIGN: nextStatus = TaskStatus.DEV; break;
          case TaskStatus.DEV: nextStatus = TaskStatus.TEST; break;
          case TaskStatus.TEST: nextStatus = TaskStatus.RELEASE; break;
          case TaskStatus.RELEASE: nextStatus = TaskStatus.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          const nextPhase = this.phaseConfig[nextStatus];
          return this.createSpawnAction(nextPhase.members[0], { ...task, status: nextStatus }, `새로운 단계(${nextStatus}) 시작. 초안을 작성하세요.`);
      }
      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      // Phase 정보 조회
      const phaseInfo = this.phaseConfig[task.status as TaskStatus];
      const goalText = phaseInfo ? phaseInfo.goal : "Perform task";

      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Goal] ${goalText}
        [Instruction] ${instruction}
        
        [IMPORTANT]
        - Use 'message' tool to send report/feedback to Telegram Group: -5170307537
        - Prefix: [${agentId}]
        - If you agree with previous speaker, explicitly say "AGREE".
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }

  private async logChronicle(type: string, content: string, metadata: any = {}) {
    // ... (기존 로그 로직) ...
  }
}
