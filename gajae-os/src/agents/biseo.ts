import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * 비서가재 (Biseo Gajae)
 * - 역할: Gatekeeper & Task Creator
 * - 수정 사항: LangGraph에서 호출하기 좋게 메서드 분리
 */
export class BiseoAgent {

  // [Refactor] 단순히 Task 생성만 담당 (로직 분리)
  async createTask(commandText: string, speakerId: string = 'CEO'): Promise<string> {
    console.log(`🦞 [비서가재] Task 생성 요청 받음: "${commandText}"`);

    // [0. Chronicle 기록]
    await this.logChronicle(speakerId, 'CEO_COMMAND', commandText);

    // 1. Task 객체 생성
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      project_id: 'yuna-openclaw',
      title: commandText.slice(0, 50),
      instruction: commandText,
      status: TaskStatus.INBOX, // 초기 상태
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. Firestore 저장
    await db.collection('tasks').doc(taskId).set(newTask);
    console.log(`🦞 [비서가재] INBOX Task 생성 완료 (ID: ${taskId})`);

    // [3. Chronicle 기록]
    await this.logChronicle('biseo', 'AGENT_RESPONSE', `Task(ID:${taskId})가 생성되었습니다.`);

    return taskId;
  }

  // Chronicle 로그 저장 헬퍼 (재사용)
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
