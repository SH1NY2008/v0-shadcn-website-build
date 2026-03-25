
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'

export interface Note {
  id: string
  userId: string
  topic: string
  content: string
  createdAt: any
}

export function onNotesUpdate(
  userId: string,
  callback: (notes: Note[]) => void
) {
  const notesCollection = collection(db, 'notes')
  const q = query(
    notesCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Note)
    )
    callback(notes)
  })

  return unsubscribe
}

export async function createNote(
  note: Omit<Note, 'id' | 'createdAt'>
): Promise<string> {
  const notesCollection = collection(db, 'notes')
  const docRef = await addDoc(notesCollection, {
    ...note,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateNote(
  noteId: string,
  content: string
): Promise<void> {
  const noteRef = doc(db, 'notes', noteId)
  await updateDoc(noteRef, { content })
}

export async function deleteNote(noteId: string): Promise<void> {
  const noteRef = doc(db, 'notes', noteId)
  await deleteDoc(noteRef)
}
