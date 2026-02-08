import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { TaskStatus } from '../types/task_status.enum';
import { RoleReport } from '../types/role_report.interface';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 기획가재 (PO Gajae)
 * - 역할: Product Owner
 * - 수정: Import 경로 수정
 */
export class POAgent {
  
  async processTask(taskId: string) {
    console.log(`💡 [기획가재] Task(ID:${taskId}) 기획 착수!`);

    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    const task = doc.data() as Task;

    // 1. 기획서 생성 (Mock)
    const onePagerContent = `# 1-Pager: ${task.title}\n\n## 1. 개요\n${task.instruction}\n\n## 2. 요구사항\n- 기능 구현\n- 테스트 완료\n\n## 3. 일정\n- ASAP`;
    
    // 2. 파일 저장
    const epicId = task.epic_id || 'E001-default';
    const filePath = `docs/epics/${epicId}/1-plan/1pager.md`;
    this.saveFile(filePath, onePagerContent);

    // 3. Artifact 등록
    await db.collection('epics').doc(epicId).set({
        artifacts: [{ path: filePath, type: '1pager', created_at: new Date().toISOString() }]
    }, { merge: true });

    // 4. 상태 변경: PF -> RFE_RFK
    await docRef.update({
      status: TaskStatus.RFE_RFK,
      updated_at: new Date().toISOString()
    });

    // 5. Role Report 저장
    const report: RoleReport = {
        role_id: 'po',
        task_id: taskId,
        summary: `기획서(${filePath}) 작성 완료. 주요 내용: ${task.instruction}`,
        status: 'DONE',
        logs: []
    };
    await docRef.collection('reports').doc('po').set(report);

    console.log(`💡 [기획가재] 기획서 작성 및 Report 저장 완료.`);
    
    // 6. Chronicle 기록
    await this.logChronicle('po', 'AGENT_RESPONSE', `기획서(${filePath}) 작성 완료했습니다. 개발 착수 승인 부탁드립니다.`);
  }

  // 파일 저장 헬퍼
  private saveFile(relativePath: string, content: string) {
    const fullPath = path.resolve(process.cwd(), '../', relativePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
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
