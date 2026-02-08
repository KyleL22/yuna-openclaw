import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 기획가재 (PO Gajae)
 * - Brain Loading 적용 완료
 */
export class POAgent extends BaseAgent {
  
  constructor() {
    super('po');
  }

  async processTask(taskId: string): Promise<AgentAction | null> {
    console.log(`💡 [기획가재(OS)] Task(ID:${taskId}) 처리 준비...`);

    // 1. Context & Brain 로드
    const contextString = await this.buildContext(taskId);
    const roleData = await this.loadSystemRole(this.agentId);
    const task = await this.loadTask(taskId);

    if (!task) return null;

    if (task.status === TaskStatus.RFE_RFK) {
        return null;
    }

    // 2. Prompt 구성 (DB에서 읽어온 Role 정보 주입)
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 기획가재(PO)다. 기획서를 작성하라.`;
    
    const agentTask = `
      ${systemPrompt}

      [Current Goal] 주어진 문맥을 바탕으로 '1-Pager 기획서'를 작성하라.
      
      ${contextString}

      [Output Instructions] 
        1. 'docs/epics/${task.epic_id || 'E001-default'}/1-plan/1pager.md' 파일 생성.
        2. Firestore '/epics/.../artifacts'에 링크 저장.
        3. 작업 완료 후 'DONE' 보고.
    `;

    // 3. Spawn Action 생성
    const action = this.openclaw.spawnAgent(this.agentId, agentTask, { taskId });

    console.log(`💡 [기획가재(OS)] PO Agent Spawn 요청 생성 완료 (Brain Loaded).`);
    return action;
  }
}
