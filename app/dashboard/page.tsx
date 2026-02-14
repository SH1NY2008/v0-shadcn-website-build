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
import { subscribeToTeacherStats, ClassData, createClass } from "@/lib/teacher"
import { CreateAssignmentDialog } from "@/components/create-assignment-dialog"
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
  
  const [studyHours, setStudyHours] = useState<number>(0)
  const [activeCourses, setActiveCourses] = useState<number>(0)
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [achievements, setAchievements] = useState<number>(0)
  const [weeklyCompleted, setWeeklyCompleted] = useState<number>(0)
  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({})
  
  // Teacher specific state
  const [teacherData, setTeacherData] = useState<{
    totalStudents: number;
    avgPerformance: number;
    classCount: number;
    classes: ClassData[];
  }>({
    totalStudents: 0,
    avgPerformance: 0,
    classCount: 0,
    classes: []
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newClassName || !newClassPeriod) return
    
    setIsCreating(true)
    try {
      await createClass(user.uid, {
        name: newClassName,
        period: newClassPeriod,
        studentCount: 0,
        avgProgress: 0,
        teacherId: user.uid
      })
      setIsCreateClassOpen(false)
      setNewClassName("")
      setNewClassPeriod("")
      toast.success("Class created successfully!")
    } catch (error) {
      console.error("Error creating class:", error)
      toast.error("Failed to create class")
    } finally {
      setIsCreating(false)
    }
  }

  const teacherStats = [
    { title: "Total Students", icon: Users, value: teacherData.totalStudents.toString(), sub: `Across ${teacherData.classCount} classes` },
    { title: "Avg. Performance", icon: TrendingUp, value: `${teacherData.avgPerformance}%`, sub: "Real-time class average" },
    { title: "Pending Reviews", icon: FileText, value: "0", sub: "Fetch from submissions" },
    { title: "Course Materials", icon: BookOpen, value: "0", sub: "Published resources" }
  ]

  useEffect(() => {
    const run = async () => {
      if (!user) return
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
  }, [user])

  const weeklyLessonsPercent = Math.min(100, Math.round((weeklyCompleted / 5) * 100))
  const weeklyStudyHours = Number((weeklyCompleted * 0.25).toFixed(1))
  const weeklyHoursPercent = Math.min(100, Math.round((weeklyStudyHours / 10) * 100))

  useEffect(() => {
    if (!user) return
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
  }, [user])

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
                      <div className="h-full rounded-2xl border-2 border-black/5 bg-white/40 p-5 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">{cls.name}</h4>
                            <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                              {cls.avgProgress}%
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-[#2C2C2C]/60 mb-4 leading-snug">{cls.studentCount} Students enrolled</p>
                        </div>
                        <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#006B6B]" 
                            style={{ width: `${cls.avgProgress}%` }}
                          />
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
                curriculum.map((course, i) => (
                  <ScrollReveal key={course.id} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
                    <div className="h-full rounded-2xl border-2 border-black/5 bg-white/40 p-5 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">{course.name}</h4>
                          <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                            {coursePercents[course.id] ?? 0}%
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-[#2C2C2C]/60 mb-4 leading-snug">Master the fundamentals of {course.name}</p>
                      </div>
                      <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#006B6B]" 
                          style={{ width: `${coursePercents[course.id] ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                ))
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
              <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md uppercase tracking-wide" asChild>
                <Link href="/resources">
                  View All Courses
                </Link>
              </Button>
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
                    <CreateAssignmentDialog 
                      teacherId={user?.uid || ""} 
                      classes={teacherData.classes}
                      trigger={
                        <div className="h-full cursor-pointer rounded-2xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[140px]">
                          <div>
                            <div className="p-2 w-fit rounded-xl text-white bg-blue-500 mb-3 shadow-sm">
                              <Plus className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg text-[#2C2C2C] leading-tight">Create Assignment</h4>
                          </div>
                          <div className="flex items-center text-[#2C2C2C]/40 font-black text-xs uppercase tracking-wide mt-4">
                            Open Tool <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                        </div>
                      }
                    />
                  </ScrollReveal>

                  {[
                    { title: "Review Submissions", icon: FileText, color: "bg-orange-500", href: "/quizzes/results" },
                    { title: "Curriculum Editor", icon: Settings, color: "bg-purple-500", href: "/resources" },
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
              <Link href={isTeacherMode ? "#" : "/quizzes"}>
                {isTeacherMode ? "View All Tools" : "View All Quizzes"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
