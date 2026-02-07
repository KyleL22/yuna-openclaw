import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import * as path from 'path';

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

async function purge() {
    const cols = ['commands', 'meetings', 'activities', 'chronicles'];
    for (const name of cols) {
        const snap = await getDocs(collection(db, name));
        console.log(`🧹 Purging [${name}] (${snap.size} docs)...`);
        for (const d of snap.docs) { await deleteDoc(d.ref); }
    }
    console.log("✨ Sanctuary Database Purified.");
    process.exit(0);
}

purge().catch(console.error);
