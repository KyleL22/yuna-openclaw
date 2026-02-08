import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class CSAgent extends BaseAgent {
  constructor() { super('cs'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [민원가재(OS)] Task(ID:${taskId}) 고객 대응 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 민원가재(CS)\n${contextString}\n[Goal] 고객 문의 응대 및 매뉴얼 작성`, { taskId });
  }
}
