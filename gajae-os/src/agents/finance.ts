import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class FinanceAgent extends BaseAgent {
  constructor() {
    super();
  }

  async processTask(taskId: string, action: any): Promise<AgentAction> {
    console.log(`💡 [재무가재(OS)] Task(ID:${taskId}) 처리 준비...`);
    return await this.loadContextAndSpawn('finance', taskId, action.task);
  }
}
