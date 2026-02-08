// ... (상단 Import 생략) ...
export class ManagerAgent {
  // ... (다른 멤버 변수 생략) ...

  // 토론 참여자 정의 (공정별)
  // [Fix] PF 단계에 UX, DEV 추가 (기획 완성도 향상)
  private readonly participants: Record<string, string[]> = {
    [Status.PF]: ['po', 'ux', 'dev'], // 기획: PO(발제) -> UX(경험) -> DEV(가능성) -> PO(정리)
    [Status.FBS]: ['dev', 'po'], // 기술검토: DEV(주도) -> PO(확인)
    [Status.RFD]: ['ux'], // 디자인요청: UX 단독
    [Status.FBD]: ['ux', 'po', 'dev'], // 디자인완료: UX -> PO/DEV 리뷰
    [Status.RFE_RFK]: ['po', 'dev'], // 개발착수승인
    [Status.FUE]: ['dev'], // 개발
    [Status.RFQ]: ['dev', 'qa'], // QA요청
    [Status.FUQ]: ['qa'], // QA진행
    [Status.RFT]: ['qa', 'po'], // 배포승인
    [Status.FUT]: ['dev', 'qa'], // 스테이징
    [Status.FL]: ['po', 'mkt'], // 출시
  };

  // ... (processTask 등 나머지 로직은 그대로 유지) ...
  async processTask(taskId: string, lastSpeaker?: string, intent?: string): Promise<AgentAction | null> {
    const docRef = db.collection('tasks').doc(taskId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    const task = doc.data() as Task;
    const currentStatus = task.status;

    console.log(`👔 [매니저가재] Task 상태: ${currentStatus}, Last Speaker: ${lastSpeaker || 'None'}, Intent: ${intent || '-'}`);

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

    const requiredMembers = this.participants[currentStatus];
    if (requiredMembers) {
        let nextIndex = 0;
        if (lastSpeaker && requiredMembers.includes(lastSpeaker)) {
            nextIndex = requiredMembers.indexOf(lastSpeaker) + 1;
        }

        if (nextIndex < requiredMembers.length) {
            const nextMember = requiredMembers[nextIndex];
            await this.logChronicle('MODERATION', `${currentStatus} 단계 진행을 위해 ${nextMember} 가재에게 발언권을 넘깁니다.`);
            return this.createSpawnAction(nextMember, task, `현재 ${currentStatus} 단계입니다. 이전 내용을 바탕으로 의견을 제시하거나 작업을 수행하세요.`);
        } else {
            console.log(`   -> [완료] ${currentStatus} 단계 작업 완료. CEO 승인 대기.`);
            await this.logChronicle('MODERATION', `${currentStatus} 단계의 모든 작업이 완료되었습니다. CEO 승인을 기다립니다.`);
            return null; 
        }
    }

    return null;
  }
  
  // ... (나머지 메서드 생략) ...
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      switch (task.status) {
          case Status.PF: nextStatus = Status.FBS; break;
          case Status.FBS: nextStatus = Status.RFD; break;
          case Status.RFD: nextStatus = Status.FBD; break;
          case Status.FBD: nextStatus = Status.RFE_RFK; break;
          case Status.RFE_RFK: nextStatus = Status.FUE; break;
          case Status.FUE: nextStatus = Status.RFQ; break;
          case Status.RFQ: nextStatus = Status.FUQ; break;
          case Status.FUQ: nextStatus = Status.RFT; break;
          case Status.RFT: nextStatus = Status.FUT; break;
          case Status.FUT: nextStatus = Status.FL; break;
          case Status.FL: nextStatus = Status.DONE; break;
      }

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          await this.logChronicle('MODERATION', `단계 전이: ${task.status} -> ${nextStatus}`);
          
          const nextMembers = this.participants[nextStatus];
          if (nextMembers && nextMembers.length > 0) {
              return this.createSpawnAction(nextMembers[0], { ...task, status: nextStatus }, "새로운 단계입니다. 작업을 시작하세요.");
          }
      }

      return null;
  }

  private createSpawnAction(agentId: string, task: Task, instruction: string): AgentAction {
      const systemInstruction = `
        [Role] ${agentId}
        [Context] Task: ${task.title} (Status: ${task.status})
        [Instruction] ${instruction}
        
        [Output Format]
        Answer in JSON: { "emotion": "...", "thought": "...", "intent": "...", "response": "..." }
      `;

      return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId: task.id });
  }

  private async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content,
      metadata: metadata
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
