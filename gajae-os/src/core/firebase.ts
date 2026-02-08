import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// .env 로드
dotenv.config();

// 이미 초기화되었는지 확인 (HMR 대응)
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Private Key의 줄바꿈 문자(\n) 처리
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️ Firebase 환경 변수가 설정되지 않았습니다. (FIREBASE_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('🔥 Firebase initialized successfully.');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
}

export const db = admin.firestore();
export const adminApp = admin.app();
