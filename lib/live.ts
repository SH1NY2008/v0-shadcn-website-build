
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export interface LiveSession {
  id: string;
  title: string;
  createdBy: string;
  createdAt: any;
  isActive: boolean;
  participants: string[];
}

export async function createLiveSession(title: string, createdBy: string): Promise<string> {
  const sessionsCollection = collection(db, 'liveSessions');

  const docRef = await addDoc(sessionsCollection, {
    title,
    createdBy,
    createdAt: serverTimestamp(),
    isActive: true,
    participants: [createdBy],
  });

  return docRef.id;
}

export async function joinLiveSession(sessionId: string, userId: string): Promise<void> {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
        participants: arrayUnion(userId)
    });
}

export async function endLiveSession(sessionId: string): Promise<void> {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
        isActive: false
    });
}

export function onLiveSessionsUpdate(callback: (sessions: LiveSession[]) => void) {
  const sessionsCollection = collection(db, 'liveSessions');
  const q = query(sessionsCollection, where('isActive', '==', true));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as LiveSession)
    );
    callback(sessions);
  });

  return unsubscribe;
}

export async function getLiveSession(sessionId: string): Promise<LiveSession | null> {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
        return { id: sessionSnap.id, ...sessionSnap.data() } as LiveSession;
    }

    return null;
}
