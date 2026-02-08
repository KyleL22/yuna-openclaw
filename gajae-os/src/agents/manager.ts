// ... (상단 Import 생략) ...

  // 다음 단계로 전이
  private async advanceToNextStage(task: Task, docRef: FirebaseFirestore.DocumentReference): Promise<AgentAction | null> {
      let nextStatus: TaskStatus | null = null;
      
      // [Fix] currentStatus를 문자열로 확실하게 매핑
      const currentStatus = task.status;
      
      console.log(`🔄 [Advance] Current: ${currentStatus}`);

      switch (currentStatus) {
          case 'PLAN': nextStatus = TaskStatus.DESIGN; break;
          case 'DESIGN': nextStatus = TaskStatus.DEV; break;
          case 'DEV': nextStatus = TaskStatus.TEST; break;
          case 'TEST': nextStatus = TaskStatus.RELEASE; break;
          case 'RELEASE': nextStatus = TaskStatus.DONE; break;
          default:
              console.error(`❌ [Advance] Unknown Status: ${currentStatus}`);
              return null;
      }

      console.log(`🔄 [Advance] Next: ${nextStatus}`);

      if (nextStatus) {
          await docRef.update({ status: nextStatus, updated_at: new Date().toISOString() });
          await this.logChronicle('MODERATION', `단계 전이: ${currentStatus} -> ${nextStatus}`);
          
          const nextPhase = this.phaseConfig[nextStatus];
          if (nextPhase && nextPhase.members.length > 0) {
              const firstMember = nextPhase.members[0];
              const instruction = `새로운 단계(${nextStatus}) 시작. 목표: ${nextPhase.goal}. 산출물: ${nextPhase.deliverable}. 작업을 시작하세요.`;
              return this.createSpawnAction(firstMember, { ...task, status: nextStatus }, instruction);
          }
      }
      return null;
  }
// ... (나머지 동일) ...
