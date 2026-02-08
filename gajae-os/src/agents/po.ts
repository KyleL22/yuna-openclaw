import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum'; // [Fix] Import 분리
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * 기획가재 (PO Gajae) - Orchestrator Version
 * - 역할: Product Owner Node
 * - 기능: PF 단계 Task 확인 -> PO Agent Spawn 지시
 */
export class POAgent {
  private openclaw = new OpenClawClient();

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [기획가재(OS)] Task(ID:${taskId}) 처리 준비...`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;

    // 이미 처리 중이거나 완료되었으면 스킵
    if (task.status === TaskStatus.RFE_RFK) {
        return null;
    }

    // 1. PO Agent에게 시킬 일(Instruction) 정의
    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '기획가재(PO)'다.
      [Goal] 다음 요구사항을 바탕으로 '1-Pager 기획서'를 작성하라.
      [Input] "${task.instruction}"
      [Output] 
        1. 'docs/epics/${task.epic_id || 'E001-default'}/1-plan/1pager.md' 파일 생성.
        2. Firestore '/epics/.../artifacts'에 링크 저장.
        3. 작업 완료 후 'DONE' 보고.
    `;

    // 2. Spawn Action 생성 (직접 파일 안 만듦!)
    const action = this.openclaw.spawnAgent('po', agentTask, { taskId });

    console.log(`💡 [기획가재(OS)] PO Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
