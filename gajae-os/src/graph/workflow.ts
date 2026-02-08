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
  actions?: AgentAction[]; // [Mod] 여러 액션을 순차적으로 담을 수 있게 배열로 변경 고려 (일단은 덮어쓰기)
  finalResponse?: string;
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();
const po = new POAgent();
const dev = new DevAgent();
const qa = new QAAgent();

// [Node 1] 비서가재: 의도 파악
const biseoNode = async (state: GraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  console.log(`🦞 [Graph] 비서가재 호출: "${lastMessage}"`);
  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어') || lastMessage.includes('설계');
  return { intent: isWork ? 'WORK' : 'CASUAL' };
};

// [Node 2] 잡담 처리
const chitchatNode = async (state: GraphState) => ({ finalResponse: "재밌네요! 🦞" });

// [Node 3] 업무 처리: 비서 -> 매니저 -> (기획)
const workNode = async (state: GraphState) => {
  console.log(`👔 [Graph] 업무 모드 진입`);
  const lastMessage = state.messages[state.messages.length - 1];
  const taskId = await biseo.createTask(lastMessage); 
  await manager.processTask(taskId); // INBOX -> PF
  return { taskId };
};

// [Node 4] 기획가재: PF -> Spawn PO
const poNode = async (state: GraphState) => {
    if (!state.taskId) return {};
    const action = await po.processTask(state.taskId);
    // [TODO] 여기서 실제로는 Spawn된 Agent가 끝나길 기다려야 함 (비동기).
    // 지금은 '지시 내림' -> '바로 다음 단계로' (Fast Forward Mocking)
    return { actions: action ? [action] : [] };
};

// [Node 5] 개발가재: FUE -> Spawn DEV
const devNode = async (state: GraphState) => {
    if (!state.taskId) return {};
    const action = await dev.processTask(state.taskId);
    return { actions: action ? [action] : [] };
};

// [Node 6] 품질가재: RFQ -> Spawn QA
const qaNode = async (state: GraphState) => {
    if (!state.taskId) return {};
    const action = await qa.processTask(state.taskId);
    return { 
        actions: action ? [action] : [],
        finalResponse: '모든 공정(기획->개발->품질)에 대한 작업 지시가 완료되었습니다. 각 에이전트가 순차적으로 실행될 것입니다.'
    };
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    actions: { reducer: (a: AgentAction[], b: AgentAction[]) => (a ?? []).concat(b ?? []), default: () => [] }, // Accumulate actions
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('work', workNode);
builder.addNode('po', poNode);
builder.addNode('dev', devNode);
builder.addNode('qa', qaNode);

builder.setEntryPoint('biseo');

builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'work' : 'chitchat';
});

builder.addEdge('chitchat', END);

// [핵심 파이프라인] work -> po -> dev -> qa -> END
// * 주의: 실제 런타임에선 각 단계마다 'Human Approval'이나 'Agent Completion' 대기가 필요함.
// * 지금은 로직 검증을 위해 straight로 연결.
builder.addEdge('work', 'po');
builder.addEdge('po', 'dev');
builder.addEdge('dev', 'qa');
builder.addEdge('qa', END);

export const graph = builder.compile();
