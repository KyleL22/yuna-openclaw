import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../core/firebase';

/**
 * DB Inspector
 * - 현재 DB에 쌓인 Tasks와 Chronicles 상태를 점검
 */
async function inspect() {
  console.log('🦞 [Inspect] DB 상태 점검 시작...');

  // 1. Tasks 확인
  const tasksSnap = await db.collection('tasks').orderBy('created_at', 'desc').get();
  console.log(`\n📂 Tasks Found: ${tasksSnap.size}건`);
  
  tasksSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   - [${data.status}] ${data.title} (ID: ${doc.id})`);
  });

  // 2. Chronicles 확인
  const logsSnap = await db.collection('chronicles').orderBy('timestamp', 'desc').limit(10).get();
  console.log(`\n📜 Recent Chronicles (Last 10):`);
  
  logsSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   - [${data.type}] ${data.speaker_id}: ${data.content.slice(0, 50)}...`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  inspect().catch(console.error);
}
