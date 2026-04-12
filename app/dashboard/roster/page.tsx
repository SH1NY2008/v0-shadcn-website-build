"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useTeacherMode } from "@/context/teacher-mode-context"
import {
  getTeacherClasses,
  getStudentsForClass,
  removeStudentFromClass,
  type ClassData,
} from "@/lib/teacher"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, User as UserIcon, Mail, Calendar, UserMinus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Student {
  uid: string
  email: string
  displayName: string
  role: string
  createdAt: string
}

export default function RosterPage() {
  const router = useRouter()
  const { userRole, isRoleResolved } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [classRosters, setClassRosters] = useState<Array<{ cls: ClassData; students: Student[] }>>([])
  const [loading, setLoading] = useState(true)

  const loadRosters = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const classes = await getTeacherClasses(user.uid)
      const rows = await Promise.all(
        classes.map(async (cls) => ({
          cls,
          students: cls.students?.length ? await getStudentsForClass(cls.students) : [],
        }))
      )
      setClassRosters(rows)
    } catch (error) {
      console.error("Error fetching student roster:", error)
      toast.error("Could not load roster")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user || !isRoleResolved || userRole !== "teacher") return
    void loadRosters()
  }, [user, userRole, isRoleResolved, loadRosters])

  const uniqueStudentCount = useMemo(() => {
    const ids = new Set<string>()
    for (const row of classRosters) {
      for (const s of row.students) ids.add(s.uid)
    }
    return ids.size
  }, [classRosters])

  const handleRemove = async (cls: ClassData, student: Student) => {
    if (!user) return
    const label = student.displayName || student.email || "this student"
    if (!confirm(`Remove ${label} from ${cls.name}? They can rejoin with the class code.`)) return
    try {
      await removeStudentFromClass(user.uid, cls.id, student.uid)
      toast.success("Student removed from class")
      setClassRosters((prev) =>
        prev.map((row) =>
          row.cls.id === cls.id
            ? {
                ...row,
                cls: {
                  ...row.cls,
                  students: row.cls.students.filter((id) => id !== student.uid),
                },
                students: row.students.filter((s) => s.uid !== student.uid),
              }
            : row
        )
      )
    } catch (e) {
      console.error(e)
      toast.error("Could not remove student. Check Firestore rules.")
    }
  }

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
            Your Firestore profile must have <code className="rounded bg-black/5 px-1">role: &quot;teacher&quot;</code>. Update it in the Firebase console or sign up with the teacher option.
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
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-bold text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors mb-4 uppercase tracking-wide"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
              Student <span className="text-[#006B6B]">Roster</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
              View students by class and remove someone from a class when needed.
            </p>
          </div>
          <div className="bg-[#FFC971] p-4 rounded-xl border-4 border-black/10 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="h-12 w-12 rounded-lg bg-[#006B6B] flex items-center justify-center text-white shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#2C2C2C]">{uniqueStudentCount}</div>
              <div className="text-xs font-black uppercase text-[#2C2C2C]/50 tracking-wider">Unique students</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {loading ? (
          <div className="rounded-3xl border-4 border-black/10 bg-white p-20 text-center animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-black text-[#2C2C2C]/40 uppercase tracking-widest">Loading roster...</p>
          </div>
        ) : classRosters.length === 0 ? (
          <div className="rounded-3xl border-4 border-black/10 bg-white p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-black text-[#2C2C2C]/40 uppercase tracking-widest">No classes yet</p>
            <p className="text-[#006B6B] font-bold mt-2">Create a class on your dashboard first.</p>
          </div>
        ) : (
          classRosters.map(({ cls, students }) => (
            <div
              key={cls.id}
              className="rounded-3xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="border-b-4 border-black/10 bg-[#FFC971]/40 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-black uppercase text-[#2C2C2C]">{cls.name}</h2>
                  <p className="text-sm font-bold text-[#006B6B]">{cls.period}</p>
                </div>
                <Badge className="bg-[#006B6B] text-white border-none font-bold">
                  {students.length} enrolled
                </Badge>
              </div>
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-bold text-[#2C2C2C]/60 uppercase tracking-widest text-sm">No students in this class yet</p>
                  <p className="text-[#006B6B] font-bold mt-1 text-sm">Share class code {cls.classCode}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-black/5">
                      <TableRow className="border-b-4 border-black/5 hover:bg-transparent">
                        <TableHead className="py-4 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">
                          Student
                        </TableHead>
                        <TableHead className="py-4 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">
                          Email
                        </TableHead>
                        <TableHead className="py-4 px-6 font-black uppercase tracking-wider text-[#2C2C2C]">
                          Joined
                        </TableHead>
                        <TableHead className="py-4 px-6 font-black uppercase tracking-wider text-[#2C2C2C] w-[140px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow
                          key={`${cls.id}-${student.uid}`}
                          className="border-b-2 border-black/5 hover:bg-black/[0.02] transition-colors"
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-[#FFC971] border-2 border-black/10 flex items-center justify-center text-[#2C2C2C] font-black shadow-sm">
                                <UserIcon className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-lg text-[#2C2C2C]">
                                {student.displayName || "Anonymous Student"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-2 text-[#2C2C2C]/60 font-bold">
                              <Mail className="h-4 w-4 shrink-0" />
                              {student.email}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-[#2C2C2C]/60 font-bold">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 shrink-0" />
                              {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-2 border-red-200 font-bold text-red-700 hover:bg-red-50"
                              onClick={() => handleRemove(cls, student)}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </PageLayout>
  )
}
