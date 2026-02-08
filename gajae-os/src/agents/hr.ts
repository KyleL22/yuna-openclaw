import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class HRAgent extends BaseAgent {
  constructor() { super('hr'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [인사가재(OS)] Task(ID:${taskId}) 리소스 조율 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 인사가재(HR)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] 리소스 배분 및 문화 관리
        ${contextString}
        [Output Instructions] RoleReport에 조율 내용 기록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
