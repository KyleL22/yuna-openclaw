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

    // [0. Chronicle 기록] - CEO 발언 저장
    await this.logChronicle(speakerId, 'CEO_COMMAND', commandText);

    // 1. Task 생성 (INBOX)
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      project_id: 'yuna-openclaw', // 일단 하드코딩
      title: commandText.slice(0, 50),
      instruction: commandText,
      status: TaskStatus.INBOX, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. Firestore 저장
    await db.collection('tasks').doc(taskId).set(newTask);
    console.log(`🦞 [비서가재] INBOX에 저장 완료 (ID: ${taskId})`);

    // [3. Chronicle 기록] - 비서가재 응답 저장
    await this.logChronicle('biseo', 'AGENT_RESPONSE', `넵, "${commandText}" 접수하여 INBOX에 등록했습니다.`);

    // 4. 매니저가재 호출 (Delegate)
    console.log(`🦞 [비서가재] 매니저가재님, 새 일감이 왔습니다! 확인해주세요.`);
    
    return taskId;
  }

  // Chronicle 로그 저장 헬퍼
  private async logChronicle(speakerId: string, type: string, content: string) {
    // Run ID는 일단 날짜 단위로 그룹핑 (예: 2026-02-08)
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
