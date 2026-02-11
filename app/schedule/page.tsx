"use client"

import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateSessionDialog } from "@/components/create-session-dialog"
import { Calendar, Clock, Users, BookOpen, Lock, Globe, Trash2, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getAllUserSessions, joinSession, leaveSession, deleteSession, type StudySession } from "@/lib/sessions"
import { curriculum } from "@/lib/curriculum"
import { useRouter } from "next/navigation"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { useTeacherMode } from "@/context/teacher-mode-context"

function generateGoogleCalendarLink(
  title: string,
  description: string,
  startDate: string,
  startTime: string,
  endTime: string,
): string {
  const [year, month, day] = startDate.split("-")
  const [startHour, startMinute] = startTime.split(":")
  const [endHour, endMinute] = endTime.split(":")

  const start = `${year}${month}${day}T${startHour}${startMinute}00`
  const end = `${year}${month}${day}T${endHour}${endMinute}00`

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    dates: `${start}/${end}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function generateJitsiLink(sessionId: string): string {
  return `https://meet.jit.si/NumeriaStudy-${sessionId}`
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(":")
  const h = Number.parseInt(hour)
  const ampm = h >= 12 ? "PM" : "AM"
  const displayHour = h % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

function groupSessionsByDate(sessions: StudySession[]): Record<string, StudySession[]> {
  const grouped: Record<string, StudySession[]> = {}

  for (const session of sessions) {
    if (!grouped[session.date]) {
      grouped[session.date] = []
    }
    grouped[session.date].push(session)
  }

  return grouped
}

export default function SchedulePage() {
  const router = useRouter()
  const { isTeacherMode } = useTeacherMode()
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsub()
  }, [router])

  const loadSessions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const allSessions = await getAllUserSessions(user.uid)
      setSessions(allSessions)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [user])

  useEffect(() => {
    setLoading(true)
    const publicQuery = query(collection(db, "sessions"), where("isPublic", "==", true))
    let publicSessions: StudySession[] = []
    let userSessions: StudySession[] = []

    const mergeAndSet = () => {
      const merged = [...userSessions]
      for (const s of publicSessions) {
        if (!merged.find((m) => m.id === s.id)) {
          merged.push(s)
        }
      }
      merged.sort((a, b) => {
        const dateA = new Date(a.date + " " + a.startTime)
        const dateB = new Date(b.date + " " + b.startTime)
        return dateA.getTime() - dateB.getTime()
      })
      setSessions(merged)
      setLoading(false)
    }

    const unsubPublic = onSnapshot(
      publicQuery,
      (snap) => {
        publicSessions = snap.docs.map((d) => d.data() as StudySession)
        mergeAndSet()
      },
      () => {
        setLoading(false)
      },
    )

    let unsubUser: (() => void) | null = null
    if (user) {
      const userQuery = query(collection(db, "sessions"), where("creatorId", "==", user.uid))
      unsubUser = onSnapshot(
        userQuery,
        (snap) => {
          userSessions = snap.docs.map((d) => d.data() as StudySession)
          mergeAndSet()
        },
        () => {
          setLoading(false)
        },
      )
    } else {
      userSessions = []
      mergeAndSet()
    }

    return () => {
      unsubPublic()
      if (unsubUser) unsubUser()
    }
  }, [user])

  const handleSessionCreated = (session: StudySession) => {
    setSessions((prev) => {
      if (prev.find((s) => s.id === session.id)) return prev
      const next = [...prev, session]
      next.sort((a, b) => {
        const dateA = new Date(a.date + " " + a.startTime)
        const dateB = new Date(b.date + " " + b.startTime)
        return dateA.getTime() - dateB.getTime()
      })
      return next
    })
  }

  const handleJoinSession = async (sessionId: string) => {
    if (!user) return
    const success = await joinSession(sessionId, user.uid)
    if (success) {
      loadSessions()
    } else {
      alert("Failed to join session. It may be private or no longer available.")
    }
  }

  const handleLeaveSession = async (sessionId: string) => {
    if (!user) return
    const success = await leaveSession(sessionId, user.uid)
    if (success) {
      loadSessions()
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return
    if (!confirm("Are you sure you want to delete this session?")) return
    const success = await deleteSession(sessionId, user.uid)
    if (success) {
      loadSessions()
    } else {
      alert("Failed to delete session. You can only delete sessions you created.")
    }
  }

  const groupedSessions = groupSessionsByDate(sessions)
  const sortedDates = Object.keys(groupedSessions).sort()

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col justify-end min-h-[30vh] pb-8 border-b-4 border-black/10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
              {isTeacherMode ? "Office" : "Study"}<br />
              <span className="text-[#006B6B]">{isTeacherMode ? "Hours" : "Schedule"}</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-[#2C2C2C]/60 max-w-2xl leading-tight">
              {isTeacherMode 
                ? "Schedule sessions with your students and manage your availability" 
                : "Plan your math learning sessions"}
            </p>
          </div>
          {user ? (
            <CreateSessionDialog
              userId={user.uid}
              userName={user.displayName || "Student"}
              userEmail={user.email || ""}
              onSessionCreated={handleSessionCreated}
            />
          ) : (
            <Button 
              className="bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] shadow-md px-8 uppercase tracking-wide"
              onClick={() => router.push("/google-signin")}
            >
              Sign in to create session
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden p-12 flex items-center justify-center min-h-[400px]">
          <p className="text-[#2C2C2C]/60 font-black text-2xl animate-pulse uppercase tracking-widest">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden p-12 flex flex-col items-center justify-center min-h-[400px] gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-24 w-24 rounded-3xl bg-[#006B6B]/10 flex items-center justify-center"
            >
              <Calendar className="h-12 w-12 text-[#006B6B]" />
            </motion.div>
            <div className="text-center space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight"
              >
                {isTeacherMode ? "No office hours scheduled" : "No sessions scheduled"}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="text-xl font-bold text-[#2C2C2C]/60"
              >
                {isTeacherMode 
                  ? "Set your availability for students to book time with you" 
                  : "Create your first study session to get started"}
              </motion.p>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => {
            const dateSessions = groupedSessions[date]
            const today = new Date().toISOString().split("T")[0]
            const isToday = date === today

            return (
              <ScrollReveal key={date} delay={dateIndex * 0.1} yOffset={40} scaleOffset={0.04} className="w-full">
                <div className="rounded-3xl border-4 border-black/10 bg-[#FFC971] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                  <div className="border-b-4 border-black/10 pb-6 mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">{formatDate(date)}</h2>
                      <p className="text-[#006B6B] font-bold text-lg mt-1">{dateSessions.length} session(s) scheduled</p>
                    </div>
                    {isToday && <Badge className="bg-[#006B6B] text-white border-none text-sm px-4 py-2 rounded-lg font-bold uppercase tracking-wide">Today</Badge>}
                  </div>
                  <div className="space-y-4">
                    {dateSessions.map((session, sessionIndex) => {
                      const isCreator = user ? session.creatorId === user.uid : false
                      const isParticipant = user ? session.participants.includes(user.uid) : false
                      const course = curriculum.find((c) => c.id === session.courseId)

                      return (
                        <ScrollReveal key={session.id} delay={sessionIndex * 0.1} yOffset={20}>
                          <div className="flex flex-col md:flex-row gap-6 rounded-2xl border-2 border-black/5 bg-white/40 p-6 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md duration-300">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#006B6B] text-white shadow-sm">
                              {session.isPublic ? (
                                <Globe className="h-10 w-10" />
                              ) : (
                                <Lock className="h-10 w-10" />
                              )}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-black text-2xl text-[#2C2C2C] leading-tight">{session.title}</h4>
                                  <p className="text-lg font-bold text-[#2C2C2C]/60 mt-1">{session.description}</p>
                                  {course && (
                                    <p className="text-sm font-bold text-[#006B6B] mt-2 bg-white/50 inline-block px-3 py-1 rounded-lg uppercase tracking-wide">
                                      {course.name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={session.isPublic ? "default" : "secondary"} className="h-fit font-bold rounded-lg bg-[#2C2C2C] text-white hover:bg-[#2C2C2C]/90">
                                    {session.isPublic ? "Public" : "Private"}
                                  </Badge>
                                  {isCreator && <Badge variant="outline" className="h-fit font-bold border-2 border-[#2C2C2C] text-[#2C2C2C] rounded-lg">Creator</Badge>}
                                </div>
                              </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#2C2C2C]/70">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-[#006B6B]" />
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-[#006B6B]" />
                              {session.participants.length} participant(s)
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-[#006B6B]" />
                              by {isCreator ? "You" : session.creatorName}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {isCreator ? (
                              <>
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent border-2 border-black/10 hover:bg-white text-[#2C2C2C] font-bold h-10 px-4 rounded-xl" asChild>
                                  <a
                                    href={generateGoogleCalendarLink(
                                      session.title,
                                      session.description,
                                      session.date,
                                      session.startTime,
                                      session.endTime,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Calendar className="h-4 w-4" />
                                    Calendar
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent border-2 border-black/10 hover:bg-white text-[#2C2C2C] font-bold h-10 px-4 rounded-xl" asChild>
                                  <a href={generateJitsiLink(session.id)} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4" />
                                    Start Call
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-2 font-bold h-10 px-4 rounded-xl"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </>
                            ) : session.isPublic ? (
                              <>
                                {isParticipant ? (
                                  <>
                                    <Button size="sm" variant="outline" className="gap-2 bg-transparent border-2 border-black/10 hover:bg-white text-[#2C2C2C] font-bold h-10 px-4 rounded-xl" asChild>
                                      <a
                                        href={generateGoogleCalendarLink(
                                          session.title,
                                          session.description,
                                          session.date,
                                          session.startTime,
                                          session.endTime,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Calendar className="h-4 w-4" />
                                        Calendar
                                      </a>
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 bg-transparent border-2 border-black/10 hover:bg-white text-[#2C2C2C] font-bold h-10 px-4 rounded-xl" asChild>
                                      <a href={generateJitsiLink(session.id)} target="_blank" rel="noopener noreferrer">
                                        <Video className="h-4 w-4" />
                                        Join Call
                                      </a>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-2 border-black/10 hover:bg-white text-[#2C2C2C] font-bold h-10 px-4 rounded-xl"
                                      onClick={() => handleLeaveSession(session.id)}
                                    >
                                      Leave Session
                                    </Button>
                                  </>
                                ) : (
                                  user ? (
                                    <Button size="sm" className="bg-[#006B6B] text-white hover:bg-[#005555] font-bold h-10 px-6 rounded-xl" onClick={() => handleJoinSession(session.id)}>
                                      Join Session
                                    </Button>
                                  ) : (
                                    <Button size="sm" className="bg-[#006B6B] text-white hover:bg-[#005555] font-bold h-10 px-6 rounded-xl" onClick={() => router.push("/google-signin")}>
                                      Sign in to join
                                    </Button>
                                  )
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary" className="font-bold bg-black/10 text-[#2C2C2C]">Private Session</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                    )
                  })}
                </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
