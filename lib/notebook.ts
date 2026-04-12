
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
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
  // Only equality on userId — avoids composite index (userId + orderBy createdAt).
  // Sort newest first in memory.
  const q = query(notesCollection, where('userId', '==', userId))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Note))
      .sort((a, b) => {
        const ta =
          typeof (a.createdAt as { toMillis?: () => number })?.toMillis === "function"
            ? (a.createdAt as { toMillis: () => number }).toMillis()
            : 0
        const tb =
          typeof (b.createdAt as { toMillis?: () => number })?.toMillis === "function"
            ? (b.createdAt as { toMillis: () => number }).toMillis()
            : 0
        return tb - ta
      })
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
