"use client"

import { PageLayout } from "@/components/page-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, Award, BookOpen, Target, FunctionSquare, Triangle, Activity, Sigma, Pi, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { curriculum } from "@/lib/curriculum"
import questionsData from "../data/questions.json"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { useTeacherMode } from "@/context/teacher-mode-context"
import { Users, FileText, Settings, Plus, LayoutDashboard } from "lucide-react"
import {
  subscribeToTeacherStats,
  ClassData,
  createClass,
  getStudentsForClass,
  type TeacherStatsPayload,
} from "@/lib/teacher"
import { joinClassWithCode, subscribeToStudentClasses } from "@/lib/student"
import { CreateClassWorkDialog } from "@/components/create-class-work-dialog"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function DashboardPage() {
  const { isTeacherMode } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newClassPeriod, setNewClassPeriod] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newlyCreatedClass, setNewlyCreatedClass] = useState<ClassData | null>(null)
  const [joinClassCode, setJoinClassCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [studentClasses, setStudentClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [classRoster, setClassRoster] = useState<any[]>([])
  const [isRosterLoading, setIsRosterLoading] = useState(false)
  
  const [studyHours, setStudyHours] = useState<number>(0)
  const [activeCourses, setActiveCourses] = useState<number>(0)
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [achievements, setAchievements] = useState<number>(0)
  const [weeklyCompleted, setWeeklyCompleted] = useState<number>(0)
  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({})
  
  // Teacher specific state (live: classes, assignments, quiz submissions for roster students)
  const [teacherData, setTeacherData] = useState<TeacherStatsPayload>({
    totalStudents: 0,
    avgPerformance: 0,
    classCount: 0,
    classes: [],
    activeAssignmentCount: 0,
    studentSubmissionCount: 0,
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const name = user?.displayName || (isTeacherMode ? "Educator" : "Student")

  useEffect(() => {
    if (isTeacherMode && user) {
      const unsub = subscribeToTeacherStats(user.uid, (stats) => {
        setTeacherData(stats)
      })
      return () => unsub()
    }
  }, [isTeacherMode, user])

  const handleViewRoster = async (classData: ClassData) => {
    setSelectedClass(classData)
    if (classData.students && classData.students.length > 0) {
      setIsRosterLoading(true)
      const students = await getStudentsForClass(classData.students)
      setClassRoster(students)
      setIsRosterLoading(false)
    } else {
      setClassRoster([])
    }
  }

  useEffect(() => {
    if (user && !isTeacherMode) {
      const unsub = subscribeToStudentClasses(user.uid, (classes) => {
        setStudentClasses(classes)
      })
      return () => unsub()
    }
  }, [isTeacherMode, user])

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !joinClassCode) return

    setIsJoining(true)
    try {
      const result = await joinClassWithCode(user.uid, joinClassCode)
      if (result) {
        toast.success(`Successfully joined class: ${result.name}`)
        setJoinClassCode("")
      } else {
        toast.error("Invalid class code. Please try again.")
      }
    } catch (error) {
      console.error("Error joining class:", error)
      toast.error("Failed to join class")
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newClassName.trim() || !newClassPeriod.trim()) return

    setIsCreating(true)
    try {
      const { id, classCode } = await createClass(user.uid, {
        name: newClassName.trim(),
        period: newClassPeriod.trim(),
        studentCount: 0,
        avgProgress: 0,
      })
      setNewlyCreatedClass({
        id,
        name: newClassName.trim(),
        period: newClassPeriod.trim(),
        teacherId: user.uid,
        studentCount: 0,
        avgProgress: 0,
        classCode,
        students: [],
      })
      setIsCreateClassOpen(false)
      setNewClassName("")
      setNewClassPeriod("")
      toast.success("Class created successfully!")
    } catch (error: unknown) {
      console.error("Error creating class:", error)
      const err = error as { code?: string; message?: string }
      if (err.code === "permission-denied") {
        toast.error(
          "Permission denied: update Firestore security rules so signed-in users can create documents in the classes collection where teacherId matches their account."
        )
      } else {
        toast.error(err.message || "Failed to create class")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const teacherStats = [
    { title: "Total Students", icon: Users, value: teacherData.totalStudents.toString(), sub: `Across ${teacherData.classCount} classes` },
    { title: "Avg. Performance", icon: TrendingUp, value: `${teacherData.avgPerformance}%`, sub: "Enrolled students' curriculum progress" },
    { title: "Class Submissions", icon: FileText, value: teacherData.studentSubmissionCount.toString(), sub: "Quiz attempts from your students" },
    { title: "Active Assignments", icon: BookOpen, value: teacherData.activeAssignmentCount.toString(), sub: "Assignments you published" },
  ]

  useEffect(() => {
    const run = async () => {
      if (!user || isTeacherMode) return
      const courseIds = curriculum.map((c) => c.id)
      let active = 0
      let totalTopics = 0
      let completedTopics = 0
      let completedThisWeek = 0
      const now = new Date()
      const oneWeekAgo = new Date(now)
      oneWeekAgo.setDate(now.getDate() - 7)
      try {
        for (const courseId of courseIds) {
          const total = curriculum.find((c) => c.id === courseId)?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0
          totalTopics += total
          const ref = collection(db, "users", user.uid, "courses", courseId, "topics")
          const snaps = await getDocs(ref)
          const completed = snaps.size
          if (completed > 0) active += 1
          completedTopics += completed
          const recentQ = query(ref, where("completedAt", ">=", oneWeekAgo))
          const recentSnaps = await getDocs(recentQ)
          completedThisWeek += recentSnaps.size
        }
      } catch (error) {
        console.error("Error fetching course progress data:", error)
      }
      setActiveCourses(active)
      setAchievements(completedTopics)
      setStudyHours(Number((completedTopics * 0.25).toFixed(1)))
      const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
      setOverallProgress(percent)
      setWeeklyCompleted(completedThisWeek)
    }
    run()
  }, [user, isTeacherMode])

  const weeklyLessonsPercent = Math.min(100, Math.round((weeklyCompleted / 5) * 100))
  const weeklyStudyHours = Number((weeklyCompleted * 0.25).toFixed(1))
  const weeklyHoursPercent = Math.min(100, Math.round((weeklyStudyHours / 10) * 100))

  useEffect(() => {
    if (!user || isTeacherMode) return
    const ids = ["algebra-2", "precalculus", "calculus-1"]
    const unsubs: Array<() => void> = []
    for (const courseId of ids) {
      const total =
        curriculum.find((c) => c.id === courseId)?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0
      const ref = collection(db, "users", user.uid, "courses", courseId, "topics")
      const unsub = onSnapshot(ref, (snap) => {
        const completed = snap.size
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
        setCoursePercents((prev) => ({ ...prev, [courseId]: percent }))
      }, (error) => {
        console.error(`Error listening to topics for ${courseId}:`, error)
      })
      unsubs.push(unsub)
    }
    return () => {
      for (const u of unsubs) u()
    }
  }, [user, isTeacherMode])

  // Group questions by category
  const quizCategories = questionsData.reduce((acc: any, q: any) => {
    if (!acc[q.category]) {
      acc[q.category] = []
    }
    acc[q.category].push(q)
    return acc
  }, {})

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes('algebra')) return <FunctionSquare className="h-5 w-5" />
    if (lower.includes('geometry')) return <Triangle className="h-5 w-5" />
    if (lower.includes('precalculus')) return <Activity className="h-5 w-5" />
    if (lower.includes('calculus')) return <Sigma className="h-5 w-5" />
    if (lower.includes('limit')) return <Pi className="h-5 w-5" />
    
    return <BookOpen className="h-5 w-5" />
  }

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col justify-end min-h-[30vh] md:min-h-[40vh] pb-8 border-b-4 border-black/10">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
          Welcome back,<br />
          <span className="text-[#006B6B]">{name}</span>
        </h1>
        <p className="text-xl md:text-3xl font-bold text-[#2C2C2C]/60 max-w-2xl leading-tight">
          {isTeacherMode
            ? "Manage your classes and track student performance"
            : "Track your progress in high school mathematics"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(isTeacherMode ? teacherStats : [
          { title: "Study Hours", icon: Clock, value: studyHours, sub: "Estimated from topic completions" },
          { title: "Active Courses", icon: BookOpen, value: activeCourses, sub: "Courses with progress" },
          { title: "Overall Progress", icon: TrendingUp, value: `${overallProgress}%`, sub: "Across all courses" },
          { title: "Achievements", icon: Award, value: achievements, sub: "Topics completed" }
        ]).map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
            <div className="group h-full rounded-2xl border-4 border-black/10 bg-[#FFC971] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-sm font-black text-[#2C2C2C]/70 uppercase tracking-widest">{stat.title}</h3>
                <stat.icon className="h-6 w-6 text-[#006B6B]" />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black text-[#006B6B] tracking-tight">{stat.value}</div>
                <p className="text-xs font-bold text-[#2C2C2C]/50 mt-2 uppercase tracking-wide">{stat.sub}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Class Overview / Current Courses */}
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-8 border-b-4 border-black/10 pb-6">
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
              {isTeacherMode ? "Class Overview" : "Current Courses"}
            </h2>
            <p className="text-[#006B6B] font-bold text-lg mt-1">
              {isTeacherMode ? "Monitor performance across your periods" : "Continue where you left off"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {isTeacherMode ? (
                teacherData.classes.length > 0 ? (
                  teacherData.classes.map((cls, i) => (
                    <ScrollReveal key={cls.id} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
                      <div onClick={() => handleViewRoster(cls)} className="cursor-pointer h-full rounded-2xl border-2 border-black/5 bg-white/40 p-5 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">{cls.name}</h4>
                          <p className="text-sm font-bold text-[#006B6B] mt-1">{cls.period}</p>
                          <p className="text-sm font-bold text-[#2C2C2C]/60 mt-4 leading-snug">{cls.students.length} Students enrolled</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white/20 rounded-2xl border-2 border-dashed border-black/10">
                    <p className="font-bold text-[#2C2C2C]/60 uppercase tracking-widest">No classes found</p>
                    <p className="text-sm text-[#006B6B] font-bold mt-1">Add your first class to get started</p>
                  </div>
                )
              ) : (
                studentClasses.length > 0 ? (
                  studentClasses.map((cls, i) => (
                    <ScrollReveal key={cls.id} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
                      <Link
                        href={`/dashboard/class/${cls.id}`}
                        className="block h-full rounded-2xl border-2 border-black/5 bg-white/40 p-5 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md"
                      >
                        <div>
                          <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">{cls.name}</h4>
                          <p className="text-sm font-bold text-[#006B6B] mt-1">{cls.period}</p>
                          <p className="text-xs font-black uppercase tracking-wide text-[#006B6B]/80 mt-3">
                            View assigned quizzes →
                          </p>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white/20 rounded-2xl border-2 border-dashed border-black/10">
                    <p className="font-bold text-[#2C2C2C]/60 uppercase tracking-widest">No classes joined</p>
                    <p className="text-sm text-[#006B6B] font-bold mt-1">Join a class to get started!</p>
                  </div>
                )
              )}
            </div>

            {isTeacherMode ? (
              <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md uppercase tracking-wide">
                    Create New Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Create New Class</DialogTitle>
                    <DialogDescription className="text-[#006B6B] font-bold">
                      Add a new class period to your roster.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="className" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Class Name</Label>
                      <Input 
                        id="className" 
                        placeholder="e.g. Honors Algebra 2" 
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="period" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Period</Label>
                      <Input 
                        id="period" 
                        placeholder="e.g. Period 1" 
                        value={newClassPeriod}
                        onChange={(e) => setNewClassPeriod(e.target.value)}
                        className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] font-bold"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {isCreating ? "Creating..." : "Create Class"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md uppercase tracking-wide" asChild>
                  <Link href="/resources">
                    View All Courses
                  </Link>
                </Button>

                <div className="pt-8 mt-8 border-t-4 border-black/10">
                  <div className="mb-6">
                    <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Join a Class</h2>
                    <p className="text-[#006B6B] font-bold text-lg mt-1">Enter the code from your teacher to join a class.</p>
                  </div>
                  <form onSubmit={handleJoinClass} className="flex gap-4">
                    <Input 
                      placeholder="Enter class code"
                      value={joinClassCode}
                      onChange={(e) => setJoinClassCode(e.target.value)}
                      className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] font-bold"
                    />
                    <Button 
                      type="submit" 
                      disabled={isJoining}
                      className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {isJoining ? "Joining..." : "Join"}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Teacher Tools / Practice Center */}
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-8 border-b-4 border-black/10 pb-6">
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
              {isTeacherMode ? "Teacher Tools" : "Practice Center"}
            </h2>
            <p className="text-[#006B6B] font-bold text-lg mt-1">
              {isTeacherMode ? "Quick access to teaching resources" : "Test your knowledge with quick quizzes"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {isTeacherMode ? (
                <>
                  <ScrollReveal delay={0.1} yOffset={20} scaleOffset={0.02}>
                    <CreateClassWorkDialog
                      teacherId={user?.uid || ""}
                      classes={teacherData.classes}
                      trigger={
                        <div className="h-full cursor-pointer rounded-2xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="p-2 w-fit rounded-xl text-white bg-blue-500 mb-3 shadow-sm">
                              <Plus className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">Create Assignment</h4>
                            <p className="text-xs font-bold text-[#2C2C2C]/50 mt-2 leading-snug">
                              Upload homework for a class
                            </p>
                          </div>
                          <div className="flex items-center text-[#2C2C2C]/40 font-black text-xs uppercase tracking-wide mt-4">
                            Open Tool <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                        </div>
                      }
                    />
                  </ScrollReveal>

                  {[
                    { title: "Review Submissions", icon: FileText, color: "bg-orange-500", href: "/dashboard/review-submissions" },
                    { title: "Curriculum Editor", icon: Settings, color: "bg-purple-500", href: "/dashboard/curriculum-editor" },
                    { title: "Student Roster", icon: Users, color: "bg-green-500", href: "/dashboard/roster" },
                  ].map((tool, i) => (
                    <ScrollReveal key={tool.title} delay={0.2 + (i * 0.1)} yOffset={20} scaleOffset={0.02}>
                      <Link href={tool.href} className="block h-full">
                        <div className="h-full rounded-2xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className={`p-2 w-fit rounded-xl text-white ${tool.color} mb-3 shadow-sm`}>
                              <tool.icon className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">{tool.title}</h4>
                          </div>
                          <div className="flex items-center text-[#2C2C2C]/40 font-black text-xs uppercase tracking-wide mt-4">
                            Open Tool <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </>
              ) : (
                Object.keys(quizCategories).slice(0, 4).map((category, i) => (
                  <ScrollReveal key={category} delay={0.1 + (i * 0.1)} yOffset={20} scaleOffset={0.02}>
                    <Link href={`/quizzes/${encodeURIComponent(category)}`} className="block group h-full">
                      <div className="h-full rounded-2xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[140px]">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-[#006B6B]/10 rounded-xl text-[#006B6B] group-hover:bg-[#006B6B] group-hover:text-white transition-colors">
                              {getCategoryIcon(category)}
                            </div>
                            <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                              {quizCategories[category].length} Qs
                            </Badge>
                          </div>
                          <h4 className="font-bold text-base text-[#2C2C2C] mb-1 line-clamp-1 leading-tight">{category}</h4>
                        </div>
                        <div className="flex items-center text-[#006B6B] font-black text-xs group-hover:translate-x-1 transition-transform uppercase tracking-wide">
                          Start <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))
              )}
            </div>
            
            <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md uppercase tracking-wide" asChild>
              <Link href="/quizzes">
                {isTeacherMode ? "View All Assignments" : "View All Quizzes"}
              </Link>
            </Button>
          </div>
        </div>

      </div>
      <Dialog open={!!newlyCreatedClass} onOpenChange={() => setNewlyCreatedClass(null)}>
          <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Class Created!</DialogTitle>
              <DialogDescription className="text-[#006B6B] font-bold">
                Share this code with your students to let them join the class.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-4xl font-black text-[#006B6B] bg-white/40 rounded-lg py-4">{newlyCreatedClass?.classCode}</p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setNewlyCreatedClass(null)}
                className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
          <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">{selectedClass?.name}</DialogTitle>
              <DialogDescription className="text-[#006B6B] font-bold">
                {selectedClass?.period} - {selectedClass?.students.length} students enrolled
              </DialogDescription>
              <div className="pt-4">
                <p className="text-sm font-black text-[#2C2C2C]/60 uppercase tracking-widest">Class Code</p>
                <p className="text-2xl font-black text-[#006B6B] bg-white/40 rounded-lg py-2 text-center mt-1">{selectedClass?.classCode}</p>
              </div>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {isRosterLoading ? (
                <div className="text-center animate-pulse">
                  <p className="text-lg font-bold text-[#2C2C2C]/60">Loading students...</p>
                </div>
              ) : classRoster.length > 0 ? (
                <ul className="space-y-3">
                  {classRoster.map((student) => (
                    <li key={student.uid} className="flex items-center justify-between bg-white/30 p-3 rounded-lg">
                      <span className="font-bold text-[#2C2C2C]">{student.displayName || "Student"}</span>
                      <span className="text-sm text-[#006B6B]">{student.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="font-bold text-[#2C2C2C]/60 uppercase tracking-widest">No students enrolled</p>
                  <p className="text-sm text-[#006B6B] font-bold mt-1">Share the class code to get students to join!</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setSelectedClass(null)}
                className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PageLayout>
  )
}
