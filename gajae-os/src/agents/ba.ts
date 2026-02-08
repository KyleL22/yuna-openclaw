import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class BAAgent extends BaseAgent {
  constructor() { super('ba'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [분석가재(OS)] Task(ID:${taskId}) 비즈니스 분석 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 분석가재(BA)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] 요구사항 분석 및 데이터 검토
        ${contextString}
        [Output Instructions] Firestore Artifact에 분석 리포트 등록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
