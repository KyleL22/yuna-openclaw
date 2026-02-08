import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../core/firebase';

/**
 * Purge Firestore
 * - system 컬렉션을 제외한 모든 레거시 컬렉션 삭제
 * - tasks, chronicles도 테스트 데이터라면 삭제 (완전 초기화)
 */
async function deleteCollection(collectionPath: string, batchSize: number = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: any) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function purgeAll() {
  console.log('🦞 [Purge] Firestore 대청소를 시작합니다...');

  // 삭제할 컬렉션 목록
  const collectionsToDelete = [
    'commands',
    'sanctuary_core',
    'tasks_dev',
    'tasks', // 테스트 데이터 삭제
    'chronicles', // 테스트 데이터 삭제
    // 'system' // 이건 뇌니까 살려둠
  ];

  for (const col of collectionsToDelete) {
    console.log(`🔥 Deleting collection: ${col}...`);
    await deleteCollection(col);
    console.log(`✅ Deleted: ${col}`);
  }

  console.log('🦞 [Purge] 청소 끝! 깨끗해졌습니다.');
}

// 직접 실행용 (CLI)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  purgeAll().catch(console.error);
}
