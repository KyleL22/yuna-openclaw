import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';

/**
 * 매니저가재 (Manager Gajae)
 * - 역할: Process Manager
 * - 기능: INBOX Task 조회 -> 분류(Epic 할당) -> PF 상태 변경 (스케줄링)
 */
export class ManagerAgent {
  
  // 1. INBOX 스캔 (주기적 또는 호출 시)
  async processInbox() {
    console.log('👔 [매니저가재] INBOX함을 확인합니다...');

    const snapshot = await db.collection('tasks')
      .where('status', '==', TaskStatus.INBOX)
      .get();

    if (snapshot.empty) {
      console.log('👔 [매니저가재] 처리할 INBOX 건이 없습니다. (깨끗)');
      return;
    }

    console.log(`👔 [매니저가재] ${snapshot.size}건의 신규 Task 발견! 분류를 시작합니다.`);

    for (const doc of snapshot.docs) {
      const task = doc.data() as Task;
      await this.triageAndSchedule(task);
    }
  }

  // 2. 분류 및 스케줄링 (원래는 기획가재가 분류하지만, 초기엔 매니저가 통합 수행)
  private async triageAndSchedule(task: Task) {
    console.log(`👔 [매니저가재] 처리 중: "${task.title}"`);

    // [TODO] LLM을 써서 적절한 Epic ID를 추론해야 함.
    // 지금은 'E001-default'로 하드코딩.
    const assignedEpicId = 'E001-default'; 
    
    // [TODO] 우선순위 판단 로직 필요.
    // 지금은 무조건 'PF'(기획 착수)로 넘김.
    
    const updates = {
      epic_id: assignedEpicId,
      status: TaskStatus.PF, // 기획 단계로 이동
      updated_at: new Date().toISOString()
    };

    await db.collection('tasks').doc(task.id).update(updates);
    
    console.log(`   -> [분류 완료] Epic: ${assignedEpicId}`);
    console.log(`   -> [상태 변경] INBOX -> PF (기획 착수)`);
    
    // 다음 단계(기획가재) 호출해야 함.
    console.log(`👔 [매니저가재] 기획가재님, ${task.id} 건 기획 시작하세요!`);
  }
}
