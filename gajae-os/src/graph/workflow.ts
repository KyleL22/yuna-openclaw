import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { POAgent } from '../agents/po';
import { AgentAction } from '../core/openclaw';

// 1. 상태(State) 정의
export interface GraphState {
  messages: string[];
  intent?: 'WORK' | 'CASUAL';
  taskId?: string;
  action?: AgentAction; // [New] 외부로 내보낼 행동(Spawn 요청 등)
  finalResponse?: string;
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();
const po = new POAgent();

// [Node 1] 비서가재: 의도 파악
const biseoNode = async (state: GraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  console.log(`🦞 [Graph] 비서가재 호출: "${lastMessage}"`);

  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어') || lastMessage.includes('설계');
  const intent = isWork ? 'WORK' : 'CASUAL';

  return { intent };
};

// [Node 2] 잡담 처리
const chitchatNode = async (state: GraphState) => {
  console.log(`💬 [Graph] 잡담 모드 진입`);
  return { finalResponse: "아, 그건 제가 도와드릴 수 있는 일은 아니지만... 재밌네요! 🦞" };
};

// [Node 3] 업무 처리: 비서 -> 매니저 -> (기획)
const workNode = async (state: GraphState) => {
  console.log(`👔 [Graph] 업무 모드 진입 -> Task 생성 시작`);
  
  const lastMessage = state.messages[state.messages.length - 1];
  const taskId = await biseo.createTask(lastMessage); 

  await manager.processTask(taskId); // INBOX -> PF

  return { taskId };
};

// [Node 4] 기획가재: PF -> Spawn PO
const poNode = async (state: GraphState) => {
    if (!state.taskId) return {};
    
    // 직접 일하지 않고 Action을 반환
    const action = await po.processTask(state.taskId);
    
    if (action) {
        return { action, finalResponse: `기획가재(PO)를 호출하여 상세 기획을 진행합니다.` };
    }
    
    return { finalResponse: `이미 처리된 작업이거나 오류가 발생했습니다.` };
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    action: { reducer: (a, b) => b ?? a, default: () => undefined }, // [New]
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('work', workNode);
builder.addNode('po', poNode);

builder.setEntryPoint('biseo');

builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'work' : 'chitchat';
});

builder.addEdge('chitchat', END);
builder.addEdge('work', 'po');
builder.addEdge('po', END);

export const graph = builder.compile();
