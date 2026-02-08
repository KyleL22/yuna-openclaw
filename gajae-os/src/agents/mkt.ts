import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class MKTAgent extends BaseAgent {
  constructor() { super('mkt'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [마케팅가재(OS)] Task(ID:${taskId}) 마케팅 전략 수립 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 마케팅가재(MKT)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] 마케팅 문구 및 전략 수립
        ${contextString}
        [Output Instructions] Firestore Artifact에 카피라이팅/전략 문서 등록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
