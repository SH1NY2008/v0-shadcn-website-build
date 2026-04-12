import { db } from "./firebase"
import { curriculum } from "./curriculum"
import {
  collection,
  doc,
  documentId,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  arrayRemove,
} from "firebase/firestore"

function getTotalTopicCount(): number {
  return curriculum.reduce(
    (acc, c) => acc + c.units.reduce((uacc, u) => uacc + u.topics.length, 0),
    0
  )
}

async function getStudentOverallProgressPercent(uid: string): Promise<number> {
  const total = getTotalTopicCount()
  if (total === 0) return 0
  try {
    const counts = await Promise.all(
      curriculum.map(async (c) => {
        const ref = collection(db, "users", uid, "courses", c.id, "topics")
        const snap = await getDocs(ref)
        return snap.size
      })
    )
    const completed = counts.reduce((a, b) => a + b, 0)
    return Math.round((completed / total) * 100)
  } catch (e) {
    // Often FirebaseError: permission-denied when rules allow only self-read on users/{uid}/courses/...
    console.warn("getStudentOverallProgressPercent: cannot read progress for", uid, e)
    return 0
  }
}

export interface TeacherStatsPayload {
  totalStudents: number
  avgPerformance: number
  classCount: number
  classes: ClassData[]
  activeAssignmentCount: number
  studentSubmissionCount: number
}

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
  classCode: string
  students: string[]
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

export function subscribeToTeacherStats(
  teacherId: string,
  callback: (stats: TeacherStatsPayload) => void
) {
  const empty: TeacherStatsPayload = {
    totalStudents: 0,
    avgPerformance: 0,
    classCount: 0,
    classes: [],
    activeAssignmentCount: 0,
    studentSubmissionCount: 0
  }

  const classesRef = collection(db, "classes")
  const cq = query(classesRef, where("teacherId", "==", teacherId))
  const assignmentsRef = collection(db, "assignments")
  const aq = query(assignmentsRef, where("teacherId", "==", teacherId))
  const quizRef = collection(db, "quiz_results")

  let latestClasses: ClassData[] = []
  let latestAssignments: Assignment[] = []
  let latestQuizRows: { userId?: string }[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let mergeSeq = 0

  const emitError = (err: unknown) => {
    console.error("Error subscribing to teacher stats:", err)
    callback(empty)
  }

  const merge = async () => {
    const seq = ++mergeSeq
    const studentIds = new Set<string>()
    for (const cls of latestClasses) {
      for (const sid of cls.students ?? []) {
        studentIds.add(sid)
      }
    }

    let totalStudents = 0
    let weightedProgress = 0
    const enrichedClasses: ClassData[] = []

    for (const cls of latestClasses) {
      const students = cls.students ?? []
      totalStudents += students.length
      if (students.length === 0) {
        enrichedClasses.push({
          ...cls,
          students: [],
          studentCount: 0,
          avgProgress: cls.avgProgress ?? 0
        })
        continue
      }
      const pcts = await Promise.all(students.map((sid) => getStudentOverallProgressPercent(sid)))
      const classAvg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
      weightedProgress += classAvg * students.length
      enrichedClasses.push({
        ...cls,
        students,
        studentCount: students.length,
        avgProgress: classAvg
      })
    }

    if (seq !== mergeSeq) return

    const avgPerformance =
      totalStudents > 0 ? Math.round(weightedProgress / totalStudents) : 0

    const activeAssignmentCount = latestAssignments.filter((a) => a.status === "active").length

    const studentSubmissionCount = latestQuizRows.filter(
      (row) => row.userId && studentIds.has(row.userId)
    ).length

    callback({
      totalStudents,
      avgPerformance,
      classCount: enrichedClasses.length,
      classes: enrichedClasses,
      activeAssignmentCount,
      studentSubmissionCount
    })
  }

  const scheduleMerge = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      void merge()
    }, 400)
  }

  const unsubClasses = onSnapshot(
    cq,
    (snapshot) => {
      latestClasses = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          students: data.students ?? []
        } as ClassData
      })
      scheduleMerge()
    },
    emitError
  )

  const unsubAssignments = onSnapshot(
    aq,
    (snapshot) => {
      latestAssignments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment))
      scheduleMerge()
    },
    (err) => {
      console.warn("assignments listener unavailable:", err)
      latestAssignments = []
      scheduleMerge()
    }
  )

  const unsubQuiz = onSnapshot(
    quizRef,
    (snapshot) => {
      latestQuizRows = snapshot.docs.map((d) => d.data() as { userId?: string })
      scheduleMerge()
    },
    (err) => {
      console.warn("quiz_results listener unavailable:", err)
      latestQuizRows = []
      scheduleMerge()
    }
  )

  return () => {
    unsubClasses()
    unsubAssignments()
    unsubQuiz()
    if (debounceTimer) clearTimeout(debounceTimer)
  }
}

/** Alphanumeric class join code (6 chars). */
function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createClass(
  teacherId: string,
  classData: Pick<ClassData, "name" | "period" | "studentCount" | "avgProgress">
): Promise<{ id: string; classCode: string }> {
  const classesRef = collection(db, "classes")
  const newClassRef = doc(classesRef)
  const classCode = generateClassCode()

  await setDoc(newClassRef, {
    name: classData.name,
    period: classData.period,
    studentCount: classData.studentCount ?? 0,
    avgProgress: classData.avgProgress ?? 0,
    teacherId,
    id: newClassRef.id,
    createdAt: serverTimestamp(),
    classCode,
    students: [],
  })

  return { id: newClassRef.id, classCode }
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

export async function deleteAssignment(assignmentId: string): Promise<void> {
  await deleteDoc(doc(db, "assignments", assignmentId))
}

/** `courseId` on assignments is the quiz category slug used in `/quizzes/[category]`. */
export async function getClassById(classId: string): Promise<ClassData | null> {
  const ref = doc(db, "classes", classId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as ClassData
}

/** Remove a student from a class (updates `classes/{id}.students` and `users/{studentId}.classes`). */
export async function removeStudentFromClass(
  teacherId: string,
  classId: string,
  studentId: string
): Promise<void> {
  const classRef = doc(db, "classes", classId)
  const classSnap = await getDoc(classRef)
  if (!classSnap.exists()) {
    throw new Error("Class not found")
  }
  const data = classSnap.data() as { teacherId?: string; students?: string[] }
  if (data.teacherId !== teacherId) {
    throw new Error("Not authorized to modify this class")
  }
  if (!data.students?.includes(studentId)) {
    return
  }

  await updateDoc(classRef, {
    students: arrayRemove(studentId),
  })

  const studentRef = doc(db, "users", studentId)
  const studentSnap = await getDoc(studentRef)
  if (studentSnap.exists()) {
    await updateDoc(studentRef, {
      classes: arrayRemove(classId),
    })
  }
}

export async function getStudentsForClass(studentUids: string[]) {
  if (!studentUids || studentUids.length === 0) {
    return [];
  }

  // Firestore 'in' queries are limited to 30 elements; user docs use document ID === Firebase Auth uid
  const studentChunks = [];
  for (let i = 0; i < studentUids.length; i += 30) {
    studentChunks.push(studentUids.slice(i, i + 30));
  }

  const studentPromises = studentChunks.map(chunk =>
    getDocs(query(collection(db, "users"), where(documentId(), "in", chunk)))
  );

  const studentSnapshots = await Promise.all(studentPromises);
  return studentSnapshots.flatMap((snap) =>
    snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  );
}

export async function getParentStudents(parentId: string): Promise<string[]> {
  const parentRef = doc(db, 'parents', parentId)
  const parentSnap = await getDoc(parentRef)
  if (parentSnap.exists()) {
    return parentSnap.data().students || []
  }
  return []
}
