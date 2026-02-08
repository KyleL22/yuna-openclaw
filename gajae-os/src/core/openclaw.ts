export interface AgentAction {
  type: 'SPAWN_AGENT' | 'ASK_LLM'; // [New] ASK_LLM 추가
  agentId?: string; // SPAWN 시 사용
  task?: string; // SPAWN 시 사용
  prompt?: string; // ASK_LLM 시 사용
  context?: any;
}

/**
 * OpenClaw Action Planner
 * - 역할: 직접 API를 호출하는 대신, Main Agent가 수행해야 할 행동(Action)을 반환함.
 */
export class OpenClawClient {
  
  // Spawn 요청 객체 생성
  spawnAgent(agentId: string, task: string, context?: any): AgentAction {
    console.log(`🦞 [Plan] Requesting Spawn: ${agentId}`);
    return {
      type: 'SPAWN_AGENT',
      agentId,
      task,
      context
    };
  }

  // [New] LLM 판단 요청 객체 생성
  askLLM(prompt: string, context?: any): AgentAction {
      console.log(`🧠 [Plan] Requesting LLM Judgment...`);
      return {
          type: 'ASK_LLM',
          prompt,
          context
      };
  }
}
