import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class UXAgent extends BaseAgent {
  constructor() { super('ux'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [디자인가재(OS)] Task(ID:${taskId}) 디자인 작업 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 디자인가재(UX)\n${contextString}\n[Goal] UI/UX 디자인 및 가이드 작성`, { taskId });
  }
}
