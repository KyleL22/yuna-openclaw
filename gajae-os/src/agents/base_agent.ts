import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { SystemRole } from '../types/system_role.interface';
import { OpenClawClient, AgentAction } from '../core/openclaw';

/**
 * Base Agent (모든 가재의 부모 클래스)
 * - 기능: 공통 DB 조회, 컨텍스트 로딩, 뇌 로딩(Brain Loading)
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

  // 2. 관련 Artifacts(기획서 등) 링크 로드
  protected async loadArtifacts(epicId?: string): Promise<string[]> {
    if (!epicId) return [];
    
    // Epic 문서 내 artifacts 필드 또는 하위 컬렉션 조회
    // (여기서는 하위 컬렉션 'artifacts'를 쓴다고 가정)
    const snapshot = await db.collection('epics').doc(epicId).collection('artifacts').get();
    
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.type}] ${data.title} (ID: ${doc.id})`;
    });
  }

  // 3. 이전 회의록(Chronicle) 요약 로드 (최근 5개)
  protected async loadRecentChronicles(runId: string): Promise<string[]> {
    // run_id(날짜) 기준 조회 (실제로는 taskId나 epicId로 필터링해야 더 정확함)
    const snapshot = await db.collection('chronicles')
        .where('run_id', '==', runId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.speaker_id}] ${data.content}`;
    }).reverse(); // 시간순 정렬
  }

  // 4. Brain Loading (DB에서 Role 정보 로드)
  protected async loadSystemRole(roleId: string): Promise<SystemRole | null> {
      // BrainLoader가 업로드한 경로: /system/roles/items/{roleId}
      const doc = await db.collection('system').doc('roles').collection('items').doc(roleId).get();
      if (doc.exists) {
          return doc.data() as SystemRole;
      }
      console.warn(`⚠️ [Brain] Role not found in DB: ${roleId}`);
      return null;
  }

  // 5. 컨텍스트 조립 (프롬프트용)
  protected async buildContext(taskId: string): Promise<string> {
    const task = await this.loadTask(taskId);
    if (!task) return 'Task not found';

    const artifacts = await this.loadArtifacts(task.epic_id);
    const chronicles = await this.loadRecentChronicles(new Date().toISOString().split('T')[0]); // 오늘 날짜 기준

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
