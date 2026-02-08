import * as dotenv from 'dotenv';
import { db } from '../core/firebase';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// .env 로드
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * Save Agent Result Script
 * - Usage: npx tsx save_agent_result.ts --agentId "po" --json '{...}'
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('agentId', { type: 'string', demandOption: true })
    .option('json', { type: 'string', demandOption: true })
    .parseSync();

  try {
    const data = JSON.parse(argv.json);
    
    // 1. Chronicle 저장
    const runId = new Date().toISOString().split('T')[0];
    await db.collection('chronicles').add({
      run_id: runId,
      timestamp: new Date().toISOString(),
      speaker_id: argv.agentId,
      type: 'AGENT_RESPONSE', // 또는 AGENT_DISCUSSION
      content: data.response || '(No Content)',
      metadata: {
          emotion: data.emotion,
          thought: data.thought,
          intent: data.intent
      }
    });
    console.log(`✅ [Log] Chronicle saved for ${argv.agentId}`);

    // 2. Artifacts 저장
    if (data.artifacts && Array.isArray(data.artifacts)) {
        // Epic ID를 알아야 하는데, 여기서는 편의상 'E001-default' 또는 Task Context에서 가져와야 함.
        // 일단은 'UNKNOWN-EPIC'으로 저장하거나, JSON 안에 epicId를 포함시켜야 함.
        // (여기서는 단순화를 위해 로그만 찍음 or 별도 처리)
        console.log(`⚠️ [Artifact] Artifacts found (${data.artifacts.length}), but skipping DB save (Epic ID unknown).`);
    }

  } catch (error) {
    console.error(`❌ [Error] Failed to save result:`, error);
    process.exit(1);
  }
}

main();
