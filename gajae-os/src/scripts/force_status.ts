import * as dotenv from 'dotenv';
import { db } from '../core/firebase';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// .env 로드
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/**
 * Force Update Task Status
 * - Usage: npx tsx force_status.ts --taskId "..." --status "DEV"
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('taskId', { type: 'string', demandOption: true })
    .option('status', { type: 'string', demandOption: true })
    .parseSync();

  try {
    await db.collection('tasks').doc(argv.taskId).update({
        status: argv.status,
        updated_at: new Date().toISOString()
    });
    console.log(`✅ Task(${argv.taskId}) status updated to ${argv.status}`);
  } catch (error) {
    console.error(`❌ Failed to update status:`, error);
    process.exit(1);
  }
}

main();
