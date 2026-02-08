import * as dotenv from 'dotenv';
import { graph } from './graph/workflow';

// .env 로드
dotenv.config();

/**
 * Gajae OS Entry Point
 * - 로컬 테스트용 진입점
 */
async function main() {
  console.log('🦞 [Gajae OS] System Booting...');

  // 1. 테스트 케이스: 업무 지시
  const inputWork = {
    messages: ["로그인 기능 빨리 만들어줘!"]
  };

  console.log('\n--- [TEST 1] 업무 지시 테스트 ---');
  const result1 = await graph.invoke(inputWork);
  console.log('📝 [Result]', result1);

  // 2. 테스트 케이스: 잡담
  const inputCasual = {
    messages: ["오늘 점심 뭐 먹지?"]
  };

  console.log('\n--- [TEST 2] 잡담 테스트 ---');
  const result2 = await graph.invoke(inputCasual);
  console.log('📝 [Result]', result2);
  
  console.log('\n🦞 [Gajae OS] System Shutdown.');
}

main().catch(console.error);
