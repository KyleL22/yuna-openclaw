import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class BAAgent extends BaseAgent {
  constructor() { super('ba'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [분석가재(OS)] Task(ID:${taskId}) 비즈니스 분석 준비...`);
    const contextString = await this.buildContext(taskId);
    return this.openclaw.spawnAgent(this.agentId, `[Role] 분석가재(BA)\n${contextString}\n[Goal] 요구사항 분석 및 데이터 검토`, { taskId });
  }
}
