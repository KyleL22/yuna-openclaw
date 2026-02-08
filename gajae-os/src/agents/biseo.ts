import { BaseAgent } from './base_agent';
import { AgentAction } from '../core/openclaw';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../core/firebase';

/**
 * 비서가재 (Biseo Gajae) - Smart Gatekeeper
 * - 수정: 기존 Task 검색 및 매칭 로직 추가 (중복 생성 방지)
 */
export class BiseoAgent extends BaseAgent {
  
  constructor() {
    super('biseo');
  }

  async processMessage(message: string, llmAnswer?: string): Promise<{ intent?: string; taskId?: string; action?: AgentAction } | null> {
    console.log(`🦞 [비서가재(OS)] 메시지 수신: "${message}"`);
    
    // 1. LLM 답변이 없으면 -> 판단 요청 (ASK_LLM)
    if (!llmAnswer) {
        // 진행 중인 Task 목록 조회
        const activeTasks = await this.getActiveTasks();
        const taskListStr = activeTasks.map(t => `- [${t.status}] ${t.title} (ID: ${t.id})`).join('\n');

        const prompt = `
            [Role] 너는 가재 컴퍼니의 비서가재(Gatekeeper)다.
            [Task] CEO의 발언을 분석하여 의도(Intent)와 대상(Target Task)을 파악하라.
            
            [Input Message] "${message}"

            [Active Tasks]
            ${taskListStr || '(없음)'}

            [Options]
            1. 기존 업무 관련: { "intent": "WORK", "match": "EXISTING", "taskId": "..." }
            2. 새로운 업무 지시: { "intent": "WORK", "match": "NEW" }
            3. 승인/진행 컨펌: { "intent": "CEO_APPROVE", "taskId": "..." } (문맥상 특정 Task에 대한 승인일 경우)
            4. 단순 잡담: { "intent": "CASUAL" }

            [Output] 오직 JSON 객체만 출력하라.
        `;
        return { action: this.openclaw.askLLM(prompt, { step: 'CLASSIFY_INTENT' }) };
    }

    // 2. LLM 답변 처리
    try {
        const decision = JSON.parse(llmAnswer);
        console.log(`🦞 [비서가재(OS)] LLM 판단:`, decision);

        if (decision.intent === 'CASUAL') {
            return { intent: 'CASUAL' };
        }

        if (decision.intent === 'WORK') {
            if (decision.match === 'EXISTING' && decision.taskId) {
                console.log(`   -> 기존 Task(ID:${decision.taskId}) 매칭 성공.`);
                return { intent: 'WORK', taskId: decision.taskId };
            }
            
            // 새 Task 생성
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
            console.log(`   -> 새 INBOX Task 생성 완료 (ID: ${taskId})`);
            return { intent: 'WORK', taskId };
        }

        if (decision.intent === 'CEO_APPROVE') {
            return { intent: 'CEO_APPROVE', taskId: decision.taskId };
        }

    } catch (e) {
        console.error("LLM JSON Parse Error:", e);
    }
    
    return null;
  }

  private async getActiveTasks(): Promise<Task[]> {
      const snapshot = await db.collection('tasks')
        .where('status', '!=', 'DONE')
        .limit(10) // 너무 많으면 토큰 터지니까 최근 10개만
        .get();
      
      return snapshot.docs.map(doc => doc.data() as Task);
  }
}
