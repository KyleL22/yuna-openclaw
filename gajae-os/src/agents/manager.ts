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
  private agentId = 'pm';

  // [Phase Definition] 각 공정의 목적과 산출물 (Strictly Enforced)
  private readonly phaseConfig: Record<string, { members: string[], goal: string, deliverable: string }> = {
    [Status.PF]: {
      members: ['po'],
      goal: "Analyze requirements, define the core value (Why), and triage the backlog.",
      deliverable: "1-Pager Requirement Doc (Artifact) & Priority Report"
    },
    [Status.FBS]: {
      members: ['dev'],
      goal: "Assess technical feasibility, define architecture, and estimate effort.",
      deliverable: "Technical Specification & Schema Design (Artifact)"
    },
    [Status.RFD]: {
      members: ['ux'],
      goal: "Design the user flow, wireframes, and define UX principles.",
      deliverable: "UX Flowchart & Wireframe (Artifact)"
    },
    [Status.FBD]: {
      members: ['ux', 'po'], // 기획+디자인 디테일 협의
      goal: "Finalize visual design (UI) and component specifications.",
      deliverable: "High-fidelity Design & Component Spec (Artifact)"
    },
    [Status.RFE_RFK]: {
      members: ['po'],
      goal: "Review all planning/design artifacts before development starts.",
      deliverable: "Final Approval for Development (Go/No-Go Decision)"
    },
    [Status.FUE]: {
      members: ['dev'],
      goal: "Implement the feature based on approved specs.",
      deliverable: "Working Code & Implementation Report"
    },
    [Status.RFQ]: {
      members: ['dev'],
      goal: "Perform self-testing and request QA.",
      deliverable: "Unit Test Results & QA Request"
    },
    [Status.FUQ]: {
      members: ['qa'],
      goal: "Verify functionality against requirements and report bugs.",
      deliverable: "Bug Report or QA Pass Certificate"
    },
    [Status.RFT]: {
      members: ['qa', 'po'],
      goal: "Review test results and decide on release readiness.",
      deliverable: "Release Candidate (RC) Decision"
    },
    [Status.FUT]: {
      members: ['dev'],
      goal: "Fix critical bugs found during QA/UAT.",
      deliverable: "Hotfix Patch & Verification"
    },
    [Status.FL]: {
      members: ['po'], // 출시/배포
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
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}, Intent: ${intent || '-'}`);

    // [0. CEO 승인 처리]
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
        // PF 시작 시 첫 타자(PO) 호출
        const pfConfig = this.phaseConfig[Status.PF];
        return this.createSpawnAction(pfConfig.members[0], task, "백로그를 분석하고 우선순위를 보고하세요.");
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
      const phaseInfo = this.phaseConfig[task.status];
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
