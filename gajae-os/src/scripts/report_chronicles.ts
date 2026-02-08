import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../core/firebase';

async function report() {
  console.log('🦞 [Report] 전체 Chronicle 로그를 조회합니다...\n');

  const snapshot = await db.collection('chronicles')
    .orderBy('timestamp', 'asc') // 시간순 정렬
    .get();

  if (snapshot.empty) {
    console.log('(No logs found)');
    return;
  }

  snapshot.docs.forEach(doc => {
    const d = doc.data();
    const meta = d.metadata || {};
    
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`⏰ [${d.timestamp}] 🗣️ ${d.speaker_id} (${d.type})`);
    
    if (meta.emotion) console.log(`❤️ 심리: ${meta.emotion}`);
    if (meta.thought) console.log(`🧠 생각: ${meta.thought}`);
    if (meta.intent)  console.log(`❗️ 의도: ${meta.intent}`);
    
    console.log(`\n💬 답변:\n${d.content}`);
    console.log(`--------------------------------------------------------------------------------\n`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  report().catch(console.error);
}
