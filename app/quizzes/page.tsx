'use client'

import questionsData from '../data/questions.json'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calculator, BookOpen, Sigma, FunctionSquare, Pi, Triangle, Binary, Activity, Volume2, VolumeX, Smartphone, Settings2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useQuizSettings } from "@/hooks/use-quiz-settings"
import { useTeacherMode } from "@/context/teacher-mode-context"
import { Plus, BarChart3 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getTeacherClasses, ClassData, Assignment, deleteAssignment } from "@/lib/teacher"
import { CreateAssignmentDialog } from "@/components/create-assignment-dialog"
import { subscribeToStudentClasses } from "@/lib/student"
import { toast } from "sonner"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

// Group by category
const categories = questionsData.reduce((acc: any, q: any) => {
  if (!acc[q.category]) {
    acc[q.category] = []
  }
  acc[q.category].push(q)
  return acc
}, {})

// Map categories to icons (fallback to Calculator)
const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes('algebra')) return <FunctionSquare className="h-6 w-6" />
  if (lower.includes('geometry')) return <Triangle className="h-6 w-6" />
  if (lower.includes('precalculus')) return <Activity className="h-6 w-6" />
  if (lower.includes('calculus')) return <Sigma className="h-6 w-6" />
  if (lower.includes('limit')) return <Pi className="h-6 w-6" />
  
  return <BookOpen className="h-6 w-6" />
}

export default function QuizzesPage() {
  const { settings, toggleSound, toggleHaptics, updateFontSize, loaded } = useQuizSettings()
  const { isTeacherMode } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<ClassData[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [studentClassIds, setStudentClassIds] = useState<Set<string>>(new Set())

  const visibleAssignments = useMemo(() => {
    if (isTeacherMode) return assignments
    return assignments.filter((a) => studentClassIds.has(a.classId))
  }, [assignments, isTeacherMode, studentClassIds])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (isTeacherMode && user) {
      getTeacherClasses(user.uid)
        .then(setClasses)
        .catch(error => console.error("Error fetching teacher classes:", error))
      
      const q = query(collection(db, "assignments"), where("teacherId", "==", user.uid))
      const unsub = onSnapshot(q, (snap) => {
        setAssignments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)))
      }, (error) => {
        console.error("Error listening to assignments:", error)
      })
      return () => unsub()
    } else if (user) {
      const q = query(collection(db, "assignments"), where("status", "==", "active"))
      const unsub = onSnapshot(
        q,
        (snap) => {
          setAssignments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Assignment)))
        },
        (error) => {
          console.error("Error listening to active assignments:", error)
        }
      )
      return () => unsub()
    }
  }, [isTeacherMode, user])

  useEffect(() => {
    if (isTeacherMode || !user) {
      setStudentClassIds(new Set())
      return
    }
    const unsub = subscribeToStudentClasses(user.uid, (list) => {
      setStudentClassIds(new Set(list.map((c) => c.id)))
    })
    return () => unsub()
  }, [isTeacherMode, user])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash !== "#quiz-categories") return
    requestAnimationFrame(() => {
      document.getElementById("quiz-categories")?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [])

  return (
    <PageLayout style={{ fontSize: `${settings.fontSize}px` }}>
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
              {isTeacherMode ? "Assignments" : "Quizzes"}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
              {isTeacherMode
                ? "Assign quizzes to a class; students open them from their class on the dashboard."
                : "Practice by category, or open assigned quizzes from each class on your dashboard."}
            </p>
          </div>
          
          {isTeacherMode && (
            <div className="flex flex-col items-stretch sm:items-end gap-3 w-full md:w-auto">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-black font-bold bg-white/80 hover:bg-white"
                >
                  <a href="#quiz-categories">Quiz library</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-black font-bold bg-white/80 hover:bg-white"
                >
                  <Link href="/quizzes/results">Class results</Link>
                </Button>
              </div>
              <CreateAssignmentDialog
                teacherId={user?.uid || ""}
                classes={classes}
                trigger={
                  <Button className="bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] shadow-md uppercase tracking-wide gap-2 w-full sm:w-auto">
                    <Plus className="h-6 w-6" /> Create assignment
                  </Button>
                }
              />
            </div>
          )}
          
          {/* Accessibility Settings Card */}
          {!isTeacherMode && loaded && (
            <Card className="border-4 border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] bg-white w-full md:w-auto">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#2C2C2C] font-black uppercase tracking-tight border-b-2 border-black/5 pb-2 mb-1">
                  <Settings2 className="h-5 w-5" />
                  <span>Accessibility</span>
                </div>
                
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-[#006B6B]" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <Label htmlFor="sound-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Sound Effects</Label>
                  </div>
                  <Switch 
                    id="sound-toggle" 
                    checked={settings.soundEnabled} 
                    onCheckedChange={toggleSound}
                    className="data-[state=checked]:bg-[#006B6B]"
                  />
                </div>

                <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                      <Smartphone className={`h-5 w-5 ${settings.hapticsEnabled ? "text-[#006B6B]" : "text-gray-400"}`} />
                      <Label htmlFor="haptics-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Haptic Feedback</Label>
                    </div>
                    <Switch 
                      id="haptics-toggle" 
                      checked={settings.hapticsEnabled} 
                      onCheckedChange={toggleHaptics}
                      className="data-[state=checked]:bg-[#006B6B]"
                    />
                  </div>

                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="font-size" className="font-bold text-[#2C2C2C] cursor-pointer">Text Size</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => updateFontSize(settings.fontSize - 1)} size="sm" variant="outline" className="font-bold">-</Button>
                    <span className="font-bold text-[#2C2C2C]">{settings.fontSize}px</span>
                    <Button onClick={() => updateFontSize(settings.fontSize + 1)} size="sm" variant="outline" className="font-bold">+</Button>
                    <Button onClick={() => updateFontSize(16)} size="sm" variant="outline" className="font-bold">Reset</Button>
                  </div>
                </div>




              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {visibleAssignments.length > 0 && (
        <div className="mb-12" id="teacher-assignments">
    

      <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
              {isTeacherMode ? "Your assignments" : "From your classes"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="group flex flex-col justify-between rounded-xl border-4 border-black/10 bg-[#FFC971]/20 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
              >
                <div>
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-black/10 bg-white text-[#006B6B] shadow-sm">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                      DUE {assignment.dueDate.toDate().toLocaleDateString()}
                    </Badge>
                  </div>
                  <h3 className="mb-3 text-2xl font-black uppercase leading-[0.9] text-[#2C2C2C]">
                    {assignment.title}
                  </h3>
                  <p className="text-sm font-bold text-[#2C2C2C]/60 leading-tight">
                    {isTeacherMode && (
                      <span className="block text-[#006B6B] mb-1">
                        Class: {classes.find((c) => c.id === assignment.classId)?.name ?? assignment.classId}
                      </span>
                    )}
                    {assignment.description?.trim() || `Quiz category: ${assignment.courseId}`}
                  </p>
                </div>
                <div className="mt-8">
                  {isTeacherMode ? (
                    <Button
                      variant="outline"
                      className="w-full border-4 border-black/10 font-bold hover:bg-red-500 hover:text-white gap-2 h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all"
                      onClick={async () => {
                        if (!confirm("Remove this assignment? Students will no longer see it.")) return
                        try {
                          await deleteAssignment(assignment.id)
                          toast.success("Assignment removed")
                        } catch (e) {
                          console.error(e)
                          toast.error("Could not delete assignment")
                        }
                      }}
                    >
                      Remove assignment
                    </Button>
                  ) : (
                    <Link href={`/quizzes/${encodeURIComponent(assignment.courseId)}`} className="w-full block">
                      <Button className="w-full gap-2 border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold text-lg h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all">
                        Complete Task
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between gap-4" id="quiz-categories">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
              Quiz library
            </h2>
            {isTeacherMode && (
              <p className="text-sm font-bold text-[#2C2C2C]/60 mt-1 max-w-xl">
                Open any category to preview the same quiz experience your students get.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(categories).map((category, index) => (
          <div 
            key={category} 
            className="group flex flex-col justify-between rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
          >
            <div>
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C] transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {getCategoryIcon(category)}
                </div>
                <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                  {categories[category].length} Qs
                </Badge>
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase leading-[0.9] text-[#2C2C2C]">
                {category}
              </h3>
              <p className="text-sm font-bold text-[#2C2C2C]/60 leading-tight">
                Practice problems focusing on {category.toLowerCase()} concepts and applications.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <Link href={`/quizzes/${encodeURIComponent(category)}`} className="w-full block">
                <Button className="w-full gap-2 border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold text-lg h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all">
                  {isTeacherMode ? "Preview quiz" : "Start Quiz"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {isTeacherMode && (
                <Link href="/quizzes/results" className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-black/15 font-bold text-[#2C2C2C] gap-2 h-10 text-sm"
                  >
                    <BarChart3 className="h-4 w-4" /> Roster scores
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
