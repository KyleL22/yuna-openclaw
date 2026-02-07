import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

/**
 * [가재 컴퍼니] Standard Intelligence Migrator (v5.2 - Process First)
 * 의도: 모든 데이터를 소거하고, '공정(Steps)'이 최우선으로 생성되는 구조로 성역을 재구축함.
 */

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clear() {
    const cols = ['commands', 'activities', 'meetings'];
    for (const name of cols) {
        const snap = await getDocs(collection(db, name));
        for (const d of snap.docs) { await deleteDoc(d.ref); }
    }
}

function parseFivefold(content: string) {
    const extract = (regex: RegExp) => {
        const match = content.match(regex);
        return match ? match[1].trim() : "";
    };
    return {
        intent: extract(/(?:\d\. |### 1\. )\*\*의도\s?\(Intention\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)/),
        psychology: extract(/(?:\d\. |### 2\. )\*\*심리\s?\(Psychology\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)/),
        thought: extract(/(?:\d\. |### 3\. )\*\*생각\s?\(Thought\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)/),
        action: extract(/(?:\d\. |### 4\. )\*\*행동\s?\(Action\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)/),
        response: extract(/(?:\d\. |### 5\. )\*\*답변\s?\(Response.*?\)\*\*:\s?([\s\S]*?)(?=\n(?:\d\.|### \d\.)|$)/)
    };
}

async function start() {
    console.log("🔥 Starting Process-First Sanctuary Re-Sync...");
    await clear();

    const workspaceRoot = '/Users/openclaw-kong/.openclaw/workspace/';
    const dailyBase = path.join(workspaceRoot, 'docs/chronicle/daily');
    const dates = fs.readdirSync(dailyBase).filter(f => {
        try { return fs.statSync(path.join(dailyBase, f)).isDirectory(); } catch (e) { return false; }
    });

    for (const date of dates) {
        const dateKey = date.replace(/-/g, '');
        const cmdPath = path.join(dailyBase, date, 'command');
        
        if (fs.existsSync(cmdPath)) {
            const files = fs.readdirSync(cmdPath).filter(f => f.endsWith('.md'));
            for (const file of files) {
                const content = fs.readFileSync(path.join(cmdPath, file), 'utf8');
                const title = (content.split('\n')[0].split(': ')[1] || file).replace('[', '').replace(']', '').split(' (')[0];
                const time = (content.match(/- \*\*일시\*\*: .*? (?:(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2}))/) || [])[1] || "00:00:00";
                
                const cmdId = `cmd-${crypto.randomUUID()}`;

                // 1. Create Command with Pre-defined Steps (For Historical Data)
                await setDoc(doc(db, "commands", cmdId), {
                    id: cmdId,
                    origin: 'ceo',
                    type: 'command',
                    title,
                    instruction: (content.match(/## 📜 지시 내용 \(Command\)\n([\s\S]*?)(?=\n---|$)/) || [])[1]?.trim() || content,
                    date: dateKey,
                    time,
                    steps: [
                        { id: 'step-1', name: '명령 수신 및 분석', assigneeId: 'AT', criteria: 'Fivefold Protocol 수립', status: 'done' },
                        { id: 'step-2', name: '지능 군단 집행', assigneeId: 'DEV', criteria: '코드/디자인 반영 완료', status: 'done' },
                        { id: 'step-3', name: '최종 보고 및 박제', assigneeId: 'AT', criteria: '성역 안치 완료', status: 'done' }
                    ],
                    status: 'resolved',
                    createdAt: serverTimestamp()
                });

                // 2. Add Historical Activities
                await setDoc(doc(db, "activities", crypto.randomUUID()), {
                    meetingId: cmdId,
                    authorId: 'AT',
                    authorName: '수행원가재 (Core OS)',
                    type: 'utterance',
                    ...parseFivefold(content),
                    time,
                    createdAt: serverTimestamp()
                });
                
                console.log(`✅ Processed: ${title}`);
            }
        }
    }
    console.log("🏁 Process-First Sync Completed.");
    process.exit(0);
}

start().catch(console.error);
