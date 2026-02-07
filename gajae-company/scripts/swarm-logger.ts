import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion, getDoc, arrayRemove } from "firebase/firestore";
import * as dotenv from 'dotenv';
import * as path from 'path';
import crypto from 'crypto';

/**
 * [가재 컴퍼니] Swarm Intelligence Integrated Logger (v6.6 - CLI Ready)
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

export class SwarmLogger {
    static async createCommand(origin: 'ceo' | 'system', title: string, instruction: string) {
        const now = new Date();
        const docId = `cmd-${now.getTime()}`;
        await setDoc(doc(db, "commands", docId), {
            id: docId,
            origin,
            type: 'command',
            title,
            instruction,
            date: now.toISOString().split('T')[0].replace(/-/g, ''),
            time: now.toTimeString().split(' ')[0],
            steps: [],
            activities: [],
            status: 'active',
            createdAt: serverTimestamp()
        });
        return docId;
    }

    static async setSteps(commandId: string, steps: any[]) {
        await updateDoc(doc(db, "commands", commandId), {
            steps: steps.map(s => ({ ...s, taskIds: [] })),
            updatedAt: serverTimestamp()
        });
    }

    static async createTask(commandId: string, stepId: string, taskData: any) {
        const taskId = `task-${crypto.randomUUID().substring(0, 8)}`;
        const assignee = taskData.assigneeId.toLowerCase();
        
        await setDoc(doc(db, "all_tasks", taskId), { ...taskData, id: taskId, commandId, stepId, createdAt: serverTimestamp() });

        const cmdRef = doc(db, "commands", commandId);
        const snap = await getDoc(cmdRef);
        if (snap.exists()) {
            const steps = snap.data().steps.map((s: any) => 
                s.id === stepId ? { ...s, taskIds: [...(s.taskIds || []), taskId] } : s
            );
            await updateDoc(cmdRef, { steps });
        }

        const regRef = doc(db, `tasks_${assignee}`, "registry");
        const regSnap = await getDoc(regRef);
        if (!regSnap.exists()) {
            await setDoc(regRef, { activeTaskIds: [taskId] });
        } else {
            await updateDoc(regRef, { activeTaskIds: arrayUnion(taskId) });
        }
        return taskId;
    }

    static async addActivity(commandId: string, activity: any) {
        await updateDoc(doc(db, "commands", commandId), {
            activities: arrayUnion({ ...activity, id: crypto.randomUUID(), timestamp: new Date().toTimeString().split(' ')[0] })
        });
    }

    static async closeCommand(commandId: string, finalDecision: string) {
        await updateDoc(doc(db, "commands", commandId), { finalDecision, status: 'resolved' });
    }
}

async function run() {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (mode === 'open') {
        const id = await SwarmLogger.createCommand(args[1] as any, args[2], args[3]);
        console.log(`CMD_ID:${id}`);
    } else if (mode === 'steps') {
        await SwarmLogger.setSteps(args[1], JSON.parse(args[2]));
        console.log("✅ Steps Configured.");
    } else if (mode === 'task-add') {
        const id = await SwarmLogger.createTask(args[1], args[2], JSON.parse(args[3]));
        console.log(`TASK_ID:${id}`);
    } else if (mode === 'activity') {
        await SwarmLogger.addActivity(args[1], JSON.parse(args[2]));
        console.log("✅ Activity Added.");
    } else if (mode === 'close') {
        await SwarmLogger.closeCommand(args[1], args[2]);
        console.log("✅ Command Resolved.");
    }
}

if (require.main === module) {
    run().catch(e => { console.error(e); process.exit(1); });
}
