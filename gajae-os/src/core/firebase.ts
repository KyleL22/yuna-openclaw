import admin from 'firebase-admin'; // * as admin 대신 default import 시도
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 로드
const envPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath });

console.log('🔍 [Firebase] Loading .env from:', envPath);
console.log('🔍 [Firebase] Project ID:', process.env.FIREBASE_PROJECT_ID || 'UNDEFINED');
console.log('🔍 [Firebase] Client Email:', process.env.FIREBASE_CLIENT_EMAIL || 'UNDEFINED');
console.log('🔍 [Firebase] Private Key Exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Mock DB
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
  // admin.apps 체크 로직 개선
  const apps = admin.apps || []; 

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
        console.log('⚠️ (Mock Mode) Firebase 키 누락. (ProjectID, Email, Key 중 하나 이상 없음)');
    }
  } else {
      // 이미 초기화됨
      dbInstance = admin.firestore();
      console.log('🔥 Firebase already initialized.');
  }
} catch (error) {
  console.log('⚠️ (Mock Mode) Firebase 초기화 중 에러 발생:', error);
  // console.error(error); // 필요시 주석 해제
}

export const db = dbInstance;
