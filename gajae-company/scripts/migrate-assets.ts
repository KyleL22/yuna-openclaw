import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

/**
 * [가재 컴퍼니] Sanctuary Asset Migrator (v1.0)
 * 의도: Git에 저장된 모든 핵심 프로세스(헌법, 역할, 명세)를 Firestore로 이전함.
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

const workspaceRoot = '/Users/openclaw-kong/.openclaw/workspace/';

async function migrateAsset(category: string, filePath: string, id: string, name: string) {
    const fullPath = path.join(workspaceRoot, filePath);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8');
    const versionMatch = content.match(/v(\d+\.\d+)/);
    const version = versionMatch ? versionMatch[0] : 'v1.0';

    await setDoc(doc(db, "sanctuary_core", id), {
        id,
        name,
        category,
        version,
        content,
        updatedAt: serverTimestamp()
    });
    console.log(`✅ Asset Migrated: ${name} (${version})`);
}

async function start() {
    console.log("🚀 Syncing Core Assets to Firestore...");

    // 1. Legal (Constitution & Bylaws)
    await migrateAsset('legal', 'docs/core/legal/CONSTITUTION.md', 'constitution', '가재 군단 통합 헌법');
    await migrateAsset('legal', 'docs/core/legal/BYLAWS.md', 'bylaws', '가재 군단 운영 법령');

    // 2. Processes
    const processDir = path.join(workspaceRoot, 'docs/core/process');
    if (fs.existsSync(processDir)) {
        for (const file of fs.readdirSync(processDir)) {
            if (file.endsWith('.md')) {
                const id = file.replace('.md', '').toLowerCase();
                await migrateAsset('process', `docs/core/process/${file}`, id, `Process: ${file.replace('.md', '')}`);
            }
        }
    }

    // 3. Roles
    const roleDir = path.join(workspaceRoot, 'docs/core/role');
    if (fs.existsSync(roleDir)) {
        for (const file of fs.readdirSync(roleDir)) {
            if (file.endsWith('.md')) {
                const id = file.replace('.md', '').toLowerCase();
                await migrateAsset('role', `docs/core/role/${file}`, id, `Role: ${file.replace('.md', '')}`);
            }
        }
    }

    console.log("🏁 Core Asset Sync Completed.");
    process.exit(0);
}

start().catch(console.error);
