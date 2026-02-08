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
        await this.logChronicle('MODERATION', 'Task 접수. PLAN 단계 시작.', { intent: 'START_PLANNING' });
        return this.createSpawnAction('po', task, "기획안(PRD) 초안을 작성하고 텔레그램 그룹에 공유하세요.");
    }

    // [2. 합의 판정 (Consensus Check)]
    if (lastSpeaker) {
        const phaseMembers = this.phaseConfig[currentStatus].members;
        const nextIndex = phaseMembers.indexOf(lastSpeaker) + 1;

        if (nextIndex < phaseMembers.length) {
            const nextMember = phaseMembers[nextIndex];
            return this.createSpawnAction(nextMember, task, `이전 발언자의 내용에 대해 검토(Review)하고, 동의하면 'AGREE', 반대하면 이유와 대안을 제시하세요.`);
        } else {
            // 한 바퀴 돌았음.
            console.log(`👔 [매니저] 토론 라운드 종료. CEO 승인 대기.`);
            await this.logChronicle('MODERATION', '라운드 종료. CEO 승인 대기.');
            return null;
        }
    }

    return null;
  }

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      const currentStatus = task.status; // string으로 처리

      console.log(`🔄 [Advance] Current: ${currentStatus}`);

      switch (currentStatus) {
          case 'PLAN': nextStatus = TaskStatus.DESIGN; break;
          case 'DESIGN': nextStatus = TaskStatus.DEV; break;
          case 'DEV': nextStatus = TaskStatus.TEST; break;
          case 'TEST': nextStatus = TaskStatus.RELEASE; break;
          case 'RELEASE': nextStatus = TaskStatus.DONE; break;
          default:
              console.error(`❌ [Advance] Unknown Status: ${currentStatus}`);
              return null;
      }

      console.log(`🔄 [Advance] Next: ${nextStatus}`);

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          await this.logChronicle('MODERATION', `단계 전이: ${currentStatus} -> ${nextStatus}`);
          
          const nextPhase = this.phaseConfig[nextStatus];
          if (nextPhase && nextPhase.members.length > 0) {
              const firstMember = nextPhase.members[0];
              const instruction = `새로운 단계(${nextStatus}) 시작. 목표: ${nextPhase.goal}. 산출물: ${nextPhase.deliverable}. 작업을 시작하세요.`;
              return this.createSpawnAction(firstMember, { ...task, status: nextStatus }, instruction);
          }
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
