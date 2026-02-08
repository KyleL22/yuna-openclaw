import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 기획가재 (PO Gajae)
 * - 수정: PF 단계에서는 1-Pager 작성이 아니라, 백로그 분석 및 우선순위 보고를 수행.
 */
export class POAgent extends BaseAgent {
  
  constructor() {
    super('po');
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [기획가재(OS)] Task(ID:${taskId}) 처리 준비...`);

    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const task = await this.loadTask(taskId);

    if (!task) return null;

    // RFE_RFK 등 승인 대기 상태면 아무것도 안 함
    if (task.status === TaskStatus.RFE_RFK) {
        return null;
    }

    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 기획가재(PO)다.`;
    
    // [핵심 수정] PF 단계별 지시 사항 분기
    let goal = "";
    let outputInstructions = "";

    if (task.status === TaskStatus.PF) {
        // PF 단계: 백로그 분석 및 우선순위 보고
        goal = "주어진 Task(명령)를 분석하여 구체적인 할 일(Subtasks)을 리스트업하고, 우선순위를 제안하라.";
        outputInstructions = `
            1. Task의 의도와 범위를 명확히 정의.
            2. 수행해야 할 세부 항목(Subtasks) 나열.
            3. 각 항목의 우선순위(Priority) 제안.
            4. RoleReport에 '분석 보고서' 형태로 요약 저장.
            (아직 1-Pager 파일은 생성하지 말 것)
        `;
    } else {
        // 그 외 단계 (나중에 구현)
        goal = "기획 문서를 작성하라.";
        outputInstructions = "1-Pager 작성 및 Artifact 등록.";
    }
    
    const agentTask = `
      ${systemPrompt}

      [Current Goal] ${goal}
      
      ${contextString}

      [Output Instructions] 
      ${outputInstructions}
    `;

    // Spawn Action 생성
    const action = this.openclaw.spawnAgent(this.agentId, agentTask, { taskId });

    console.log(`💡 [기획가재(OS)] PO Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
