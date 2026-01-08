import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

export interface StudySession {
  id: string
  title: string
  description: string
  courseId: string
  date: string
  startTime: string
  endTime: string
  isPublic: boolean
  creatorId: string
  creatorName: string
  creatorEmail: string
  participants: string[]
  createdAt: Timestamp | null
}

export async function createSession(
  uid: string,
  userName: string,
  userEmail: string,
  sessionData: Omit<StudySession, "id" | "creatorId" | "creatorName" | "creatorEmail" | "participants" | "createdAt">,
) {
  const sessionRef = doc(collection(db, "sessions"))
  const session: StudySession = {
    ...sessionData,
    id: sessionRef.id,
    creatorId: uid,
    creatorName: userName,
    creatorEmail: userEmail,
    participants: [uid],
    createdAt: serverTimestamp() as Timestamp,
  }
  await setDoc(sessionRef, session)
  return session
}

export async function getPublicSessions(): Promise<StudySession[]> {
  const q = query(collection(db, "sessions"), where("isPublic", "==", true))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data() as StudySession)
}

export async function getUserSessions(uid: string): Promise<StudySession[]> {
  const q = query(collection(db, "sessions"), where("creatorId", "==", uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data() as StudySession)
}

export async function getAllUserSessions(uid: string): Promise<StudySession[]> {
  const publicSessions = await getPublicSessions()
  const userSessions = await getUserSessions(uid)

  const allSessions = [...userSessions]

  for (const session of publicSessions) {
    if (!allSessions.find((s) => s.id === session.id)) {
      allSessions.push(session)
    }
  }

  return allSessions.sort((a, b) => {
    const dateA = new Date(a.date + " " + a.startTime)
    const dateB = new Date(b.date + " " + b.startTime)
    return dateA.getTime() - dateB.getTime()
  })
}

export async function joinSession(sessionId: string, uid: string): Promise<boolean> {
  const sessionRef = doc(db, "sessions", sessionId)
  const sessionSnap = await getDoc(sessionRef)

  if (!sessionSnap.exists()) return false

  const session = sessionSnap.data() as StudySession

  if (!session.isPublic) return false

  if (session.participants.includes(uid)) return true

  await setDoc(sessionRef, {
    ...session,
    participants: [...session.participants, uid],
  })

  return true
}

export async function leaveSession(sessionId: string, uid: string): Promise<boolean> {
  const sessionRef = doc(db, "sessions", sessionId)
  const sessionSnap = await getDoc(sessionRef)

  if (!sessionSnap.exists()) return false

  const session = sessionSnap.data() as StudySession

  if (session.creatorId === uid) return false

  await setDoc(sessionRef, {
    ...session,
    participants: session.participants.filter((id) => id !== uid),
  })

  return true
}

export async function deleteSession(sessionId: string, uid: string): Promise<boolean> {
  const sessionRef = doc(db, "sessions", sessionId)
  const sessionSnap = await getDoc(sessionRef)

  if (!sessionSnap.exists()) return false

  const session = sessionSnap.data() as StudySession

  if (session.creatorId !== uid) return false

  await deleteDoc(sessionRef)
  return true
}
