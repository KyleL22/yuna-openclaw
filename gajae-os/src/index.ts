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

  // [TEST 1] CEO의 실제 명령
  // "시스템 설계를 만들어야 해. 우리 대화 내용, 가재들 생각, 내가 DB로 볼 수 있게."
  const inputWork = {
    messages: ["시스템 설계를 만들어야 해. 우리 대화 내용, 가재들 생각, 내가 DB로 볼 수 있게."]
  };

  console.log('\n--- [TEST 1] 업무 지시 테스트 ---');
  const result1 = await graph.invoke(inputWork);
  console.log('📝 [Result]', result1);

  console.log('\n🦞 [Gajae OS] System Shutdown.');
}

main().catch(console.error);
