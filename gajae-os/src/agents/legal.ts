import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class LegalAgent extends BaseAgent {
  constructor() { super('legal'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [변호사가재(OS)] Task(ID:${taskId}) 법적 검토 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 변호사가재(LEGAL)\n${contextString}\n[Goal] 법적 리스크 검토 및 약관 작성`, { taskId });
  }
}
