import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
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
    // (여기서 실제 기획가재에게 줄 프롬프트를 만듭니다)
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

    // [상태 업데이트는 언제?]
    // PO Agent가 일을 끝내고 돌아오면 그때 업데이트해야 함.
    // 하지만 지금은 '지시'만 내리는 단계이므로, 'PROCESSING' 등으로 바꿀 수도 있음.
    // 일단은 Action만 리턴.

    console.log(`💡 [기획가재(OS)] PO Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
