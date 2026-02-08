import * as dotenv from 'dotenv';
import { graph } from './graph/workflow';
import * as path from 'path';

// .env 로드 (루트)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * Gajae OS CLI Entry Point
 * - Usage: npx tsx src/cli.ts "명령어"
 * - Output: JSON String (stdout)
 */
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.error('Usage: npx tsx src/cli.ts "<command>"');
    process.exit(1);
  }

  // 로그는 stderr로 출력 (stdout은 순수 JSON을 위해 비워둠)
  const originalLog = console.log;
  console.log = console.error; 

  try {
    const input = { messages: [command] };
    const result = await graph.invoke(input);

    // 결과만 stdout으로 출력
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ [Gajae OS] Error:', error);
    process.exit(1);
  }
}

main();
