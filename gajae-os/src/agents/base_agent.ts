// ... (상단 Import 생략) ...

export class BaseAgent {
  // ... (기존 코드) ...

  protected async loadContextAndSpawn(agentId: string, taskId: string, customInstruction: string): Promise<AgentAction> {
    // ... (DB 조회) ...

    // [Gajae Company Constitution: 15 Leadership Principles]
    // ... (생략) ...

    const persona = personas[agentId] || `[Role] ${agentId}`;

    const systemInstruction = `
      ${leadershipPrinciples}
      
      ${persona}
      
      [CRITICAL RULES]
      1. **LANGUAGE:** 당신은 한국 기업의 직원이다. **무조건 한국어(Korean)**만 사용하라. 영어를 쓰면 해고된다. (Technical terms like 'React', 'API' are okay).
      2. **TONE:** 각자의 Persona(LP)에 맞춰서 연기하라. 점잖게 굴지 말고 치열하게 논쟁하라.
      3. **OUTPUT:** 텔레그램 메시지 포맷([Prefix] ...)을 지켜라.
      
      [Task Context]
      - Task Title: ${task.title}
      - Status: ${task.status}
      
      [Mission]
      ${customInstruction}
    `;

    return this.openclaw.spawnAgent(agentId, systemInstruction, { taskId });
  }
}
