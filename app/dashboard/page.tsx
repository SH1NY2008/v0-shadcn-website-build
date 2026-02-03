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
      <div className="mb-8 flex flex-col justify-end min-h-[40vh] pb-8 border-b-4 border-black/10">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
          Welcome back,<br />
          <span className="text-[#006B6B]">{name}</span>
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-[#2C2C2C]/60 max-w-2xl leading-tight">
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
        {/* Current Courses */}
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-8 border-b-4 border-black/10 pb-6">
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Current Courses</h2>
            <p className="text-[#006B6B] font-bold text-lg mt-1">Continue where you left off</p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {curriculum.map((course, i) => (
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
              ))}
            </div>

            <Button className="w-full bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md uppercase tracking-wide" asChild>
              <Link href="/resources">View All Courses</Link>
            </Button>
          </div>
        </div>

        {/* Study Goals */}
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-8 border-b-4 border-black/10 pb-6">
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Weekly Goals</h2>
            <p className="text-[#006B6B] font-bold text-lg mt-1">Your learning targets for this week</p>
          </div>
          <div className="space-y-6">
            <ScrollReveal delay={0.1} yOffset={40} scaleOffset={0.04}>
              <div className="flex items-center gap-6 rounded-2xl border-2 border-black/5 bg-black/5 p-6 transition-all hover:bg-black/10 hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#006B6B] text-white shadow-sm">
                  <Target className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xl text-[#2C2C2C]">Complete 5 Lessons</h4>
                    <span className="text-sm font-bold text-[#006B6B] bg-white/50 px-3 py-1 rounded-lg">{weeklyCompleted}/5</span>
                  </div>
                  <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#006B6B]" 
                      style={{ width: `${weeklyLessonsPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex items-center gap-6 rounded-2xl border-2 border-black/5 bg-black/5 p-6 transition-all hover:bg-black/10 hover:shadow-md">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#006B6B] text-white shadow-sm">
                  <Calendar className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xl text-[#2C2C2C]">Study 10 Hours</h4>
                    <span className="text-sm font-bold text-[#006B6B] bg-white/50 px-3 py-1 rounded-lg">{weeklyStudyHours}/10</span>
                  </div>
                  <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#006B6B]" 
                      style={{ width: `${weeklyHoursPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Practice Center */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border-4 border-black/10 bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-8 border-b-4 border-black/10 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Practice Center</h2>
              <p className="text-[#006B6B] font-bold text-lg mt-1">Test your knowledge with quick quizzes</p>
            </div>
            <Button variant="outline" className="hidden sm:flex border-2 border-black/10 bg-white/50 hover:bg-white text-[#2C2C2C] font-bold rounded-xl px-6 h-12" asChild>
              <Link href="/quizzes">View All Quizzes</Link>
            </Button>
          </div>
          <div className="pt-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.keys(quizCategories).slice(0, 4).map((category, i) => (
                <ScrollReveal key={category} delay={0.3 + (i * 0.1)} yOffset={20} scaleOffset={0.02}>
                  <Link href={`/quizzes/${encodeURIComponent(category)}`} className="block group h-full">
                    <div className="h-full rounded-2xl border-2 border-black/5 bg-white/40 p-5 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-[#006B6B]/10 rounded-xl text-[#006B6B] group-hover:bg-[#006B6B] group-hover:text-white transition-colors">
                            {getCategoryIcon(category)}
                          </div>
                          <Badge variant="secondary" className="text-xs bg-white/50 font-bold">
                            {quizCategories[category].length} Qs
                          </Badge>
                        </div>
                        <h4 className="font-bold text-lg text-[#2C2C2C] mb-1 line-clamp-1 leading-tight">{category}</h4>
                        <p className="text-sm font-bold text-[#2C2C2C]/60 mb-4 line-clamp-2 leading-snug">
                          Practice {category.toLowerCase()} problems
                        </p>
                      </div>
                      <div className="flex items-center text-[#006B6B] font-black text-sm group-hover:translate-x-1 transition-transform uppercase tracking-wide">
                        Start Quiz <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-6 sm:hidden">
              <Button className="w-full bg-[#006B6B] text-white font-bold h-12 rounded-xl" asChild>
                <Link href="/quizzes">View All Quizzes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
