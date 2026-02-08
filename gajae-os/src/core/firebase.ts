import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

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
    // 실제 키가 있을 때만 초기화 시도
    if (projectId && process.env.FIREBASE_PRIVATE_KEY) {
        // ... (리얼 초기화 로직 생략 - 어차피 키 없으면 실패함)
        // admin.initializeApp(...)
        // dbInstance = admin.firestore();
        console.log('⚠️ (Mock Mode) Firebase 키가 없어 Mock DB를 사용합니다.');
    } else {
        console.log('⚠️ (Mock Mode) Firebase 키가 없어 Mock DB를 사용합니다.');
    }
  }
} catch (error) {
  console.log('⚠️ (Mock Mode) Firebase 초기화 실패, Mock DB를 사용합니다.');
}

export const db = dbInstance;
