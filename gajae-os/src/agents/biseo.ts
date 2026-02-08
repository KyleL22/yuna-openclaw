import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * 비서가재 (Biseo Gajae)
 * - 역할: Gatekeeper
 * - 기능: CEO 명령 수신 -> INBOX Task 생성 -> 매니저가재(Manager) 호출(Delegate)
 */
export class BiseoAgent {
  // 1. CEO 명령 수신 (텔레그램 등에서 호출)
  async receiveCommand(commandText: string, speakerId: string = 'CEO') {
    console.log(`🦞 [비서가재] 명령 수신: "${commandText}"`);

    // 2. 의도 분석 (나중엔 LLM으로 고도화)
    // 지금은 무조건 'INBOX' Task로 만듦.
    
    // 3. Task 생성 (INBOX)
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      project_id: 'yuna-openclaw', // 일단 하드코딩 (나중엔 컨텍스트에서 추론)
      title: commandText.slice(0, 50), // 제목은 앞부분만
      instruction: commandText,
      status: TaskStatus.INBOX, // <--- 핵심: 분류 전 상태
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 4. Firestore 저장
    await db.collection('tasks').doc(taskId).set(newTask);
    console.log(`🦞 [비서가재] INBOX에 저장 완료 (ID: ${taskId})`);

    // 5. 매니저가재 호출 (Delegate)
    // 원래는 여기서 LangGraph를 통해 매니저를 깨워야 함.
    // 지금은 로그만 남김.
    console.log(`🦞 [비서가재] 매니저가재님, 새 일감이 왔습니다! 확인해주세요.`);
    
    return taskId;
  }
}
