
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface QuizResult {
    id: string;
    category: string;
    score: number;
    total: number;
    createdAt: any;
}

export function onUserQuizResultsUpdate(userId: string, callback: (results: QuizResult[]) => void) {
    const resultsCollection = collection(db, 'quiz_results');
    const q = query(resultsCollection, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as QuizResult)
        );
        callback(results);
    });

    return unsubscribe;
}

export async function isTopicCompleted(userId: string, courseId: string, videoId: string) {
    const topicRef = doc(db, 'users', userId, 'courses', courseId, 'topics', videoId);
    const topicSnap = await getDoc(topicRef);
    return topicSnap.exists();
}

export async function toggleTopicCompletion(userId: string, courseId: string, videoId: string) {
    const topicRef = doc(db, 'users', userId, 'courses', courseId, 'topics', videoId);
    const topicSnap = await getDoc(topicRef);

    if (topicSnap.exists()) {
        await deleteDoc(topicRef);
    } else {
        await setDoc(topicRef, { completedAt: new Date() });
    }
}
