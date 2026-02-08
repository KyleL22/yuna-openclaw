import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../core/firebase';

/**
 * 비서가재 (Biseo Gajae)
 * - 역할: Gatekeeper & Task Creator
 * - 기능: 메시지 의도 파악(ASK_LLM) -> Task 생성 -> Manager 호출
 */
export class BiseoAgent extends BaseAgent {
  
  constructor() {
    super('biseo');
  }

  // 비서가재는 processTask 대신 createInitialTask 같은 별도 메서드를 쓸 수도 있지만,
  // 일관성을 위해 processMessage 같은 걸 만듦.
  
  // [New] 메시지를 받아서 처리
  async processMessage(message: string): Promise<{ intent: string; taskId?: string } | null> {
    console.log(`🦞 [비서가재(OS)] 메시지 수신: "${message}"`);

    // 1. Brain 로드
    const roleData = await this.loadSystemRole(this.agentId);
    const systemPrompt = roleData?.responsibilities['ALL'] || `너는 비서가재다.`;

    // 2. 의도 파악을 위해 Main Agent에게 LLM 질의 요청 (Action 아님, 내부 로직용)
    // 하지만 gajae-os는 LLM을 못 쓰므로, 여기서는 '판단 요청' Action을 리턴하고 종료해야 함.
    // -> workflow 구조상 biseoNode에서 바로 리턴해야 함.
    
    // [Workaround] 지금은 일단 기존 키워드 로직 유지하되, 추후 ASK_LLM으로 확장 가능하게 구조 잡음.
    // 또는 Main Agent가 CLI 실행 시 미리 의도를 파악해서 넘겨줄 수도 있음.
    
    // 여기서는 간단히 Task 생성 로직만 수행 (의도 파악은 workflow 레벨에서 처리됨)
    
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
    
    // Chronicle 기록
    await this.logChronicle('CEO', 'CEO_COMMAND', message);
    await this.logChronicle('biseo', 'AGENT_RESPONSE', `지시 확인했습니다. Task(ID:${taskId})로 등록합니다.`);

    return { intent: 'WORK', taskId };
  }

  // Chronicle 로그 (BaseAgent로 올리는 게 좋지만 일단 유지)
  private async logChronicle(speakerId: string, type: string, content: string) {
    const runId = new Date().toISOString().split('T')[0]; 
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: speakerId,
      type: type,
      content: content,
      metadata: {}
    });
  }
}
