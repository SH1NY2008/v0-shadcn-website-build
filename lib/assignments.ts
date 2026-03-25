
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
  updateDoc,
  getDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Assignment {
  id: string;
  title: string;
  questions: any[];
  createdBy: string;
  createdAt: any;
  dueDate: any;
  assignedTo: string[]; // array of user IDs
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    userId: string;
    answers: { [questionId: string]: string };
    score: number;
    submittedAt: any;
}

export async function createAssignment(title: string, questions: any[], createdBy: string, dueDate: Date, assignedTo: string[]): Promise<string> {
  const assignmentsCollection = collection(db, 'assignments');

  const docRef = await addDoc(assignmentsCollection, {
    title,
    questions,
    createdBy,
    createdAt: serverTimestamp(),
    dueDate,
    assignedTo,
  });

  return docRef.id;
}

export function onAssignmentsUpdate(userId: string, callback: (assignments: Assignment[]) => void) {
  const assignmentsCollection = collection(db, 'assignments');
  const q = query(assignmentsCollection, where('assignedTo', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const assignments = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Assignment)
    );
    callback(assignments);
  });

  return unsubscribe;
}

export function onTeacherAssignmentsUpdate(userId: string, callback: (assignments: Assignment[]) => void) {
    const assignmentsCollection = collection(db, 'assignments');
    const q = query(assignmentsCollection, where('createdBy', '==', userId));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assignments = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Assignment)
      );
      callback(assignments);
    });
  
    return unsubscribe;
  }

export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentSnap = await getDoc(assignmentRef);

    if (assignmentSnap.exists()) {
        return { id: assignmentSnap.id, ...assignmentSnap.data() } as Assignment;
    }
    return null;
}

export async function submitAssignment(assignmentId: string, userId: string, answers: { [questionId: string]: string }, score: number): Promise<void> {
    const submissionsCollection = collection(db, 'submissions');

    await addDoc(submissionsCollection, {
        assignmentId,
        userId,
        answers,
        score,
        submittedAt: serverTimestamp(),
    });
}
