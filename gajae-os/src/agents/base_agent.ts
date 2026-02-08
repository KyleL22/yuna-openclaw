// ... (상단 Import 생략) ...
import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { SystemRole } from '../types/system_role.interface';
import { OpenClawClient, AgentAction } from '../core/openclaw';

export class BaseAgent {
  // ... (LoadTask 등 생략) ...

  protected async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    
    // [Fix] Mock 데이터 제거 (순수하게 전달받은 metadata만 저장)
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content,
      metadata: metadata // 가짜 데이터 없음!
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
