import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../core/firebase';

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
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function purgeAll() {
  console.log('🦞 [Purge] Firestore 대청소를 시작합니다...');

  const collectionsToDelete = [
    'tasks',
    'chronicles',
    'epics',
    'projects' // 만약 만들었다면
  ];

  for (const col of collectionsToDelete) {
    console.log(`🔥 Deleting collection: ${col}...`);
    await deleteCollection(col);
    console.log(`✅ Deleted: ${col}`);
  }

  console.log('🦞 [Purge] 청소 끝! 깨끗해졌습니다.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  purgeAll().catch(console.error);
}
