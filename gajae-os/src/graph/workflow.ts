import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { POAgent } from '../agents/po';

// 1. 상태(State) 정의
export interface GraphState {
  messages: string[];
  intent?: 'WORK' | 'CASUAL';
  taskId?: string;
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

  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어');
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

// [Node 4] 기획가재: PF -> RFE_RFK
const poNode = async (state: GraphState) => {
    if (!state.taskId) return {};
    
    await po.processTask(state.taskId);
    return { finalResponse: `💡 [기획 완료] 기획서 작성이 완료되었습니다. 승인 대기 중(RFE_RFK).` };
};

// 3. 그래프 구성
const builder = new StateGraph<GraphState>({
  channels: {
    messages: { reducer: (a: string[], b: string[]) => a.concat(b), default: () => [] },
    intent: { reducer: (a, b) => b ?? a, default: () => undefined },
    taskId: { reducer: (a, b) => b ?? a, default: () => undefined },
    finalResponse: { reducer: (a, b) => b ?? a, default: () => undefined },
  }
});

builder.addNode('biseo', biseoNode);
builder.addNode('chitchat', chitchatNode);
builder.addNode('work', workNode);
builder.addNode('po', poNode); // PO 노드 추가

builder.setEntryPoint('biseo');

// 분기 조건
builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'work' : 'chitchat';
});

builder.addEdge('chitchat', END);
// [핵심] work(매니저) -> po(기획) -> END
builder.addEdge('work', 'po');
builder.addEdge('po', END);

export const graph = builder.compile();
