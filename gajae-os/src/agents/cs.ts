import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class CSAgent extends BaseAgent {
  constructor() { super('cs'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [민원가재(OS)] Task(ID:${taskId}) 고객 대응 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 민원가재(CS)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] 고객 문의 응대 및 매뉴얼 작성
        ${contextString}
        [Output Instructions] Firestore Artifact에 응대 매뉴얼 등록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
