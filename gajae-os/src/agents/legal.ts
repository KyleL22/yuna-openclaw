import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class LegalAgent extends BaseAgent {
  constructor() { super('legal'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [변호사가재(OS)] Task(ID:${taskId}) 법적 검토 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 변호사가재(LEGAL)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] 법적 리스크 검토 및 약관 작성
        ${contextString}
        [Output Instructions] Firestore Artifact에 법률 검토서 등록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
