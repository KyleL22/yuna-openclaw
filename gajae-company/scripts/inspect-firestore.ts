import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
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

async function inspect() {
    console.log("--- Inspecting Firestore ---");
    const cols = ['commands', 'meetings', 'chronicles'];
    for (const colName of cols) {
        const snap = await getDocs(query(collection(db, colName), limit(1)));
        console.log(`Collection [${colName}]: ${snap.size} documents found.`);
        if (snap.size > 0) {
            console.log("First doc keys:", Object.keys(snap.docs[0].data()));
            console.log("First doc sample:", JSON.stringify(snap.docs[0].data()).substring(0, 200));
        }
    }
}

inspect();
