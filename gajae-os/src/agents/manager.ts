import { db } from '../core/firebase';
import { Task, TaskStatus } from '../types/task.interface';
import { TaskStatus as Status } from '../types/task_status.enum';
import { OpenClawClient, AgentAction } from '../core/openclaw';

export class ManagerAgent {
  private openclaw = new OpenClawClient();
  private agentId = 'pm';

  // ... (참여자 정의 생략) ...

  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}`);

    if (intent === 'CEO_APPROVE') {
        await this.logChronicle('MODERATION', 'CEO 승인이 확인되었습니다. 다음 단계로 전이합니다.', {
            emotion: 'Relieved',
            thought: '드디어 승인이 났다. 이제 진짜 일 시작이다.',
            intent: 'TRANSITION_STAGE'
        });
        return await this.advanceToNextStage(task, docRef);
    }

    if (currentStatus === Status.INBOX || currentStatus === Status.BACKLOG) {
        await docRef.update({ status: Status.PF, epic_id: 'E001-default', updated_at: new Date().toISOString() });
        await this.logChronicle('MODERATION', `Task 접수 완료. 기획(PF) 단계로 착수합니다.`, {
            emotion: 'Determined',
            thought: '새로운 에픽이다. 기획부터 꼼꼼히 챙겨야지.',
            intent: 'START_PLANNING'
        });
        return this.createSpawnAction('po', task, "백로그를 분석하고 우선순위를 보고하세요.");
    }

    // ... (토론 루프) ...
    // (여기서도 logChronicle 호출 시 4종 세트 추가 필요하지만 일단 기본값 사용)
    
    return null;
  }

  // ... (advanceToNextStage 생략) ...

  // [수정] 4종 세트 보장
  private async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    
    const enrichedMetadata = {
        emotion: metadata.emotion || 'Calm', // ❤️ (기본값)
        thought: metadata.thought || '공정 상황을 모니터링하고 있다.', // 🧠
        intent: metadata.intent || 'MODERATE_PROCESS', // ❗️
        ...metadata
    };

    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content,
      metadata: enrichedMetadata
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
