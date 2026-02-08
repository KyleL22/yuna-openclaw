import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { RoleReport } from '../types/role_report.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * 기획가재 (PO Gajae)
 * - 역할: Product Owner
 * - 수정: 로컬 파일 저장 제거 -> Firestore Artifact 저장 (All-in-DB)
 */
export class POAgent {
  
  async processTask(taskId: string) {
    console.log(`💡 [기획가재] Task(ID:${taskId}) 기획 착수!`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    const task = doc.data() as Task;

    // 1. 기획서 내용 생성 (Mock)
    const onePagerContent = `# 1-Pager: ${task.title}\n\n## 1. 개요\n${task.instruction}\n\n## 2. 요구사항\n- 기능 구현\n- 테스트 완료\n- DB 올인 전략 적용\n\n## 3. 일정\n- ASAP`;
    
    // 2. Artifact 저장 (Firestore Sub-collection)
    const epicId = task.epic_id || 'E001-default';
    const artifactId = uuidv4();
    
    await db.collection('epics').doc(epicId).collection('artifacts').doc(artifactId).set({
        id: artifactId,
        type: '1pager',
        title: `1-Pager: ${task.title}`,
        content: onePagerContent, // <--- 핵심: 파일 내용 DB 저장
        created_at: new Date().toISOString()
    });

    console.log(`💡 [기획가재] Artifact DB 저장 완료 (ID: ${artifactId})`);

    // 3. 상태 변경: PF -> RFE_RFK
    await docRef.update({
      status: TaskStatus.RFE_RFK,
      updated_at: new Date().toISOString()
    });

    // 4. Role Report 저장
    const report: RoleReport = {
        role_id: 'po',
        task_id: taskId,
        summary: `기획서(DB ID: ${artifactId}) 작성 완료. 주요 내용: ${task.instruction}`,
        status: 'DONE',
        logs: []
    };
    await docRef.collection('reports').doc('po').set(report);

    // 5. Chronicle 기록
    await this.logChronicle('po', 'AGENT_RESPONSE', `기획서(DB:${artifactId}) 작성 완료했습니다. 개발 착수 승인 부탁드립니다.`);
  }

  // Chronicle 로그
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
