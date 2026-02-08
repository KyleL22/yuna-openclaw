import { StateGraph, END } from '@langchain/langgraph';
import { BiseoAgent } from '../agents/biseo';
import { ManagerAgent } from '../agents/manager';
import { db } from '../core/firebase';

// 1. 상태(State) 정의
// LangGraph가 노드 간에 전달할 데이터 주머니입니다.
export interface GraphState {
  messages: string[]; // 대화 내용
  intent?: 'WORK' | 'CASUAL'; // 비서가재가 판단한 의도
  taskId?: string; // 생성된 Task ID
  finalResponse?: string; // 최종 답변
}

// 2. 노드(Node) 정의
const biseo = new BiseoAgent();
const manager = new ManagerAgent();

// [Node 1] 비서가재: 의도 파악만 수행 (Task 생성 X)
const biseoNode = async (state: GraphState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  console.log(`🦞 [Graph] 비서가재 호출: "${lastMessage}"`);

  // [TODO] 실제로는 LLM을 써서 의도 파악해야 함.
  // 지금은 단순 키워드 매칭으로 Mocking.
  const isWork = lastMessage.includes('개발') || lastMessage.includes('만들어');
  const intent = isWork ? 'WORK' : 'CASUAL';

  return { intent };
};

// [Node 2] 잡담 처리: 그냥 대답하고 끝냄
const chitchatNode = async (state: GraphState) => {
  console.log(`💬 [Graph] 잡담 모드 진입`);
  return { finalResponse: "아, 그건 제가 도와드릴 수 있는 일은 아니지만... 재밌네요! 🦞" };
};

// [Node 3] 업무 처리: 여기서 Task 생성하고 매니저 호출
const workNode = async (state: GraphState) => {
  console.log(`👔 [Graph] 업무 모드 진입 -> Task 생성 시작`);
  
  // 1. Task 생성 (비서가재가 하던 일을 여기서 함)
  const lastMessage = state.messages[state.messages.length - 1];
  const taskId = await biseo.createTask(lastMessage); // BiseoAgent에 createTask 메서드 분리 필요

  // 2. 매니저 호출 (분류 및 스케줄링)
  await manager.processTask(taskId); // ManagerAgent 수정 필요

  return { taskId, finalResponse: `넵, Task(ID:${taskId})로 등록하고 작업을 시작했습니다! 🚀` };
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

builder.setEntryPoint('biseo');

// 분기 조건 (Conditional Edge)
builder.addConditionalEdges('biseo', (state) => {
  return state.intent === 'WORK' ? 'work' : 'chitchat';
});

builder.addEdge('chitchat', END);
builder.addEdge('work', END);

export const graph = builder.compile();
