// ... (상단 Import 생략) ...
export class ManagerAgent {
  // ... (다른 메서드 생략) ...

  // [Fix] Mock 데이터 제거
  private async logChronicle(type: string, content: string, metadata: any = {}) {
    const runId = new Date().toISOString().split('T')[0];
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: this.agentId,
      type: type,
      content: content,
      metadata: metadata // 순정 데이터만 저장
    });
    console.log(`📝 [Log] ${this.agentId}: ${content.slice(0, 30)}...`);
  }
}
