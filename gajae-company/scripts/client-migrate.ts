import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

async function migrate() {
    const workspaceRoot = '/Users/openclaw-kong/.openclaw/workspace/';
    const dailyBase = path.join(workspaceRoot, 'docs/chronicle/daily');
    
    const dates = fs.readdirSync(dailyBase).filter(f => {
        try { return fs.statSync(path.join(dailyBase, f)).isDirectory(); } catch (e) { return false; }
    });

    console.log(`🚀 Migrating ${dates.length} days of records via Client SDK (with delay)...`);

    for (const date of dates) {
        const types = ['command', 'meeting'];
        for (const type of types) {
            const typePath = path.join(dailyBase, date, type);
            if (!fs.existsSync(typePath)) continue;

            const files = fs.readdirSync(typePath).filter(f => f.endsWith('.md'));
            for (const file of files) {
                const filePath = path.join(typePath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                const titleMatch = content.match(/^# (?:👑 CEO 지시 기록|🤝 협업 회의록): \[(.*?)\]/m);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
                
                const timeMatch = content.match(/- \*\*일시\*\*: (?:.*?) (?:(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2}))/);
                const time = timeMatch ? (timeMatch[1] || timeMatch[2]) : "00:00";

                const docId = crypto.createHash('md5').update(`${date}-${type}-${file}`).digest('hex');

                try {
                    await setDoc(doc(db, "chronicles", docId), {
                        id: docId,
                        date: date.replace(/-/g, ''),
                        time: time,
                        title: title,
                        type: type,
                        content: content,
                        rawPath: filePath.replace(workspaceRoot, ''),
                        createdAt: serverTimestamp()
                    });
                    console.log(`✅ Migrated: ${date}/${type}/${file}`);
                    await new Promise(r => setTimeout(r, 100)); // 100ms delay
                } catch (err) {
                    console.error(`❌ Failed: ${file}`, err);
                }
            }
        }
    }
    console.log('🏁 Migration finished.');
}

migrate().catch(console.error);
