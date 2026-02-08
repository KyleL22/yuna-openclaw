import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { db } from '../core/firebase';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 개발가재 (Dev Gajae)
 * - BaseAgent 상속
 */
export class DevAgent extends BaseAgent {
  
  constructor() {
    super('dev');
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [개발가재(OS)] Task(ID:${taskId}) 처리 준비...`);

    const contextString = await this.buildContext(taskId);
    const task = await this.loadTask(taskId);

    if (!task) return null;

    // FUE 상태로 변경 (개발 시작)
    if (task.status !== TaskStatus.FUE) {
        await db.collection('tasks').doc(taskId).update({
            status: TaskStatus.FUE,
            updated_at: new Date().toISOString()
        });
    }

    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '개발가재(DEV)'다.
      [Goal] 기획서(Artifact)를 바탕으로 실제 기능을 구현하라.
      
      ${contextString}

      [Output] 
        1. 실제 코드 작성 (또는 작성 시뮬레이션).
        2. Firestore Artifact에 '구현 코드(Link)' 등록.
        3. 작업 완료 후 'DONE' 보고.
    `;

    const action = this.openclaw.spawnAgent(this.agentId, agentTask, { taskId });

    console.log(`💡 [개발가재(OS)] Dev Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
