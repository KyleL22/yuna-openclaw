import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class HRAgent extends BaseAgent {
  constructor() { super('hr'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [인사가재(OS)] Task(ID:${taskId}) 리소스 조율 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 인사가재(HR)\n${contextString}\n[Goal] 리소스 배분 및 문화 관리`, { taskId });
  }
}
