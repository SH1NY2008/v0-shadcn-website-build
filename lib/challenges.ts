
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import questionsData from '../app/data/questions.json';

export interface Challenge {
  id: string;
  topic: string;
  questions: any[];
  createdBy: string;
  createdAt: any;
  participants: Participant[];
  status: 'active' | 'completed';
  timeLimit: number; // in seconds
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  answers: { [questionId: string]: 'correct' | 'incorrect' };
}

export async function createChallenge(topic: string, timeLimit: number, createdBy: string): Promise<string> {
  const challengesCollection = collection(db, 'challenges');

  // Get some questions for the topic
  const challengeQuestions = questionsData
    .filter((q) => q.category === topic)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10); // 10 questions per challenge

  const docRef = await addDoc(challengesCollection, {
    topic,
    questions: challengeQuestions,
    createdBy,
    createdAt: serverTimestamp(),
    participants: [],
    status: 'active',
    timeLimit,
  });

  return docRef.id;
}

export function onChallengesUpdate(callback: (challenges: Challenge[]) => void) {
  const challengesCollection = collection(db, 'challenges');
  const q = query(challengesCollection);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const challenges = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Challenge)
    );
    callback(challenges);
  });

  return unsubscribe;
}

export function onChallengeUpdate(challengeId: string, callback: (challenge: Challenge | null) => void) {
    const challengeRef = doc(db, 'challenges', challengeId);

    const unsubscribe = onSnapshot(challengeRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as Challenge);
        } else {
            callback(null);
        }
    });

    return unsubscribe;
}


export async function joinChallenge(challengeId: string, userId: string, userName: string, userAvatar: string): Promise<void> {
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);

    if (challengeSnap.exists()) {
        const challenge = challengeSnap.data() as Challenge;
        const alreadyJoined = challenge.participants.some(p => p.id === userId);

        if (!alreadyJoined) {
            const newParticipant: Participant = {
                id: userId,
                name: userName,
                avatar: userAvatar,
                score: 0,
                answers: {}
            };
            await updateDoc(challengeRef, {
                participants: arrayUnion(newParticipant)
            });
        }
    }
}

export async function submitChallengeAnswer(challengeId: string, userId: string, questionId: string, isCorrect: boolean): Promise<void> {
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);

    if (challengeSnap.exists()) {
        const challenge = challengeSnap.data() as Challenge;
        const participantIndex = challenge.participants.findIndex(p => p.id === userId);

        if (participantIndex > -1) {
            const participant = challenge.participants[participantIndex];
            const updatedParticipant = { ...participant };

            if (!updatedParticipant.answers[questionId]) { // only allow one answer
                updatedParticipant.answers[questionId] = isCorrect ? 'correct' : 'incorrect';
                if (isCorrect) {
                    updatedParticipant.score += 10;
                }
            }


            const updatedParticipants = [...challenge.participants];
            updatedParticipants[participantIndex] = updatedParticipant;

            await updateDoc(challengeRef, {
                participants: updatedParticipants
            });
        }
    }
}
