import { db } from "@/lib/firebase"
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"

export async function toggleTopicCompletion(uid: string, courseId: string, videoId: string) {
  const ref = doc(db, "users", uid, "courses", courseId, "topics", videoId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await deleteDoc(ref)
  } else {
    await setDoc(ref, { completed: true, completedAt: serverTimestamp() })
  }
}

export async function isTopicCompleted(uid: string, courseId: string, videoId: string) {
  const ref = doc(db, "users", uid, "courses", courseId, "topics", videoId)
  const snap = await getDoc(ref)
  return snap.exists()
}

export async function getCourseCompletedCount(uid: string, courseId: string) {
  const ref = collection(db, "users", uid, "courses", courseId, "topics")
  const snaps = await getDocs(ref)
  return snaps.size
}

export async function getUserProgressSummary(uid: string) {
  const coursesRef = collection(db, "users", uid, "courses")
  const courseDocs = await getDocs(coursesRef)
  const courseIds = courseDocs.docs.map((d) => d.id)
  let topicTotal = 0
  let topicCompleted = 0
  for (const courseId of courseIds) {
    const topicsRef = collection(db, "users", uid, "courses", courseId, "topics")
    const topics = await getDocs(topicsRef)
    topicCompleted += topics.size
  }
  return { courseIds, topicCompleted, topicTotal }
}

