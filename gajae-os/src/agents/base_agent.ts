// ... (상단 Import 생략) ...
import { db } from '../core/firebase';
import { Task } from '../types/task.interface';
import { SystemRole } from '../types/system_role.interface';
import { OpenClawClient, AgentAction } from '../core/openclaw';

export class BaseAgent {
  // ... (LoadTask 등 생략) ...

  protected async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    
    // [Mock] 4종 세트 기본값 채우기 (LLM 없을 때 대비)
    const enrichedMetadata = {
        emotion: metadata.emotion || 'Neutral', // ❤️
        thought: metadata.thought || '주어진 업무를 분석 중...', // 🧠
        intent: metadata.intent || 'EXECUTE_TASK', // ❗️
        ...metadata
    };

    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content, // 💬 답변
      metadata: enrichedMetadata
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
