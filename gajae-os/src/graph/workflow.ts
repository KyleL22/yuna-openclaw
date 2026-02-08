import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { AgentAction } from '../core/openclaw';

// 1. 상태(State) 정의
export interface GraphState {
  messages: string[];
  intent?: 'WORK' | 'CASUAL';
  taskId?: string;
  lastSpeaker?: string; // [New] 마지막 발언자 (토론 루프용)
  actions?: AgentAction[];
  finalResponse?: string;
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();

// [Node 1] 비서가재: 의도 파악
const biseoNode = async (state: GraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  console.log(`🦞 [Graph] 비서가재 호출: "${lastMessage}"`);
  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어') || lastMessage.includes('설계');
  return { intent: isWork ? 'WORK' : 'CASUAL' };
};

// [Node 2] 잡담 처리
const chitchatNode = async (state: GraphState) => ({ finalResponse: "재밌네요! 🦞" });

// [Node 3] 업무 준비: Task 생성 (INBOX)
const prepareNode = async (state: GraphState) => {
  console.log(`👔 [Graph] 업무 모드 진입`);
  const lastMessage = state.messages[state.messages.length - 1];
  const taskId = await biseo.createTask(lastMessage); 
  return { taskId };
};

// [Node 4] 매니저가재: 토론 주재 (Central Hub)
const managerNode = async (state: GraphState) => {
    if (!state.taskId) return {};

    // 매니저가 다음 행동(Action)을 결정
    const action = await manager.processTask(state.taskId, state.lastSpeaker);
    
    if (!action) {
        // 더 이상 할 일이 없으면 종료
        return { finalResponse: "모든 공정 처리가 완료되었습니다." }; 
    }

    console.log(`👔 [Graph] 매니저 결정: ${action.agentId} 호출`);
    return { actions: [action], nextSpeaker: action.agentId };
};

// [Node 5] 워커 실행 (Mock Execution)
// 실제로는 여기서 OpenClaw Gateway에 Spawn 요청을 보내고 결과를 기다림.
// 지금은 바로 '완료' 처리하고 매니저에게 턴을 넘김.
const workerNode = async (state: GraphState) => {
    const action = state.actions?.[state.actions.length - 1];
    if (!action) return {};

    const agentId = action.agentId;
    console.log(`👷 [Graph] ${agentId} 가재 실행 중... (Mock)`);
    
    // [TODO] 실제 에이전트 실행 대기 로직 필요
    // await openclaw.waitForAgent(agentId);

    // 실행 완료 후, 해당 에이전트를 'lastSpeaker'로 설정하여 매니저에게 보고
    return { lastSpeaker: agentId };
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    lastSpeaker: { reducer: (a, b) => b ?? a, default: () => undefined }, // [New]
    actions: { reducer: (a, b) => (a ?? []).concat(b ?? []), default: () => [] },
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('prepare', prepareNode);
builder.addNode('manager', managerNode); // [Central Hub]
builder.addNode('worker', workerNode);   // [Unified Worker]

builder.setEntryPoint('biseo');

builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'prepare' : 'chitchat';
});

builder.addEdge('chitchat', END);

// 흐름: Prepare -> Manager <-> Worker -> END
builder.addEdge('prepare', 'manager');

builder.addConditionalEdges('manager', (state) => {
    // 할 일이 있으면 Worker로, 없으면(finalResponse) END로
    return state.finalResponse ? END : 'worker';
});

builder.addEdge('worker', 'manager'); // Worker가 끝나면 다시 Manager에게 보고 (Loop)

export const graph = builder.compile();
