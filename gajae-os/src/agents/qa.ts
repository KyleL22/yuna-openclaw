import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum'; // [Fix] Import
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 품질가재 (QA Gajae) - Orchestrator Version
 * - 역할: QA Node
 * - 기능: RFQ 단계 Task 확인 -> QA Agent Spawn 지시
 */
export class QAAgent {
  private openclaw = new OpenClawClient();

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [품질가재(OS)] Task(ID:${taskId}) 테스트 착수 준비...`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;

    // 1. QA Agent에게 시킬 일 정의
    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '품질가재(QA)'다.
      [Goal] 개발된 기능을 테스트하고 결함을 보고하라.
      [Input Task] "${task.title}"
      [Context] Firestore '/epics/${task.epic_id}/artifacts'에 있는 기획서 및 코드를 참조하라.
      [Output] 
        1. 테스트 케이스(TC) 실행 결과 보고.
        2. 버그 발견 시 'BLOCKER' 리포트, 없으면 'PASS'.
        3. 작업 완료 후 'DONE' 보고.
    `;

    // 상태 변경: FUQ (테스트 중)
    await docRef.update({
        status: TaskStatus.FUQ,
        updated_at: new Date().toISOString()
    });

    // 2. Spawn Action 생성
    const action = this.openclaw.spawnAgent('qa', agentTask, { taskId });

    console.log(`💡 [품질가재(OS)] QA Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
