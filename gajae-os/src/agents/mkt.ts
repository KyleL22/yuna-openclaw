import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class MKTAgent extends BaseAgent {
  constructor() { super('mkt'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [마케팅가재(OS)] Task(ID:${taskId}) 마케팅 전략 수립 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 마케팅가재(MKT)\n${contextString}\n[Goal] 마케팅 문구 및 전략 수립`, { taskId });
  }
}
