import { db, storage } from "./firebase"
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

const COL = "class_work_assignments"
const SUB = "class_work_submissions"

export interface ClassWorkAssignment {
  id: string
  teacherId: string
  classId: string
  title: string
  description: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentPath?: string
  dueDate: Timestamp | { seconds: number }
  status: "active" | "archived"
  createdAt?: unknown
}

export interface ClassWorkSubmission {
  id: string
  assignmentId: string
  classId: string
  teacherId: string
  studentId: string
  studentName: string
  submissionText: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentPath?: string
  submittedAt?: unknown
}

function sanitizeName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, "_").trim().slice(0, 180) || "file"
}

export async function createClassWorkAssignment(data: {
  teacherId: string
  classId: string
  title: string
  description: string
  dueDate: Date
  file?: File | null
}): Promise<string> {
  const refDoc = await addDoc(collection(db, COL), {
    teacherId: data.teacherId,
    classId: data.classId,
    title: data.title.trim(),
    description: data.description.trim(),
    dueDate: data.dueDate,
    status: "active",
    createdAt: serverTimestamp(),
  })

  if (data.file && data.file.size > 0) {
    const safe = sanitizeName(data.file.name)
    const path = `class-work/${refDoc.id}/teacher_${Date.now()}_${safe}`
    const r = ref(storage, path)
    await uploadBytes(r, data.file, { contentType: data.file.type || "application/octet-stream" })
    const url = await getDownloadURL(r)
    await updateDoc(doc(db, COL, refDoc.id), {
      attachmentUrl: url,
      attachmentName: data.file.name,
      attachmentPath: path,
    })
  }

  return refDoc.id
}

export function subscribeClassWorkByTeacher(
  teacherId: string,
  callback: (rows: ClassWorkAssignment[]) => void
) {
  const q = query(collection(db, COL), where("teacherId", "==", teacherId))
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassWorkAssignment))
      list.sort((a, b) => {
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
      callback(list)
    },
    (err) => console.error("subscribeClassWorkByTeacher:", err)
  )
}

export function subscribeClassWorkForClass(
  classId: string,
  callback: (rows: ClassWorkAssignment[]) => void
) {
  const q = query(collection(db, COL), where("classId", "==", classId))
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ClassWorkAssignment))
        .filter((a) => a.status === "active")
      list.sort((a, b) => {
        const ta =
          typeof (a.dueDate as { toMillis?: () => number })?.toMillis === "function"
            ? (a.dueDate as { toMillis: () => number }).toMillis()
            : 0
        const tb =
          typeof (b.dueDate as { toMillis?: () => number })?.toMillis === "function"
            ? (b.dueDate as { toMillis: () => number }).toMillis()
            : 0
        return tb - ta
      })
      callback(list)
    },
    (err) => console.error("subscribeClassWorkForClass:", err)
  )
}

export async function submitClassWork(input: {
  assignment: ClassWorkAssignment
  studentId: string
  studentName: string
  submissionText: string
  file?: File | null
}): Promise<void> {
  const { assignment } = input
  const existing = query(
    collection(db, SUB),
    where("assignmentId", "==", assignment.id),
    where("studentId", "==", input.studentId)
  )
  const found = await getDocs(existing)
  let attachmentUrl: string | undefined
  let attachmentName: string | undefined
  let attachmentPath: string | undefined

  if (input.file && input.file.size > 0) {
    const safe = sanitizeName(input.file.name)
    const path = `class-work/${assignment.id}/submissions/${input.studentId}_${Date.now()}_${safe}`
    const r = ref(storage, path)
    await uploadBytes(r, input.file, { contentType: input.file.type || "application/octet-stream" })
    attachmentUrl = await getDownloadURL(r)
    attachmentName = input.file.name
    attachmentPath = path
  }

  const payload = {
    assignmentId: assignment.id,
    classId: assignment.classId,
    teacherId: assignment.teacherId,
    studentId: input.studentId,
    studentName: input.studentName,
    submissionText: input.submissionText.trim(),
    attachmentUrl,
    attachmentName,
    attachmentPath,
    submittedAt: serverTimestamp(),
  }

  if (!found.empty) {
    const d = found.docs[0]
    await updateDoc(d.ref, payload)
  } else {
    await addDoc(collection(db, SUB), payload)
  }
}

export function subscribeSubmissionsForTeacher(
  teacherId: string,
  callback: (rows: ClassWorkSubmission[]) => void
) {
  const q = query(collection(db, SUB), where("teacherId", "==", teacherId))
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassWorkSubmission))
      list.sort((a, b) => {
        const ta =
          typeof (a.submittedAt as { toMillis?: () => number })?.toMillis === "function"
            ? (a.submittedAt as { toMillis: () => number }).toMillis()
            : 0
        const tb =
          typeof (b.submittedAt as { toMillis?: () => number })?.toMillis === "function"
            ? (b.submittedAt as { toMillis: () => number }).toMillis()
            : 0
        return tb - ta
      })
      callback(list)
    },
    (err) => {
      console.error("subscribeSubmissionsForTeacher:", err)
      callback([])
    }
  )
}

export function subscribeSubmissionsForStudentInClass(
  classId: string,
  studentId: string,
  callback: (rows: ClassWorkSubmission[]) => void
) {
  const q = query(collection(db, SUB), where("classId", "==", classId))
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ClassWorkSubmission))
        .filter((s) => s.studentId === studentId)
      callback(list)
    },
    (err) => console.error("subscribeSubmissionsForStudentInClass:", err)
  )
}

export async function getSubmissionForStudent(
  assignmentId: string,
  studentId: string
): Promise<ClassWorkSubmission | null> {
  const q = query(
    collection(db, SUB),
    where("assignmentId", "==", assignmentId),
    where("studentId", "==", studentId)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as ClassWorkSubmission
}
