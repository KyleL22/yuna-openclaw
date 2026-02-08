import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../core/firebase';

export class BiseoAgent extends BaseAgent {
  
  constructor() {
    super('biseo');
  }

  // 메시지 수신 시 Task 생성만 수행 (로그 삭제)
  async processMessage(message: string): Promise<{ intent: string; taskId?: string } | null> {
    console.log(`🦞 [비서가재(OS)] 메시지 수신: "${message}"`);
    
    // [Action] CEO 명령은 이미 Main Agent가 받았으므로 로그는 Main Agent 책임.
    // 여기서는 Task 생성 로직만 수행.
    
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      project_id: 'yuna-openclaw',
      title: message.slice(0, 50),
      instruction: message,
      status: TaskStatus.INBOX,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('tasks').doc(taskId).set(newTask);
    console.log(`🦞 [비서가재(OS)] INBOX Task 생성 완료 (ID: ${taskId})`);
    
    return { intent: 'WORK', taskId };
  }
}
