import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';

/**
 * 매니저가재 (Manager Gajae)
 * - 역할: Process Manager
 * - 수정: Import 경로 수정
 */
export class ManagerAgent {
  
  // 특정 Task 처리
  async processTask(taskId: string) {
    console.log(`👔 [매니저가재] Task(ID:${taskId}) 처리 시작...`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error(`👔 [매니저가재] Task를 찾을 수 없습니다!`);
      return;
    }

    const task = doc.data() as Task;
    await this.triageAndSchedule(task);
  }

  // 분류 및 스케줄링
  private async triageAndSchedule(task: Task) {
    console.log(`👔 [매니저가재] 분류 중: "${task.title}"`);

    // [TODO] LLM 추론 로직
    const assignedEpicId = 'E001-default'; 
    
    const updates = {
      epic_id: assignedEpicId,
      status: TaskStatus.PF, // 기획 단계로 이동
      updated_at: new Date().toISOString()
    };

    await db.collection('tasks').doc(task.id).update(updates);
    
    console.log(`   -> [분류 완료] Epic: ${assignedEpicId}`);
    console.log(`   -> [상태 변경] INBOX -> PF`);
    
    console.log(`👔 [매니저가재] 기획가재님, ${task.id} 건 기획 시작하세요!`);
  }
}
