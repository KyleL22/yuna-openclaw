import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 매니저가재 (Manager Gajae) - Active Moderator
 * - 역할: 5단계 공정 관리 (Step-by-Step Approval)
 */
export class ManagerAgent {
  private openclaw = new OpenClawClient();
  private agentId = 'pm';

  // [Phase Definition] 각 공정의 목적과 산출물 (v2.0)
  private readonly phaseConfig: Record<string, { members: string[], goal: string, deliverable: string }> = {
    [TaskStatus.PLAN]: {
      members: ['po'],
      goal: "Analyze requirements, define core value (Why), and triage the backlog.",
      deliverable: "1-Pager Requirement Doc (PRD) & Priority Report"
    },
    [TaskStatus.DESIGN]: {
      members: ['ux'],
      goal: "Design the user flow, wireframes, and define UI/UX specifications.",
      deliverable: "Design Spec (Figma/Markdown) & Style Guide"
    },
    [TaskStatus.DEV]: {
      members: ['dev'],
      goal: "Implement the feature based on approved PRD and Design Spec.",
      deliverable: "Working Code, Tech Spec & Unit Tests"
    },
    [TaskStatus.TEST]: {
      members: ['qa'],
      goal: "Verify functionality against requirements and report bugs.",
      deliverable: "QA Report & Bug List (or Pass Certificate)"
    },
    [TaskStatus.RELEASE]: {
      members: ['po'],
      goal: "Deploy to production and announce release.",
      deliverable: "Release Note & Deployment Confirmation"
    }
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

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}, Intent: ${intent || '-'}`);

    // [0. CEO 승인 처리]
    if (intent === 'CEO_APPROVE') {
        await this.logChronicle('MODERATION', 'CEO 승인이 확인되었습니다. 다음 단계로 전이합니다.', {
            emotion: 'Relieved',
            thought: '드디어 승인이 났다. 다음 단계로 넘어가자.',
            intent: 'TRANSITION_STAGE'
        });
        return await this.advanceToNextStage(task, docRef);
    }

    // 1. 초기 스케줄링 (INBOX -> PLAN)
    if (currentStatus === TaskStatus.INBOX || currentStatus === TaskStatus.BACKLOG) {
        await docRef.update({ status: TaskStatus.PLAN, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        await this.logChronicle('MODERATION', `Task 접수 완료. 기획(PLAN) 단계로 착수합니다.`, {
            emotion: 'Determined',
            thought: '새로운 에픽이다. 기획부터 시작하자.',
            intent: 'START_PLANNING'
        });
        // PLAN 시작 시 첫 타자(PO) 호출
        const planConfig = this.phaseConfig[TaskStatus.PLAN];
        return this.createSpawnAction(planConfig.members[0], task, "백로그를 분석하고 기획안(1-Pager)을 작성하세요.");
    }

    // 2. 단계별 진행 (Strict Phase Management)
    const phaseInfo = this.phaseConfig[currentStatus];
    if (phaseInfo) {
        const requiredMembers = phaseInfo.members;
        
        // 현재 발언자가 있다면 다음 순서 계산
        let nextIndex = 0;
        if (lastSpeaker && requiredMembers.includes(lastSpeaker)) {
            nextIndex = requiredMembers.indexOf(lastSpeaker) + 1;
        }

        if (nextIndex < requiredMembers.length) {
            const nextMember = requiredMembers[nextIndex];
            await this.logChronicle('MODERATION', `${currentStatus} 단계 진행을 위해 ${nextMember} 가재에게 발언권을 넘깁니다.`);
            
            // [중요] 다음 에이전트에게 미션 부여 (공정 목표 전달)
            const instruction = `현재 ${currentStatus} 단계입니다. 당신의 목표는 '${phaseInfo.goal}'입니다. 산출물인 '${phaseInfo.deliverable}'을 작성하세요.`;
            return this.createSpawnAction(nextMember, task, instruction);
        } else {
            // 해당 단계의 모든 멤버가 발언함 -> CEO 승인 대기
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
          await this.logChronicle('MODERATION', `단계 전이: ${currentStatus} -> ${nextStatus}`);
          
          const nextPhase = this.phaseConfig[nextStatus];
          if (nextPhase && nextPhase.members.length > 0) {
              const firstMember = nextPhase.members[0];
              const instruction = `새로운 단계(${nextStatus})입니다. 목표: ${nextPhase.goal}. 산출물: ${nextPhase.deliverable}. 작업을 시작하세요.`;
              return this.createSpawnAction(firstMember, { ...task, status: nextStatus }, instruction);
          }
      }

      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      // Phase 정보 조회
      const phaseInfo = this.phaseConfig[task.status as TaskStatus];
      const goalText = phaseInfo ? phaseInfo.goal : "Perform task";
      const deliverableText = phaseInfo ? phaseInfo.deliverable : "Result";

      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        
        [PHASE OBJECTIVE]
        - Current Phase: ${task.status}
        - Goal: ${goalText}
        - Required Deliverable: ${deliverableText}
        
        [Instruction] ${instruction}
        
        [IMPORTANT: Output Format]
        You MUST respond with a valid JSON object ONLY. No other text.
        
        {
          "thought": "Your internal reasoning process...",
          "emotion": "Current emotion (e.g. Confident, Worried)",
          "intent": "Intent of this response (e.g. REPORT_RESULT, ASK_QUESTION)",
          "response": "Final response content to be reported",
          "artifacts": [
             { "type": "1pager|code", "title": "Title", "content": "Full Content..." }
          ]
        }
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
