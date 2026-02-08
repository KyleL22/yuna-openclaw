import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { POAgent } from '../agents/po';
import { DevAgent } from '../agents/dev';
import { QAAgent } from '../agents/qa';
import { AgentAction } from '../core/openclaw';

// 1. 상태(State) 정의
export interface GraphState {
  messages: string[];
  intent?: 'WORK' | 'CASUAL';
  taskId?: string;
  lastSpeaker?: string;
  actions?: AgentAction[];
  finalResponse?: string;
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();

// 에이전트 매핑 테이블
const agents: Record<string, any> = {
    po: new POAgent(),
    dev: new DevAgent(),
    qa: new QAAgent(),
    // [TODO] ux, ba 등 다른 에이전트 추가 필요
};

// [Node 1] 비서가재
const biseoNode = async (state: GraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  console.log(`🦞 [Graph] 비서가재 호출: "${lastMessage}"`);
  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어') || lastMessage.includes('설계');
  return { intent: isWork ? 'WORK' : 'CASUAL' };
};

// [Node 2] 잡담
const chitchatNode = async (state: GraphState) => ({ finalResponse: "재밌네요! 🦞" });

// [Node 3] 업무 준비 (INBOX 생성)
const prepareNode = async (state: GraphState) => {
  console.log(`👔 [Graph] 업무 모드 진입`);
  const lastMessage = state.messages[state.messages.length - 1];
  const taskId = await biseo.createTask(lastMessage); 
  return { taskId };
};

// [Node 4] 매니저가재 (Central Hub)
const managerNode = async (state: GraphState) => {
    if (!state.taskId) return {};

    const action = await manager.processTask(state.taskId, state.lastSpeaker);
    
    if (!action) {
        return { finalResponse: "모든 공정 처리가 완료되었습니다." }; 
    }

    // 매니저가 'SPAWN_AGENT' 액션을 리턴하면 -> nextSpeaker로 설정
    console.log(`👔 [Graph] 매니저 결정: ${action.agentId} 호출`);
    
    // *주의* 매니저의 Action(Spawn 요청)은 그 자체로 의미가 있지만,
    // workflow 상에서는 '다음 노드(workerNode)'에게 '누굴 실행할지' 알려주는 용도로 쓰임.
    // 여기서는 actions 배열에 추가하지 않고 nextSpeaker만 넘길 수도 있지만,
    // 기록을 위해 actions에도 추가함.
    return { actions: [action], nextSpeaker: action.agentId }; // state에 nextSpeaker 필드 추가 필요 (임시로 actions[last] 활용)
};

// [Node 5] 워커 실행 (Unified Worker Node)
const workerNode = async (state: GraphState) => {
    const lastAction = state.actions?.[state.actions.length - 1];
    if (!lastAction || lastAction.type !== 'SPAWN_AGENT') return {};

    const agentId = lastAction.agentId;
    console.log(`👷 [Graph] Worker Node 진입: ${agentId} 실행`);

    const agent = agents[agentId];
    if (agent) {
        // 1. Agent Logic 실행 (내부적으로 Spawn 요청 생성)
        const action = await agent.processTask(state.taskId);
        
        // 2. 결과 처리
        // 여기서 반환된 action은 '나(Agent)를 Spawn 해줘!'라는 요청임.
        // 실제 런타임(Main Agent)에서는 이 action을 보고 sessions_spawn을 호출함.
        // 지금은 '실행 완료됨'으로 간주하고 루프를 돌리기 위해 lastSpeaker 갱신.
        
        return { 
            actions: action ? [action] : [], 
            lastSpeaker: agentId 
        };
    } else {
        console.warn(`⚠️ [Graph] 알 수 없는 에이전트 ID: ${agentId}`);
        return { lastSpeaker: agentId }; // 에러 방지용 넘김
    }
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    lastSpeaker: { reducer: (a, b) => b ?? a, default: () => undefined },
    actions: { reducer: (a, b) => (a ?? []).concat(b ?? []), default: () => [] },
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('prepare', prepareNode);
builder.addNode('manager', managerNode);
builder.addNode('worker', workerNode);

builder.setEntryPoint('biseo');

builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'prepare' : 'chitchat';
});

builder.addEdge('chitchat', END);
builder.addEdge('prepare', 'manager');

builder.addConditionalEdges('manager', (state) => {
    return state.finalResponse ? END : 'worker';
});

builder.addEdge('worker', 'manager');

export const graph = builder.compile();
