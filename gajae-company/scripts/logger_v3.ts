import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

/**
 * [가재 컴퍼니] Standard Intelligence Logger (v3.0)
 * 의도: 대표님의 지시에 따라 '멀티 뷰(미팅 열림, 카드뷰, 영향 분석 등)'를 지원하는 구조화된 데이터 로깅.
 */

const SERVICE_ACCOUNT_PATH = '/Users/openclaw-kong/.openclaw/workspace/firebase-service-account.json';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error("❌ Error: Firebase Service Account key not found.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

if (!firebase_admin.apps.length) {
    initializeApp({
        credential: cert(serviceAccount),
        projectId: 'gajae-company-bip'
    });
}

const db = getFirestore();

export class IntelligenceLogger {
    /**
     * View 1: 미팅 세션 생성 (Open Meeting)
     */
    static async openMeeting(topic: string, participants: string[]) {
        const now = new Date();
        const docId = `meet-${now.getTime()}`;
        const data = {
            id: docId,
            type: 'meeting',
            topic,
            date: now.toISOString().split('T')[0].replace(/-/g, ''),
            time: now.toTimeString().split(' ')[0],
            participants,
            activities: [],
            status: 'open',
            createdAt: FieldValue.serverTimestamp()
        };
        await db.collection('meetings').doc(docId).set(data);
        console.log(`🚀 Meeting Opened: ${docId}`);
        return docId;
    }

    /**
     * View 2: 지능 카드 추가 (Intelligence Card View)
     */
    static async addActivity(meetingId: string, activity: any) {
        await db.collection('meetings').doc(meetingId).update({
            activities: FieldValue.arrayUnion(activity)
        });
        console.log(`✅ Activity Added to ${meetingId}`);
    }

    /**
     * View 3 & 4: 미팅 종료 및 영향 분석 (Close & Impact)
     */
    static async closeMeeting(meetingId: string, impacts: any[], finalDecision: string) {
        await db.collection('meetings').doc(meetingId).update({
            impacts,
            finalDecision,
            status: 'closed'
        });
        console.log(`🏁 Meeting Closed: ${meetingId}`);
    }

    /**
     * View 5 & 6: 정기 보고 및 감사 (Periodic Reports)
     */
    static async logReport(type: 'report' | 'audit', title: string, content: string, metadata: any) {
        const now = new Date();
        const docId = `${type}-${now.getTime()}`;
        const data = {
            id: docId,
            type,
            title,
            content,
            metadata,
            date: now.toISOString().split('T')[0].replace(/-/g, ''),
            time: now.toTimeString().split(' ')[0],
            createdAt: FieldValue.serverTimestamp()
        };
        await db.collection('meetings').doc(docId).set(data);
        console.log(`📊 Report Persisted: ${docId}`);
    }
}
