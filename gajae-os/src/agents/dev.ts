import { db } from '../core/firebase';
import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';

export class DevAgent extends BaseAgent {
  constructor() {
    super();
  }

  async processTask(taskId: string, action: any): Promise<AgentAction> {
    console.log(`💡 [개발가재(OS)] Task(ID:${taskId}) 처리 준비...`);
    
    // [Fix] 단순 상태 업데이트만 수행 (실제 로직은 BaseAgent의 Prompt로 위임)
    // Firestore status 필드 유효성 체크
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    const task = doc.data() as Task;

    if (task && task.status) {
        // 상태 업데이트가 필요하다면 여기서 수행 (지금은 Manager가 다 하므로 Pass)
        // await docRef.update({ updated_at: new Date().toISOString() });
    }

    return await this.loadContextAndSpawn('dev', taskId, action.task);
  }
}
