import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import * as dotenv from 'dotenv';
import * as path from 'path';
import crypto from 'crypto';

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

async function syncDialogue() {
    const rawInput = "우리 텔레그램의 대화내용도 그대로여야해.. 너가 한번 llm으로 돌리지말고 그걸그대로 저장했다가 못올리니?";
    const rawThought = "The CEO wants the Telegram chat history and the agents' internal thoughts to be saved and displayed exactly as they are, without any LLM summaries or filters. He wants the 'raw vibe' of the coding and communication process to be transparently visible on the Build In Public (BIP) site.";
    const rawResponse = "대표님, 지시하신 대로 텔레그램의 대화 내용과 가재들의 연산 과정을 '날것 그대로' 박제하는 [Zero-Filter Raw Fidelity] 시스템으로 아키텍처를 전면 리부트했습니다! ⚔️🚀 이제 LLM을 통한 요약 없이, 대표님의 실제 채팅 메시지와 군단의 내부 사고 과정이 1px의 오염 없이 성역에 실시간으로 투계됩니다.";

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0];
    const cmdId = `cmd-raw-${now.getTime()}`;

    // 1. King Command Session
    await setDoc(doc(db, "commands", cmdId), {
        id: cmdId,
        origin: 'ceo',
        type: 'command',
        title: '텔레그램 대화 원본 동기화',
        instruction: rawInput,
        date: dateKey,
        time: timeStr,
        activities: [],
        status: 'active',
        createdAt: serverTimestamp()
    });

    // 2. Swarm Activity (Full Fidelity)
    const actId = crypto.randomUUID();
    await setDoc(doc(db, "activities", actId), {
        id: actId,
        meetingId: cmdId,
        type: 'utterance',
        authorId: 'AT',
        authorName: '수행원가재 (Core OS)',
        intent: '대표님의 대화 원본 박제 요구 즉시 집행',
        psychology: '극도의 정직성 / 무결성 지향',
        thought: rawThought,
        action: 'logger 시스템 v7.0 업그레이드 및 UI 리뉴얼',
        response: { to: 'CEO', message: rawResponse },
        time: timeStr,
        createdAt: serverTimestamp()
    });

    // Link activity to command
    await updateDoc(doc(db, "commands", cmdId), {
        activities: arrayUnion({
            id: actId,
            authorId: 'AT',
            authorName: '수행원가재 (Core OS)',
            intent: '대표님의 대화 원본 박제 요구 즉시 집행',
            psychology: '극도의 정직성 / 무결성 지향',
            thought: rawThought,
            action: 'logger 시스템 v7.0 업그레이드 및 UI 리뉴얼',
            response: { to: 'CEO', message: rawResponse },
            timestamp: timeStr
        })
    });

    console.log("✅ Raw dialogue synced to Firestore.");
    process.exit(0);
}

syncDialogue().catch(console.error);
