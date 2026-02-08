import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../core/firebase';

/**
 * 비서가재 (Biseo Gajae) - Gatekeeper
 * - 역할: CEO 명령 수신 -> 의도 파악(LLM) -> Task 생성
 */
export class BiseoAgent extends BaseAgent {
  
  constructor() {
    super('biseo');
  }

  // [Mod] llmAnswer 파라미터 추가
  async processMessage(message: string, llmAnswer?: string): Promise<{ intent?: string; taskId?: string; action?: AgentAction } | null> {
    console.log(`🦞 [비서가재(OS)] 메시지 수신: "${message}"`);
    
    // 1. LLM 답변이 없으면 -> 판단 요청 (ASK_LLM)
    if (!llmAnswer) {
        const prompt = `
            [Role] 너는 가재 컴퍼니의 비서가재(Gatekeeper)다.
            [Task] CEO의 발언을 분석하여 의도(Intent)를 분류하라.
            [Input] "${message}"
            [Options]
            - WORK: 업무 지시 (새로운 일, 수정 요청 등)
            - CASUAL: 단순 잡담, 인사
            - CEO_APPROVE: 승인, 진행해, 좋아 등 긍정적 컨펌
            [Output] 오직 옵션 단어 하나만 출력하라. (예: WORK)
        `;
        return { action: this.openclaw.askLLM(prompt, { step: 'CLASSIFY_INTENT' }) };
    }

    // 2. LLM 답변이 있으면 -> 로직 수행
    const intent = llmAnswer.trim();
    console.log(`🦞 [비서가재(OS)] 의도 파악 완료: ${intent}`);

    if (intent === 'WORK') {
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
        return { intent, taskId };
    } 
    
    // CEO_APPROVE, CASUAL 등은 Task 생성 안 함
    return { intent };
  }
}
