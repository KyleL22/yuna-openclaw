import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { SystemRole } from '../types/system_role.interface';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * Base Agent (Logic Only)
 * - 역할: DB 조회 및 Context 구성 (Log 저장 로직 제거)
 */
export class BaseAgent {
  protected openclaw = new OpenClawClient();
  protected agentId: string;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  // 1. Task 정보 로드
  protected async loadTask(taskId: string): Promise<Task | null> {
    const doc = await db.collection('tasks').doc(taskId).get();
    return doc.exists ? (doc.data() as Task) : null;
  }

  // 2. 관련 Artifacts 링크 로드
  protected async loadArtifacts(epicId?: string): Promise<string[]> {
    if (!epicId) return [];
    
    const snapshot = await db.collection('epics').doc(epicId).collection('artifacts').get();
    
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.type}] ${data.title} (ID: ${doc.id})`;
    });
  }

  // 3. 이전 회의록 로드
  protected async loadRecentChronicles(runId: string): Promise<string[]> {
    const snapshot = await db.collection('chronicles')
        .where('run_id', '==', runId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.speaker_id}] ${data.content}`;
    }).reverse();
  }

  // 4. Brain Loading
  protected async loadSystemRole(roleId: string): Promise<SystemRole | null> {
      const doc = await db.collection('system').doc('roles').collection('items').doc(roleId).get();
      if (doc.exists) {
          return doc.data() as SystemRole;
      }
      return null;
  }

  // 5. 컨텍스트 조립
  protected async buildContext(taskId: string): Promise<string> {
    const task = await this.loadTask(taskId);
    if (!task) return 'Task not found';

    const artifacts = await this.loadArtifacts(task.epic_id);
    const chronicles = await this.loadRecentChronicles(new Date().toISOString().split('T')[0]);

    return `
      [Current Task]
      - Title: ${task.title}
      - Status: ${task.status}
      - Instruction: ${task.instruction}

      [Related Artifacts]
      ${artifacts.length > 0 ? artifacts.join('\n') : '(None)'}

      [Recent Discussion]
      ${chronicles.length > 0 ? chronicles.join('\n') : '(None)'}
    `;
  }
}
