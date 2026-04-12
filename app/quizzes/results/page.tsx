"use client"

import { useEffect, useState, useMemo } from "react"
import { PageLayout } from "@/components/page-layout"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useTeacherMode } from "@/context/teacher-mode-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User as UserIcon, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface QuizResult {
  id: string
  userId: string
  userName: string
  category: string
  score: number
  totalQuestions: number
  percentage: number
  /** Class IDs the student belonged to when the attempt was saved (from `users/{uid}.classes`). */
  classIds?: string[]
  completedAt: any
}

export default function QuizResultsPage() {
  const router = useRouter()
  const { userRole, isRoleResolved } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [rawResults, setRawResults] = useState<QuizResult[]>([])
  const [rosterStudentIds, setRosterStudentIds] = useState<Set<string>>(new Set())
  const [classNameById, setClassNameById] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  const results = useMemo(() => {
    if (rosterStudentIds.size === 0) return []
    return rawResults.filter((r) => r.userId && rosterStudentIds.has(r.userId))
  }, [rawResults, rosterStudentIds])

  const formatClassLabels = (ids?: string[]) => {
    if (!ids?.length) return "—"
    const labels = ids
      .map((id) => classNameById.get(id))
      .filter((n): n is string => Boolean(n))
    return labels.length ? labels.join(", ") : "—"
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user || !isRoleResolved || userRole !== "teacher") return

    const cq = query(collection(db, "classes"), where("teacherId", "==", user.uid))
    const unsubClasses = onSnapshot(cq, (snap) => {
      const ids = new Set<string>()
      const names = new Map<string, string>()
      snap.docs.forEach((d) => {
        const data = d.data()
        names.set(d.id, (data.name as string) || "Class")
        const students = data.students as string[] | undefined
        students?.forEach((id) => ids.add(id))
      })
      setRosterStudentIds(ids)
      setClassNameById(names)
    })

    return () => unsubClasses()
  }, [user, userRole, isRoleResolved])

  useEffect(() => {
    if (!user || !isRoleResolved || userRole !== "teacher") return

    const q = query(collection(db, "quiz_results"), orderBy("completedAt", "desc"))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as QuizResult
        )
        setRawResults(data)
        setLoading(false)
      },
      (error) => {
        console.error("Error listening to quiz results:", error)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user, userRole, isRoleResolved])

  if (!authReady) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
          <p className="text-xl font-black text-[#2C2C2C]/50 uppercase tracking-widest">Loading…</p>
        </div>
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
          <p className="text-[#2C2C2C]/60 mb-8 font-bold text-center max-w-md">
            Sign in with a teacher account to view class quiz results.
          </p>
          <Button onClick={() => router.push("/login")} className="bg-[#006B6B] text-white font-bold">
            Go to login
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (!isRoleResolved) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
          <p className="text-xl font-black text-[#2C2C2C]/50 uppercase tracking-widest">Loading your profile…</p>
        </div>
      </PageLayout>
    )
  }

  if (userRole !== "teacher") {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-[#2C2C2C]/60 mb-8 font-bold text-center max-w-md">
            Your account does not have the teacher role in Firestore. If you should be a teacher, ask an admin to set{" "}
            <code className="rounded bg-black/5 px-1">role</code> to <code className="rounded bg-black/5 px-1">teacher</code> on your user document, or create a new account with the teacher option at signup.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="bg-[#006B6B] text-white font-bold">
            Return to Dashboard
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-12">
        <Link href="/quizzes" className="inline-flex items-center text-sm font-bold text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors mb-4 uppercase tracking-wide">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
              Quiz <span className="text-[#006B6B]">Results</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
              Monitor student performance across all quiz categories.
            </p>
          </div>
          <div className="bg-[#FFC971] p-4 rounded-xl border-4 border-black/10 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="h-12 w-12 rounded-lg bg-[#006B6B] flex items-center justify-center text-white shadow-sm">
                <BarChart3 className="h-6 w-6" />
            </div>
            <div>
                <div className="text-2xl font-black text-[#2C2C2C]">{results.length}</div>
                <div className="text-xs font-black uppercase text-[#2C2C2C]/50 tracking-wider">Total Submissions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
        {loading ? (
          <div className="p-20 text-center animate-pulse">
            <p className="text-2xl font-black text-[#2C2C2C]/40 uppercase tracking-widest">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-2xl font-black text-[#2C2C2C]/40 uppercase tracking-widest">
              {rosterStudentIds.size === 0 ? "No students in your classes yet" : "No results yet"}
            </p>
            <p className="text-[#006B6B] font-bold mt-2">
              {rosterStudentIds.size === 0
                ? "Share your class codes so students can join—then their quiz scores will show up here."
                : "When students complete quizzes, their scores will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/5">
                <TableRow className="border-b-4 border-black/5 hover:bg-transparent">
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Student</TableHead>
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Class</TableHead>
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Category</TableHead>
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Score</TableHead>
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Percentage</TableHead>
                  <TableHead className="py-6 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id} className="border-b-2 border-black/5 hover:bg-black/[0.02] transition-colors">
                    <TableCell className="py-6 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#FFC971] border-2 border-black/10 flex items-center justify-center text-[#2C2C2C] font-black shadow-sm">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg text-[#2C2C2C]">{result.userName || "Anonymous Student"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-6 max-w-[200px]">
                      <span className="font-bold text-sm text-[#2C2C2C]/80 line-clamp-2" title={formatClassLabels(result.classIds)}>
                        {formatClassLabels(result.classIds)}
                      </span>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <Badge className="bg-[#006B6B]/10 text-[#006B6B] border-none font-bold px-3 py-1 rounded-lg uppercase text-xs tracking-wider">
                        {result.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 px-6 font-bold text-lg text-[#2C2C2C]">
                      {result.score} / {result.totalQuestions}
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-black/5 h-3 rounded-full overflow-hidden border border-black/5">
                            <div 
                                className={cn(
                                    "h-full transition-all",
                                    result.percentage >= 80 ? "bg-green-500" : result.percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                                )} 
                                style={{ width: `${result.percentage}%` }} 
                            />
                        </div>
                        <span className="font-black text-[#2C2C2C]">{result.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-6 text-[#2C2C2C]/60 font-bold">
                      {result.completedAt?.toDate().toLocaleDateString() || "Recent"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
