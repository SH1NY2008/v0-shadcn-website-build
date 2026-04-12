"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useTeacherMode } from "@/context/teacher-mode-context"
import {
  subscribeSubmissionsForTeacher,
  subscribeClassWorkByTeacher,
  type ClassWorkSubmission,
  type ClassWorkAssignment,
} from "@/lib/class-work"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText } from "lucide-react"

function timeLabel(t: unknown): string {
  if (!t) return "—"
  try {
    const d =
      typeof (t as { toDate?: () => Date }).toDate === "function"
        ? (t as { toDate: () => Date }).toDate()
        : new Date((t as { seconds?: number }).seconds! * 1000)
    return d.toLocaleString()
  } catch {
    return "—"
  }
}

export default function ReviewSubmissionsPage() {
  const { userRole, isRoleResolved } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [submissions, setSubmissions] = useState<ClassWorkSubmission[]>([])
  const [assignments, setAssignments] = useState<ClassWorkAssignment[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user || !isRoleResolved || userRole !== "teacher") return
    const unsubA = subscribeClassWorkByTeacher(user.uid, setAssignments)
    const unsubS = subscribeSubmissionsForTeacher(user.uid, setSubmissions)
    return () => {
      unsubA()
      unsubS()
    }
  }, [user, userRole, isRoleResolved])

  const titleByAssignmentId = useMemo(() => {
    const m = new Map<string, string>()
    assignments.forEach((a) => m.set(a.id, a.title))
    return m
  }, [assignments])

  if (!authReady) {
    return (
      <PageLayout>
        <div className="flex min-h-[40vh] items-center justify-center animate-pulse font-black text-[#2C2C2C]/40">
          Loading…
        </div>
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Button asChild className="bg-[#006B6B] font-bold">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (!isRoleResolved) {
    return (
      <PageLayout>
        <div className="flex min-h-[40vh] items-center justify-center animate-pulse">Loading profile…</div>
      </PageLayout>
    )
  }

  if (userRole !== "teacher") {
    return (
      <PageLayout>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="font-bold text-[#2C2C2C]">Teachers only.</p>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-[#2C2C2C]/60 hover:text-[#2C2C2C]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] md:text-7xl">
          Review submissions
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-bold text-[#2C2C2C]/80">
          Homework and file submissions from your classes. For quiz scores, use{" "}
          <Link href="/quizzes/results" className="text-[#006B6B] underline font-black">
            Quiz results
          </Link>
          .
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]">
        {submissions.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-[#2C2C2C]/30" />
            <p className="font-black uppercase tracking-widest text-[#2C2C2C]/40">No submissions yet</p>
            <p className="mt-2 font-bold text-[#006B6B]">
              When students submit work on their class page, it will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-black/5">
              <TableRow>
                <TableHead className="font-black uppercase">Assignment</TableHead>
                <TableHead className="font-black uppercase">Student</TableHead>
                <TableHead className="font-black uppercase">Submitted</TableHead>
                <TableHead className="font-black uppercase">Notes</TableHead>
                <TableHead className="font-black uppercase">Files</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-[#2C2C2C]">
                    {titleByAssignmentId.get(s.assignmentId) ?? s.assignmentId.slice(0, 8) + "…"}
                  </TableCell>
                  <TableCell className="font-bold">{s.studentName || s.studentId}</TableCell>
                  <TableCell className="text-[#2C2C2C]/70 font-bold">{timeLabel(s.submittedAt)}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-4 text-sm font-bold text-[#2C2C2C]/80 whitespace-pre-wrap">
                      {s.submissionText?.trim() || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {s.attachmentUrl ? (
                      <Button asChild size="sm" variant="outline" className="font-bold border-2 border-black/15">
                        <a href={s.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="font-bold">
                        Text only
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </PageLayout>
  )
}
