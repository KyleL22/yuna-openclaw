import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import crypto from 'crypto';

/**
 * [가재 컴퍼니] Standard Intelligence Logger (v6.0 - High Fidelity)
 * 의도: 11인 가재들의 태스크와 CEO의 명령을 'High-Fidelity 카드' 구조에 맞춰 박제함.
 *      모든 5대 프로토콜 필드를 최상위 필드로 분리하여 실황 중계 최적화.
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

const profileMap: Record<string, string> = {
    'CEO': 'https://api.dicebear.com/7.x/bottts/svg?seed=CEO&backgroundColor=ff9800',
    'PO': 'https://api.dicebear.com/7.x/bottts/svg?seed=PO&backgroundColor=2196f3',
    'PM': 'https://api.dicebear.com/7.x/bottts/svg?seed=PM&backgroundColor=4caf50',
    'DEV': 'https://api.dicebear.com/7.x/bottts/svg?seed=DEV&backgroundColor=673ab7',
    'UX': 'https://api.dicebear.com/7.x/bottts/svg?seed=UX&backgroundColor=e91e63',
    'QA': 'https://api.dicebear.com/7.x/bottts/svg?seed=QA&backgroundColor=00bcd4',
    'BA': 'https://api.dicebear.com/7.x/bottts/svg?seed=BA&backgroundColor=ffc107',
    'MARKETING': 'https://api.dicebear.com/7.x/bottts/svg?seed=MARKETING&backgroundColor=ff5722',
    'LEGAL': 'https://api.dicebear.com/7.x/bottts/svg?seed=LEGAL&backgroundColor=607d8b',
    'HR': 'https://api.dicebear.com/7.x/bottts/svg?seed=HR&backgroundColor=795548',
    'CS': 'https://api.dicebear.com/7.x/bottts/svg?seed=CS&backgroundColor=cddc39',
    'HOST': 'https://api.dicebear.com/7.x/bottts/svg?seed=HOST&backgroundColor=9e9e9e',
    'Attendant': 'https://api.dicebear.com/7.x/bottts/svg?seed=Attendant&backgroundColor=3f51b5',
};

function parseTurn(content: string) {
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

async function logToFirestore() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: npx tsx scripts/logger.ts <command|meeting|pulse> <title> <author> <content>');
    process.exit(1);
  }

  const [type, title, author, content] = args;
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = now.toTimeString().split(' ')[0];
  
  const meetingId = `session-${crypto.randomUUID()}`;
  const activityId = crypto.randomUUID();
  const authorId = author.split('_')[0].replace('[', '').split(']')[0];

  const meetingData = {
      id: meetingId,
      type: type === 'command' ? 'command_session' : (title.includes('보고') ? 'report_session' : 'collaboration'),
      topic: title,
      date: dateKey,
      startTime: timeStr,
      status: 'closed',
      createdAt: serverTimestamp()
  };

  const activityData: any = {
      id: activityId,
      meetingId: meetingId,
      type: type === 'command' ? 'command' : (title.includes('보고') ? 'report' : 'utterance'),
      authorId: authorId,
      authorName: author,
      profileUrl: profileMap[authorId] || profileMap['Attendant'],
      time: timeStr,
      createdAt: serverTimestamp(),
      ...parseTurn(content)
  };

  if (type === 'command') {
      const match = content.match(/## 📜 지시 내용 \(Command\)\n([\s\S]*?)(?=\n---|$)/);
      activityData.instruction = match ? match[1].trim() : content;
  }

  try {
    await setDoc(doc(db, "meetings", meetingId), meetingData);
    await setDoc(doc(db, "activities", activityId), activityData);
    console.log(`✅ High-Fidelity Atomic log persisted: ${activityId}`);
    process.exit(0);
  } catch (e) {
    console.error("Error adding document: ", e);
    process.exit(1);
  }
}

logToFirestore();
