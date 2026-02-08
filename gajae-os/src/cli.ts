import * as dotenv from 'dotenv';
import { graph } from './graph/workflow';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * Gajae OS CLI Entry Point
 * - Usage: npx tsx src/cli.ts "<command>" [--taskId <id>] [--answer <text>]
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('taskId', { type: 'string' })
    .option('answer', { type: 'string' })
    .parseSync();

  const command = argv._[0] as string;

  // 로그는 stderr로 출력
  const originalLog = console.log;
  console.log = console.error; 

  try {
    const input: any = { 
        messages: command ? [command] : [],
        taskId: argv.taskId,
        llmAnswer: argv.answer // [New] LLM 답변 주입
    };

    const result = await graph.invoke(input);

    // 결과만 stdout으로 출력
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ [Gajae OS] Error:', error);
    process.exit(1);
  }
}

main();
