import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { db } from '../core/firebase';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 품질가재 (QA Gajae)
 * - BaseAgent 상속
 */
export class QAAgent extends BaseAgent {
  
  constructor() {
    super('qa');
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [품질가재(OS)] Task(ID:${taskId}) 처리 준비...`);

    const contextString = await this.buildContext(taskId);
    const task = await this.loadTask(taskId);

    if (!task) return null;

    // FUQ 상태로 변경 (QA 시작)
    if (task.status !== TaskStatus.FUQ) {
        await db.collection('tasks').doc(taskId).update({
            status: TaskStatus.FUQ,
            updated_at: new Date().toISOString()
        });
    }

    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '품질가재(QA)'다.
      [Goal] 개발된 기능을 테스트하고 결함을 보고하라.
      
      ${contextString}

      [Output] 
        1. 테스트 케이스(TC) 실행 결과 보고.
        2. 버그 발견 시 'BLOCKER' 리포트, 없으면 'PASS'.
        3. 작업 완료 후 'DONE' 보고.
    `;

    const action = this.openclaw.spawnAgent(this.agentId, agentTask, { taskId });

    console.log(`💡 [품질가재(OS)] QA Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
