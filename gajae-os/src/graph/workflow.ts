import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { POAgent } from '../agents/po';
import { DevAgent } from '../agents/dev';
import { QAAgent } from '../agents/qa';
import { UXAgent } from '../agents/ux';
import { BAAgent } from '../agents/ba';
import { HRAgent } from '../agents/hr';
import { MKTAgent } from '../agents/mkt';
import { LegalAgent } from '../agents/legal';
import { CSAgent } from '../agents/cs';
import { AgentAction } from '../core/openclaw';

// 1. 상태(State) 정의
export interface GraphState {
  messages: string[];
  intent?: 'WORK' | 'CASUAL' | 'CEO_APPROVE'; 
  taskId?: string;
  lastSpeaker?: string;
  nextSpeaker?: string;
  actions?: AgentAction[];
  llmAnswer?: string; // [New] LLM 판단 결과 주입
  finalResponse?: string;
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();

const agents: Record<string, any> = {
    po: new POAgent(),
    dev: new DevAgent(),
    qa: new QAAgent(),
    ux: new UXAgent(),
    ba: new BAAgent(),
    hr: new HRAgent(),
    mkt: new MKTAgent(),
    legal: new LegalAgent(),
    cs: new CSAgent(),
};

// [Node 1] 비서가재
const biseoNode = async (state: GraphState) => {
  // taskId가 있으면 이미 처리된 명령이거나 승인 건이므로 패스
  if (state.taskId && state.intent) {
      return {}; 
  }

  const lastMessage = state.messages[state.messages.length - 1];
  
  // [Fix] processMessage에 llmAnswer 전달
  const result = await biseo.processMessage(lastMessage, state.llmAnswer);

  // 결과가 Action(ASK_LLM)이면 바로 리턴
  if (result?.action) {
      return { actions: [result.action] };
  }

  // 의도 파악 완료되었으면
  if (result?.intent) {
      return { intent: result.intent as any, taskId: result.taskId };
  }

  return {};
};

// [Node 2] 잡담
const chitchatNode = async (state: GraphState) => ({ finalResponse: "재밌네요! 🦞" });

// [Node 3] 업무 준비 (INBOX 생성) - biseoNode 안에서 처리되므로 사실상 필요 없음/단순화 가능
const prepareNode = async (state: GraphState) => {
  // 이미 biseoNode에서 처리됨 (taskId 생성됨)
  return {};
};

// [Node 4] 매니저가재
const managerNode = async (state: GraphState) => {
    if (!state.taskId) return {};

    // [Fix] llmAnswer 전달
    const action = await manager.processTask(state.taskId, state.lastSpeaker, state.intent, state.llmAnswer);
    
    if (!action) {
        return { finalResponse: "대기 중이거나 처리가 완료되었습니다." }; 
    }

    // ASK_LLM 액션이면 actions에 담고 리턴 (다음 노드 실행 X)
    if (action.type === 'ASK_LLM') {
        return { actions: [action] };
    }

    // SPAWN_AGENT 액션이면 nextSpeaker 설정
    console.log(`👔 [Graph] 매니저 결정: ${action.agentId} 호출`);
    return { actions: [action], nextSpeaker: action.agentId }; 
};

// [Node 5] 워커 실행
const workerNode = async (state: GraphState) => {
    const agentId = state.nextSpeaker; 
    
    if (!agentId) return {};

    const agent = agents[agentId];
    if (agent) {
        const action = await agent.processTask(state.taskId);
        return { 
            actions: action ? [action] : [], 
            lastSpeaker: agentId 
        };
    } else {
        return { lastSpeaker: agentId }; 
    }
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    lastSpeaker: { reducer: (a, b) => b ?? a, default: () => undefined },
    nextSpeaker: { reducer: (a, b) => b ?? a, default: () => undefined },
    actions: { reducer: (a, b) => (a ?? []).concat(b ?? []), default: () => [] }, // Action은 계속 쌓이지 않고 덮어써도 됨 (사실상) - 일단 concat 유지
    llmAnswer: { reducer: (a, b) => b ?? a, default: () => undefined }, // [New]
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('prepare', prepareNode); // (Legacy, but kept for structure)
builder.addNode('manager', managerNode);
builder.addNode('worker', workerNode);

builder.setEntryPoint('biseo');

builder.addConditionalEdges('biseo', (state) => {
    // ASK_LLM 액션이 있으면 END로 가서 Main Agent에게 질문 전달
    const lastAction = state.actions?.[state.actions.length - 1];
    if (lastAction?.type === 'ASK_LLM') return END;

    if (state.intent === 'CEO_APPROVE') return 'prepare';
    return state.intent === 'WORK' ? 'prepare' : 'chitchat';
});

builder.addEdge('chitchat', END);
builder.addEdge('prepare', 'manager');

builder.addConditionalEdges('manager', (state) => {
    // ASK_LLM 액션이 있으면 END
    const lastAction = state.actions?.[state.actions.length - 1];
    if (lastAction?.type === 'ASK_LLM') return END;

    return state.finalResponse ? END : 'worker';
});

builder.addEdge('worker', END); 

export const graph = builder.compile();
