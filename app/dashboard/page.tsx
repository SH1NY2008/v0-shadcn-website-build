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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [studyHours, setStudyHours] = useState<number>(0)
  const [activeCourses, setActiveCourses] = useState<number>(0)
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [achievements, setAchievements] = useState<number>(0)
  const [weeklyCompleted, setWeeklyCompleted] = useState<number>(0)
  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const name = user?.displayName || "Student"

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
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl md:text-7xl font-black tracking-tight text-black uppercase">
          Welcome back, {name}
        </h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground">
          Track your progress in high school mathematics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Study Hours", icon: Clock, value: studyHours, sub: "Estimated from topic completions" },
          { title: "Active Courses", icon: BookOpen, value: activeCourses, sub: "Courses with progress" },
          { title: "Overall Progress", icon: TrendingUp, value: `${overallProgress}%`, sub: "Across all courses" },
          { title: "Achievements", icon: Award, value: achievements, sub: "Topics completed" }
        ].map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
            <Card className="bg-[#FFB627] border-4 border-black/10 shadow-lg rounded-xl overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-black/70 uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-[#006B6B]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-[#006B6B]">{stat.value}</div>
                <p className="text-xs font-bold text-black/50 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Current Courses */}
        <Card className="bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-black/5 pb-6">
            <CardTitle className="text-2xl font-black text-black">Current Courses</CardTitle>
            <CardDescription className="text-[#006B6B] font-bold text-lg">Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {curriculum.map((course, i) => (
                <ScrollReveal key={course.id} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
                  <div className="rounded-xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-black">{course.name}</h4>
                      <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-sm px-3 py-1 rounded-full">
                        {coursePercents[course.id] ?? 0}%
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-black/60 mb-3">Master the fundamentals of {course.name}</p>
                    <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#006B6B]" 
                        style={{ width: `${coursePercents[course.id] ?? 0}%` }}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] hover:scale-[1.02] transition-all shadow-md" asChild>
              <Link href="/resources">View All Courses</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Study Goals */}
        <Card className="bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-black/5 pb-6">
            <CardTitle className="text-2xl font-black text-black">Weekly Goals</CardTitle>
            <CardDescription className="text-[#006B6B] font-bold text-lg">Your learning targets for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <ScrollReveal delay={0.1} yOffset={40} scaleOffset={0.04}>
              <div className="flex items-start gap-4 rounded-xl border-2 border-black/5 bg-black/5 p-4 transition-all hover:bg-black/10 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-white shadow-sm">
                  <Target className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-lg text-black">Complete 5 Lessons</h4>
                    <span className="text-sm font-bold text-[#006B6B] bg-white/50 px-2 py-1 rounded-md">{weeklyCompleted}/5</span>
                  </div>
                  <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#006B6B]" 
                      style={{ width: `${weeklyLessonsPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex items-start gap-4 rounded-xl border-2 border-black/5 bg-black/5 p-4 transition-all hover:bg-black/10 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-white shadow-sm">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-lg text-black">Study 10 Hours</h4>
                    <span className="text-sm font-bold text-[#006B6B] bg-white/50 px-2 py-1 rounded-md">{weeklyStudyHours}/10</span>
                  </div>
                  <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#006B6B]" 
                      style={{ width: `${weeklyHoursPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </CardContent>
        </Card>

        {/* Practice Center */}
        <Card className="col-span-1 lg:col-span-2 bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-black/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-black">Practice Center</CardTitle>
                <CardDescription className="text-[#006B6B] font-bold text-lg">Test your knowledge with quick quizzes</CardDescription>
              </div>
              <Button variant="outline" className="hidden sm:flex border-2 border-black/10 bg-white/50 hover:bg-white text-black font-bold" asChild>
                <Link href="/quizzes">View All Quizzes</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.keys(quizCategories).slice(0, 4).map((category, i) => (
                <ScrollReveal key={category} delay={0.3 + (i * 0.1)} yOffset={20} scaleOffset={0.02}>
                  <Link href={`/quizzes/${encodeURIComponent(category)}`} className="block group h-full">
                    <div className="h-full rounded-xl border-2 border-black/5 bg-white/40 p-4 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-[#006B6B]/10 rounded-lg text-[#006B6B] group-hover:bg-[#006B6B] group-hover:text-white transition-colors">
                            {getCategoryIcon(category)}
                          </div>
                          <Badge variant="secondary" className="text-xs bg-white/50">
                            {quizCategories[category].length} Qs
                          </Badge>
                        </div>
                        <h4 className="font-bold text-lg text-black mb-1 line-clamp-1">{category}</h4>
                        <p className="text-sm font-medium text-black/60 mb-4 line-clamp-2">
                          Practice {category.toLowerCase()} problems
                        </p>
                      </div>
                      <div className="flex items-center text-[#006B6B] font-bold text-sm group-hover:translate-x-1 transition-transform">
                        Start Quiz <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-6 sm:hidden">
              <Button className="w-full bg-[#006B6B] text-white font-bold" asChild>
                <Link href="/quizzes">View All Quizzes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
