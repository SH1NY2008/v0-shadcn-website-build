import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"

export interface TeacherData {
  uid: string
  role: "teacher" | "student"
  classes: string[] // Array of class IDs
}

export interface ClassData {
  id: string
  name: string
  teacherId: string
  studentCount: number
  avgProgress: number
  period: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  dueDate: Timestamp
  teacherId: string
  classId: string
  status: "active" | "draft" | "closed"
}

export async function getTeacherData(uid: string): Promise<TeacherData | null> {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data() as TeacherData
  }
  return null
}

export async function getTeacherClasses(teacherId: string): Promise<ClassData[]> {
  const classesRef = collection(db, "classes")
  const q = query(classesRef, where("teacherId", "==", teacherId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData))
}

export async function getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
  const assignmentsRef = collection(db, "assignments")
  const q = query(assignmentsRef, where("teacherId", "==", teacherId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment))
}

export function subscribeToTeacherStats(teacherId: string, callback: (stats: any) => void) {
  // This is a simplified version - in a real app, you'd aggregate this or use a Cloud Function
  const classesRef = collection(db, "classes")
  const q = query(classesRef, where("teacherId", "==", teacherId))
  
  return onSnapshot(q, (snapshot) => {
    let totalStudents = 0
    let totalProgress = 0
    const classes = snapshot.docs.map(doc => {
      const data = doc.data()
      totalStudents += data.studentCount || 0
      totalProgress += data.avgProgress || 0
      return { id: doc.id, ...data }
    })
    
    callback({
      totalStudents,
      avgPerformance: classes.length > 0 ? Math.round(totalProgress / classes.length) : 0,
      classCount: classes.length,
      classes
    })
  }, (error) => {
    console.error("Error subscribing to teacher stats:", error)
    callback({
      totalStudents: 0,
      avgPerformance: 0,
      classCount: 0,
      classes: []
    })
  })
}

export async function createClass(teacherId: string, classData: Omit<ClassData, "id">) {
  const classesRef = collection(db, "classes")
  const newClassRef = doc(classesRef)
  await setDoc(newClassRef, {
    ...classData,
    teacherId,
    id: newClassRef.id,
    createdAt: serverTimestamp()
  })
  return newClassRef.id
}

export async function createAssignment(teacherId: string, assignmentData: Omit<Assignment, "id">) {
  const assignmentsRef = collection(db, "assignments")
  const newAssignmentRef = doc(assignmentsRef)
  await setDoc(newAssignmentRef, {
    ...assignmentData,
    teacherId,
    id: newAssignmentRef.id,
    createdAt: serverTimestamp()
  })
  return newAssignmentRef.id
}

export async function getParentStudents(parentId: string): Promise<string[]> {
  const parentRef = doc(db, 'parents', parentId)
  const parentSnap = await getDoc(parentRef)
  if (parentSnap.exists()) {
    return parentSnap.data().students || []
  }
  return []
}
