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
  nextSpeaker?: string; // [Fix] 필드 추가
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

    // lastSpeaker는 이전 턴의 workerNode에서 갱신됨
    const action = await manager.processTask(state.taskId, state.lastSpeaker);
    
    if (!action) {
        return { finalResponse: "모든 공정 처리가 완료되었습니다." }; 
    }

    console.log(`👔 [Graph] 매니저 결정: ${action.agentId} 호출`);
    
    // nextSpeaker 설정 -> workerNode가 이걸 보고 실행함
    return { actions: [action], nextSpeaker: action.agentId }; 
};

// [Node 5] 워커 실행 (Unified Worker Node)
const workerNode = async (state: GraphState) => {
    // managerNode가 설정한 nextSpeaker를 가져옴
    const agentId = state.nextSpeaker; 
    
    if (!agentId) {
        console.warn(`⚠️ [Graph] Worker Node 진입했으나 실행할 에이전트 ID가 없습니다.`);
        return {};
    }

    console.log(`👷 [Graph] Worker Node 진입: ${agentId} 실행`);

    const agent = agents[agentId];
    if (agent) {
        // Agent Logic 실행
        const action = await agent.processTask(state.taskId);
        
        // 실행 완료 후, 해당 에이전트를 'lastSpeaker'로 설정하여 매니저에게 보고
        // (actions에 추가하는 건 선택사항, 이미 manager가 추가했으면 중복일 수 있음)
        return { 
            // actions: action ? [action] : [], // 중복 방지를 위해 생략 가능하나, 에이전트 내부 로직상 필요하다면 유지
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
    nextSpeaker: { reducer: (a, b) => b ?? a, default: () => undefined }, // [Fix] Reducer 추가
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
