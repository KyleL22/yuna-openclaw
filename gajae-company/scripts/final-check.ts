import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function check() {
    const meetSnap = await getDocs(collection(db, "meetings"));
    const actSnap = await getDocs(collection(db, "activities"));
    console.log(`Current Meetings: ${meetSnap.size}`);
    console.log(`Current Activities: ${actSnap.size}`);
    if (actSnap.size > 0) {
        console.log("Activity Sample Type:", actSnap.docs[0].data().type);
        console.log("Activity Sample Title/Topic:", actSnap.docs[0].data().title || actSnap.docs[0].data().topic);
    }
}

check();
