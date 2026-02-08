import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';

export class SecAgent extends BaseAgent {
  constructor() {
    super();
  }

  async processTask(taskId: string, action: any): Promise<AgentAction> {
    console.log(`💡 [보안가재(OS)] Task(ID:${taskId}) 처리 준비...`);
    return await this.loadContextAndSpawn('sec', taskId, action.task);
  }
}
