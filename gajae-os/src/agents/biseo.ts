import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { v4 as uuidv4 } from 'uuid';

export class BiseoAgent {

  // ... (생략) ...

  async processMessage(message: string): Promise<{ intent: string; taskId?: string } | null> {
    // ...
    // [Log] CEO Command
    await this.logChronicle('CEO', 'CEO_COMMAND', message);

    // ... Task 생성 ...
    const taskId = uuidv4();
    // ...

    // [Log] Biseo Response (4종 세트)
    await this.logChronicle('biseo', 'AGENT_RESPONSE', `지시 확인했습니다. Task(ID:${taskId})로 등록합니다.`, {
        emotion: 'Confident',   // ❤️ 심리
        thought: '새로운 업무 지시다. 매니저에게 빨리 넘겨야지.', // 🧠 생각
        intent: 'REPORT_AND_DELEGATE' // ❗️ 의도
    });

    return { intent: 'WORK', taskId };
  }

  private async logChronicle(speakerId: string, type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0]; 
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: speakerId,
      type: type,
      content: content,
      metadata: metadata // 여기에 심리, 생각, 의도 들어감
    });
  }
}
