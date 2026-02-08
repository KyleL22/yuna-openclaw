import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class UXAgent extends BaseAgent {
  constructor() { super('ux'); }
  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [디자인가재(OS)] Task(ID:${taskId}) 디자인 작업 준비...`);
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 디자인가재(UX)다.`;

    return this.openclaw.spawnAgent(this.agentId, `
        ${systemPrompt}
        [Current Goal] UI/UX 디자인 및 스타일 가이드 작성
        ${contextString}
        [Output Instructions] Firestore Artifact에 디자인 산출물 등록, 작업 완료 후 'DONE' 보고.
    `, { taskId });
  }
}
