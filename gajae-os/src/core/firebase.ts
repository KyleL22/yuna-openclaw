import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 로드 (프로젝트 루트의 .env를 바라봄)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Mock DB (DB 연결 실패 시 사용)
const mockDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => console.log(`[MockDB] set ${name}/${id}:`, data),
      get: async () => ({ exists: true, data: () => ({ title: 'Mock Task' }) }),
      update: async (data: any) => console.log(`[MockDB] update ${name}/${id}:`, data),
    }),
    add: async (data: any) => console.log(`[MockDB] add ${name}:`, data),
  })
};

let dbInstance: any = mockDb;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // 실제 키가 있을 때만 초기화 시도
    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        dbInstance = admin.firestore();
        console.log('🔥 Firebase initialized successfully (Real DB).');
    } else {
        console.log('⚠️ (Mock Mode) Firebase 키가 없어 Mock DB를 사용합니다.');
    }
  } else {
      // 이미 초기화된 경우 (HMR 등)
      dbInstance = admin.firestore();
  }
} catch (error) {
  console.log('⚠️ (Mock Mode) Firebase 초기화 실패, Mock DB를 사용합니다.');
  console.error(error);
}

export const db = dbInstance;
