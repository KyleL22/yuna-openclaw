import * as dotenv from 'dotenv';
import { graph } from './graph/workflow';
import { db } from './core/firebase';

// .env 로드
dotenv.config();

/**
 * Gajae OS Entry Point - Approval Flow Test
 */
async function main() {
  console.log('🦞 [Gajae OS] System Booting...');

  // [Step 1] CEO의 업무 지시
  const inputWork = {
    messages: ["시스템 설계를 만들어야 해."]
  };

  console.log('\n--- [Step 1] 업무 지시 ---');
  const result1 = await graph.invoke(inputWork);
  console.log('📝 [Result]', result1);

  // 여기서 PO가 초안을 만들고 매니저가 'CEO 승인 대기' 상태가 되었다고 가정.
  // 실제로는 result1.taskId를 받아서 다음 단계에 써야 함.
  const taskId = result1.taskId;

  if (taskId) {
      console.log(`\n⏳ [Wait] CEO가 보고서를 검토 중입니다... (Task ID: ${taskId})`);
      
      // [Step 2] CEO 승인
      // *주의* 매니저가재는 'CEO_APPROVE'라는 intent를 인식해야 함.
      // 현재 workflow.ts의 biseoNode는 'WORK'/'CASUAL'만 판단하므로, 
      // 'APPROVE'를 별도로 판단하거나, 매니저에게 직접 intent를 주입해야 함.
      
      // 여기서는 biseoNode를 거치지 않고, 매니저 노드에 직접 값을 주입하는 상황을 가정하거나
      // biseoNode를 업그레이드해야 함. 
      
      // 일단 biseoNode 로직상 '진행해', '좋아' 등도 WORK로 인식될 테니,
      // 매니저가재가 context를 보고 "어? 지금 승인 대기 중인데 WORK가 들어왔네? 내용 보니 승인이네?" 라고 판단해야 함.
      
      console.log('\n--- [Step 2] CEO 승인 ("그래 진행해") ---');
      
      // 워크플로우를 다시 실행 (taskId 유지)
      const inputApprove = {
          messages: ["그래 진행해"],
          taskId: taskId, // 기존 Task ID 전달 (문맥 유지)
          intent: 'WORK' // 강제 주입 (비서가재 건너뛰기 or 비서가재가 판단했다고 가정)
      };

      // *중요* 매니저가재 코드에 'intent' 파라미터를 처리하는 로직은 있는데,
      // graph state에서 intent가 'CEO_APPROVE'로 변환되어 전달되는 로직이 필요함.
      // 지금은 단순 텍스트("그래 진행해")만으로는 매니저가 'CEO_APPROVE'라고 인식을 못할 수 있음.
      // -> ManagerAgent.ts의 processTask에서 LLM을 써서 판단하거나,
      //    여기서는 테스트를 위해 intent를 'CEO_APPROVE'로 강제 주입.

      const result2 = await graph.invoke({
          ...inputApprove,
          intent: 'CEO_APPROVE' as any // (Type casting for test)
      });
      console.log('📝 [Result]', result2);
  }

  console.log('\n🦞 [Gajae OS] System Shutdown.');
}

main().catch(console.error);
