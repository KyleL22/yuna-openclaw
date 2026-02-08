import { db } from '../core/firebase';
import { BaseAgent } from './base';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';

export class QAAgent extends BaseAgent {
  constructor() {
    super();
  }

  async processTask(taskId: string, action: any): Promise<AgentAction> {
    console.log(`💡 [품질가재(OS)] Task(ID:${taskId}) 처리 준비...`);
    
    // [Fix] 단순 상태 업데이트만 수행
    const docRef = db.collection('tasks').doc(taskId);
    // const doc = await docRef.get(); // 필요시 사용

    return await this.loadContextAndSpawn('qa', taskId, action.task);
  }
}
