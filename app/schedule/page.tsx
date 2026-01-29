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
      <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h1 className="mb-4 text-5xl md:text-7xl font-black tracking-tight text-black uppercase">
            Math Study Schedule
          </h1>
          <p className="text-xl md:text-2xl font-medium text-[#006B6B]">
            Plan your math learning sessions
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
            className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] shadow-md px-8"
            onClick={() => router.push("/google-signin")}
          >
            Sign in to create session
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="flex h-96 items-center justify-center">
            <p className="text-black/60 font-bold text-lg animate-pulse">Loading sessions...</p>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Calendar className="h-10 w-10 text-[#006B6B]" />
            </motion.div>
            <div className="text-center">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="text-2xl font-black text-black mb-2"
              >
                No sessions scheduled
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="text-lg font-medium text-[#006B6B]"
              >
                Create your first study session to get started
              </motion.p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => {
            const dateSessions = groupedSessions[date]
            const today = new Date().toISOString().split("T")[0]
            const isToday = date === today

            return (
              <ScrollReveal key={date} delay={dateIndex * 0.1} className="w-full">
                <Card className="bg-[#FFB627] border-4 border-black/10 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b-2 border-black/5 pb-4 bg-black/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black text-black">{formatDate(date)}</CardTitle>
                        <CardDescription className="text-[#006B6B] font-bold">{dateSessions.length} session(s) scheduled</CardDescription>
                      </div>
                      {isToday && <Badge className="bg-[#006B6B] text-white border-none text-sm px-3 py-1 rounded-full">Today</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6 p-6">
                    {dateSessions.map((session, sessionIndex) => {
                      const isCreator = user ? session.creatorId === user.uid : false
                      const isParticipant = user ? session.participants.includes(user.uid) : false
                      const course = curriculum.find((c) => c.id === session.courseId)

                      return (
                        <ScrollReveal key={session.id} delay={sessionIndex * 0.1}>
                          <div className="flex flex-col md:flex-row gap-4 rounded-xl border-2 border-black/5 bg-white/40 p-6 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-lg duration-300">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-white shadow-sm">
                              {session.isPublic ? (
                                <Globe className="h-8 w-8" />
                              ) : (
                                <Lock className="h-8 w-8" />
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-black text-xl text-black">{session.title}</h4>
                                  <p className="text-base font-medium text-black/70 mt-1">{session.description}</p>
                                  {course && (
                                    <p className="text-sm font-bold text-[#006B6B] mt-2 bg-white/50 inline-block px-2 py-1 rounded-md">
                                      Course: {course.name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <Badge variant={session.isPublic ? "default" : "secondary"} className="h-fit">
                                    {session.isPublic ? "Public" : "Private"}
                                  </Badge>
                                  {isCreator && <Badge variant="outline" className="h-fit border-black/20">Creator</Badge>}
                                </div>
                              </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-black/60">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#006B6B]" />
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#006B6B]" />
                              {session.participants.length} participant(s)
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-[#006B6B]" />
                              by {isCreator ? "You" : session.creatorName}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {isCreator ? (
                              <>
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent border-black/20 hover:bg-white/50" asChild>
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
                                    Add to Calendar
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent border-black/20 hover:bg-white/50" asChild>
                                  <a href={generateJitsiLink(session.id)} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4" />
                                    Start Call
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-2 bg-red-500 hover:bg-red-600 text-white"
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
                                    <Button size="sm" variant="outline" className="gap-2 bg-transparent border-black/20 hover:bg-white/50" asChild>
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
                                        Add to Calendar
                                      </a>
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 bg-transparent border-black/20 hover:bg-white/50" asChild>
                                      <a href={generateJitsiLink(session.id)} target="_blank" rel="noopener noreferrer">
                                        <Video className="h-4 w-4" />
                                        Join Call
                                      </a>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-black/20 hover:bg-white/50"
                                      onClick={() => handleLeaveSession(session.id)}
                                    >
                                      Leave Session
                                    </Button>
                                  </>
                                ) : (
                                  user ? (
                                    <Button size="sm" className="bg-[#006B6B] text-white hover:bg-[#005555]" onClick={() => handleJoinSession(session.id)}>
                                      Join Session
                                    </Button>
                                  ) : (
                                    <Button size="sm" className="bg-[#006B6B] text-white hover:bg-[#005555]" onClick={() => router.push("/google-signin")}>
                                      Sign in to join
                                    </Button>
                                  )
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary">Private Session</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                    )
                  })}
                </CardContent>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
