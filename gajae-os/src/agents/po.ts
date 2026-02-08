import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 기획가재 (PO Gajae) - Logic Only
 * - 수정: Artifact, Report, Chronicle 저장 로직 삭제
 */
export class POAgent extends BaseAgent {
  
  constructor() {
    super('po');
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [기획가재(OS)] Task(ID:${taskId}) 처리 로직 수행...`);

    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const task = await this.loadTask(taskId);

    if (!task || task.status === TaskStatus.RFE_RFK) return null;

    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 기획가재(PO)다.`;
    
    // PF 단계별 지시 사항
    let goal = "";
    let outputInstructions = "";

    if (task.status === TaskStatus.PF) {
        goal = "주어진 Task(명령)를 분석하여 구체적인 할 일(Subtasks)을 리스트업하고, 우선순위를 제안하라.";
        outputInstructions = `
            [IMPORTANT] Output must be a valid JSON object.
            {
              "thought": "분석 과정...",
              "emotion": "Confidence",
              "intent": "REPORT_PRIORITY",
              "response": "분석 결과 요약...",
              "artifacts": [
                 { "type": "1pager", "title": "기획서 초안", "content": "..." }
              ]
            }
        `;
    } else {
        // ...
    }
    
    // Spawn Action만 리턴 (저장은 Main Agent가 함)
    return this.openclaw.spawnAgent(this.agentId, `
      ${systemPrompt}
      [Current Goal] ${goal}
      ${contextString}
      [Output Instructions] ${outputInstructions}
    `, { taskId });
  }
}
