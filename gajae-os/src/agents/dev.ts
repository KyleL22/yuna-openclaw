import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum'; // [Fix] Import
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 개발가재 (Dev Gajae) - Orchestrator Version
 * - 역할: Developer Node
 * - 기능: FUE 단계 Task 확인 -> Dev Agent Spawn 지시
 */
export class DevAgent {
  private openclaw = new OpenClawClient();

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [개발가재(OS)] Task(ID:${taskId}) 개발 착수 준비...`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;

    // 1. Dev Agent에게 시킬 일 정의
    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '개발가재(DEV)'다.
      [Goal] 기획서(Artifact)를 바탕으로 실제 기능을 구현하라.
      [Input Task] "${task.title}"
      [Context] Firestore '/epics/${task.epic_id}/artifacts'에 있는 기획서를 참조하라.
      [Output] 
        1. 실제 코드 작성 (또는 작성 시뮬레이션).
        2. Firestore Artifact에 '구현 코드(Link)' 등록.
        3. 작업 완료 후 'DONE' 보고.
    `;

    // 상태 변경: FUE (개발 중)
    await docRef.update({
        status: TaskStatus.FUE,
        updated_at: new Date().toISOString()
    });

    // 2. Spawn Action 생성
    const action = this.openclaw.spawnAgent('dev', agentTask, { taskId });

    console.log(`💡 [개발가재(OS)] Dev Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
