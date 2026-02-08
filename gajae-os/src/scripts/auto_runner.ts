import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

// [Mock Main Agent]
// 실제로는 OpenClaw Main Agent가 이 역할을 하지만,
// 여기서는 스크립트가 Main Agent를 흉내내어 루프를 돌림.
// (sessions_spawn은 여기서 호출 불가하므로 로그로만 출력)

async function runGajaeOS(command: string, args: Record<string, any> = {}) {
  const cliPath = path.resolve(__dirname, '../cli.ts');
  let cmd = `npx tsx ${cliPath} "${command}"`;
  
  if (args.taskId) cmd += ` --taskId "${args.taskId}"`;
  if (args.answer) cmd += ` --answer '${JSON.stringify(args.answer)}'`; // JSON stringify 주의
  if (args.lastSpeaker) cmd += ` --lastSpeaker "${args.lastSpeaker}"`;

  console.log(`Running: ${cmd}`);
  const { stdout } = await execAsync(cmd);
  return JSON.parse(stdout);
}

async function autoLoop(initialCommand: string) {
  let currentCommand = initialCommand;
  let context: any = {};
  
  console.log(`🦞 [AutoRunner] Start: "${initialCommand}"`);

  while (true) {
    // 1. gajae-os 실행
    const result = await runGajaeOS(currentCommand, context);
    console.log('📦 [Result]', JSON.stringify(result, null, 2));

    // 2. 결과 분석
    if (result.finalResponse) {
        console.log(`✅ [Finished] ${result.finalResponse}`);
        break; // 루프 종료 (승인 대기 or 완료)
    }

    // Context 업데이트
    if (result.taskId) context.taskId = result.taskId;

    const action = result.actions?.[0];
    if (!action) {
        console.warn('⚠️ No action returned. Stopping.');
        break;
    }

    // 3. Action 수행 (Main Agent 역할)
    if (action.type === 'ASK_LLM') {
        console.log(`🧠 [Main] Thinking about: ${action.prompt}`);
        // [Mock LLM] 상황에 맞는 답변 생성 (여기선 하드코딩 예시)
        let answer = "WORK"; 
        if (action.context?.step === 'DECIDE_NEXT_STEP') {
            // 매니저의 질문: "다음 누구 부를까?" -> "PO 불러" (예시)
            answer = JSON.stringify({ action: 'CALL', target: 'po', instruction: '작업해' });
        }
        context.answer = answer;
        context.lastSpeaker = null;
    } 
    else if (action.type === 'SPAWN_AGENT') {
        console.log(`🔥 [Main] Spawning Agent: ${action.agentId}`);
        // [Mock Spawn] 실제로는 sessions_spawn 호출
        // 여기선 "에이전트가 일을 마쳤다"고 가정하고 다음으로 넘어감
        context.answer = null;
        context.lastSpeaker = action.agentId; // 발언자 갱신
        
        // [Break Condition] 한 공정이 끝났는지 체크하는 로직이 필요하지만,
        // 여기선 PO 한 번 실행하고 멈추는 걸로 시뮬레이션
        console.log(`✅ [Main] Agent ${action.agentId} finished work.`);
    }
  }
}

// 실행
autoLoop("시스템 설계를 만들어야 해.");
