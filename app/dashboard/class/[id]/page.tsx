"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection as fsCollection, onSnapshot, query, where } from "firebase/firestore"
import { getClassById, type Assignment } from "@/lib/teacher"
import {
  subscribeClassWorkForClass,
  subscribeSubmissionsForStudentInClass,
  submitClassWork,
  type ClassWorkAssignment,
  type ClassWorkSubmission,
} from "@/lib/class-work"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Calendar, Clock, Download, Upload } from "lucide-react"
import { toast } from "sonner"

function dueLabel(d: Assignment["dueDate"]): string {
  if (!d) return "—"
  try {
    const date =
      typeof (d as { toDate?: () => Date }).toDate === "function"
        ? (d as { toDate: () => Date }).toDate()
        : new Date((d as { seconds?: number }).seconds! * 1000)
    return date.toLocaleDateString()
  } catch {
    return "—"
  }
}

export default function StudentClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [authReady, setAuthReady] = useState(false)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [className, setClassName] = useState("")
  const [period, setPeriod] = useState("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classWork, setClassWork] = useState<ClassWorkAssignment[]>([])
  const [mySubmissions, setMySubmissions] = useState<ClassWorkSubmission[]>([])
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthReady(true)
      setUid(u?.uid ?? null)
      if (!u) {
        setAllowed(false)
        return
      }
      void (async () => {
        const cls = await getClassById(id)
        if (!cls) {
          setAllowed(false)
          return
        }
        const students = cls.students ?? []
        if (!students.includes(u.uid)) {
          setAllowed(false)
          return
        }
        setAllowed(true)
        setClassName(cls.name)
        setPeriod(cls.period)
      })()
    })
    return () => unsub()
  }, [id])

  useEffect(() => {
    if (allowed !== true || !id) return
    const q = query(fsCollection(db, "assignments"), where("classId", "==", id))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Assignment))
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
        setAssignments(list)
      },
      (err) => console.error("assignments listener:", err)
    )
    return () => unsub()
  }, [allowed, id])

  useEffect(() => {
    if (allowed !== true || !id) return
    const unsub = subscribeClassWorkForClass(id, setClassWork)
    return () => unsub()
  }, [allowed, id])

  useEffect(() => {
    if (allowed !== true || !id || !uid) return
    const unsub = subscribeSubmissionsForStudentInClass(id, uid, setMySubmissions)
    return () => unsub()
  }, [allowed, id, uid])

  if (!authReady) {
    return (
      <PageLayout>
        <div className="py-24 text-center animate-pulse font-black text-[#2C2C2C]/40 uppercase tracking-widest">
          Loading…
        </div>
      </PageLayout>
    )
  }

  if (!auth.currentUser) {
    return (
      <PageLayout>
        <div className="py-24 text-center">
          <p className="text-xl font-bold text-[#2C2C2C] mb-4">Sign in to view this class.</p>
          <Button asChild className="bg-[#006B6B] font-bold">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (allowed === false) {
    return (
      <PageLayout>
        <div className="py-24 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-black text-[#2C2C2C] mb-2">Access denied</h2>
          <p className="text-[#2C2C2C]/60 font-bold mb-6">
            You are not enrolled in this class, or it does not exist.
          </p>
          <Button asChild variant="outline" className="font-bold border-2 border-black">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (allowed === null) {
    return (
      <PageLayout>
        <div className="py-24 text-center animate-pulse font-black text-[#2C2C2C]/40 uppercase tracking-widest">
          Verifying enrollment…
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-bold text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors mb-6 uppercase tracking-wide"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.9]">
          {className}
        </h1>
        <p className="text-xl font-bold text-[#006B6B] mt-2">{period}</p>
        <p className="text-lg font-bold text-[#2C2C2C]/70 mt-4 max-w-2xl">
          Homework and quizzes your teacher assigned appear below.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
          <Upload className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Class assignments</h2>
      </div>

      {classWork.length === 0 ? (
        <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/50 p-8 text-center mb-12">
          <p className="font-black text-[#2C2C2C]/50 uppercase tracking-widest text-sm">No uploaded assignments</p>
          <p className="text-[#006B6B] font-bold mt-1 text-sm">
            Your teacher can post worksheets from the dashboard → Create assignment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-12">
          {classWork.map((cw) => (
            <ClassWorkStudentCard
              key={cw.id}
              cw={cw}
              submission={mySubmissions.find((s) => s.assignmentId === cw.id)}
              studentId={uid!}
              studentName={auth.currentUser?.displayName || auth.currentUser?.email || "Student"}
            />
          ))}
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Assigned quizzes</h2>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/50 p-12 text-center">
          <p className="font-black text-[#2C2C2C]/50 uppercase tracking-widest">No assignments yet</p>
          <p className="text-[#006B6B] font-bold mt-2">Your teacher has not assigned a quiz to this class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col justify-between rounded-xl border-4 border-black/10 bg-[#FFC971]/20 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-black/10 bg-white text-[#006B6B]">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <Badge className="bg-[#006B6B] text-white border-none text-xs px-2 py-1 font-bold">
                    Due {dueLabel(a.dueDate)}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black uppercase text-[#2C2C2C] leading-tight mb-2">{a.title}</h3>
                <p className="text-sm font-bold text-[#2C2C2C]/60">
                  {a.description?.trim() || `Quiz: ${a.courseId}`}
                </p>
              </div>
              <div className="mt-6">
                <Link href={`/quizzes/${encodeURIComponent(a.courseId)}`} className="block">
                  <Button className="w-full gap-2 border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold text-lg h-12">
                    Start quiz
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}

function dueClassWork(d: ClassWorkAssignment["dueDate"]): string {
  if (!d) return "—"
  try {
    const date =
      typeof (d as { toDate?: () => Date }).toDate === "function"
        ? (d as { toDate: () => Date }).toDate()
        : new Date((d as { seconds?: number }).seconds! * 1000)
    return date.toLocaleDateString()
  } catch {
    return "—"
  }
}

function ClassWorkStudentCard({
  cw,
  submission,
  studentId,
  studentName,
}: {
  cw: ClassWorkAssignment
  submission?: ClassWorkSubmission
  studentId: string
  studentName: string
}) {
  const [text, setText] = useState(submission?.submissionText ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(submission?.submissionText ?? "")
  }, [submission])

  const onSubmit = async () => {
    if (!text.trim() && !file) {
      toast.error("Write something or attach a file before submitting.")
      return
    }
    setSaving(true)
    try {
      await submitClassWork({
        assignment: cw,
        studentId,
        studentName,
        submissionText: text,
        file,
      })
      toast.success(submission ? "Submission updated." : "Submitted!")
      setFile(null)
    } catch (e) {
      console.error(e)
      toast.error("Could not submit. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-2xl font-black uppercase text-[#2C2C2C]">{cw.title}</h3>
        <Badge className="bg-[#006B6B] text-white border-none font-bold">Due {dueClassWork(cw.dueDate)}</Badge>
      </div>
      {cw.description?.trim() ? (
        <p className="text-sm font-bold text-[#2C2C2C]/70 whitespace-pre-wrap mb-4">{cw.description}</p>
      ) : null}
      {cw.attachmentUrl ? (
        <Button asChild variant="outline" className="mb-4 font-bold border-2 border-black/20">
          <a href={cw.attachmentUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            {cw.attachmentName || "Download assignment"}
          </a>
        </Button>
      ) : null}

      {submission?.submittedAt ? (
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#006B6B]">
          Last saved:{" "}
          {(() => {
            const s = submission.submittedAt as { toDate?: () => Date; seconds?: number }
            if (typeof s.toDate === "function") return s.toDate().toLocaleString()
            if (typeof s.seconds === "number") return new Date(s.seconds * 1000).toLocaleString()
            return "—"
          })()}
        </p>
      ) : null}

      <div className="space-y-3 mt-4">
        <Label className="font-black uppercase text-xs text-[#2C2C2C]/60">Your work (notes)</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px] border-2 border-black font-bold"
          placeholder="Answers, explanation, or paste your work here…"
        />
        <Label className="font-black uppercase text-xs text-[#2C2C2C]/60">Attach file (optional)</Label>
        <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-black/25 bg-[#FFC971]/20 px-3 py-4">
          <Upload className="mb-1 h-5 w-5 text-[#006B6B]" />
          <span className="text-xs font-bold text-[#2C2C2C]">{file ? file.name : "PDF, image, or document"}</span>
          <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button
          type="button"
          disabled={saving}
          onClick={onSubmit}
          className="w-full bg-[#006B6B] font-bold text-lg h-12"
        >
          {saving ? "Submitting…" : submission ? "Update submission" : "Submit"}
        </Button>
      </div>
    </div>
  )
}
