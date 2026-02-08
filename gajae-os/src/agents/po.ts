import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 기획가재 (PO Gajae)
 * - BaseAgent 상속으로 Context Loading 기능 탑재
 */
export class POAgent extends BaseAgent {
  
  constructor() {
    super('po'); // Agent ID: po
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [기획가재(OS)] Task(ID:${taskId}) 처리 준비 (Context Loading...)`);

    // 1. Context 로드 (Task + Artifacts + Chronicles)
    const contextString = await this.buildContext(taskId);
    const task = await this.loadTask(taskId);

    if (!task) return null;

    // 이미 처리 중이거나 완료되었으면 스킵 (로직은 상황에 따라 유연하게)
    if (task.status === TaskStatus.RFE_RFK) {
        return null;
    }

    // 2. Prompt 구성
    const agentTask = `
      [Role] 너는 가재 컴퍼니의 '기획가재(PO)'다.
      [Goal] 주어진 문맥을 바탕으로 '1-Pager 기획서'를 작성하라.
      
      ${contextString}

      [Output] 
        1. 'docs/epics/${task.epic_id || 'E001-default'}/1-plan/1pager.md' 파일 생성.
        2. Firestore '/epics/.../artifacts'에 링크 저장.
        3. 작업 완료 후 'DONE' 보고.
    `;

    // 3. Spawn Action 생성
    const action = this.openclaw.spawnAgent(this.agentId, agentTask, { taskId });

    console.log(`💡 [기획가재(OS)] PO Agent Spawn 요청 생성 완료.`);
    return action;
  }
}
