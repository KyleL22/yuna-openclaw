import * as dotenv from 'dotenv';
import { db } from '../core/firebase';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// .env 로드
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * Chronicle Log Writer
 * - Usage: npx tsx src/scripts/log_chronicle.ts --speaker "po" --type "AGENT_RESPONSE" --content "..." ...
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('speaker', { type: 'string', demandOption: true })
    .option('type', { type: 'string', demandOption: true }) // AGENT_RESPONSE, AGENT_THOUGHT ...
    .option('content', { type: 'string', demandOption: true })
    .option('emotion', { type: 'string' })
    .option('thought', { type: 'string' })
    .option('intent', { type: 'string' })
    .option('runId', { type: 'string' }) // 선택사항 (없으면 오늘 날짜)
    .parseSync();

  const runId = argv.runId || new Date().toISOString().split('T')[0];

  const metadata = {
    emotion: argv.emotion,
    thought: argv.thought,
    intent: argv.intent
  };

  // undefined 필드 제거
  Object.keys(metadata).forEach(key => (metadata as any)[key] === undefined && delete (metadata as any)[key]);

  try {
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: argv.speaker,
      type: argv.type,
      content: argv.content,
      metadata: metadata
    });
    console.log(`✅ [Log] Saved chronicle for ${argv.speaker}`);
  } catch (error) {
    console.error(`❌ [Log] Failed:`, error);
    process.exit(1);
  }
}

main();
