"use client"

import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateSessionDialog } from "@/components/create-session-dialog"
import { InviteDialog } from "@/components/invite-dialog"
import { Calendar, Clock, Users, BookOpen, Lock, Globe, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getAllUserSessions, joinSession, leaveSession, deleteSession, type StudySession } from "@/lib/sessions"
import { curriculum } from "@/lib/curriculum"
import { useRouter } from "next/navigation"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
      if (!u) {
        router.push("/google-signin")
      }
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
    if (!user) return
    setLoading(true)
    const publicQuery = query(collection(db, "sessions"), where("isPublic", "==", true))
    const userQuery = query(collection(db, "sessions"), where("creatorId", "==", user.uid))
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
    const unsubPublic = onSnapshot(publicQuery, (snap) => {
      publicSessions = snap.docs.map((d) => d.data() as StudySession)
      mergeAndSet()
    })
    const unsubUser = onSnapshot(userQuery, (snap) => {
      userSessions = snap.docs.map((d) => d.data() as StudySession)
      mergeAndSet()
    })
    return () => {
      unsubPublic()
      unsubUser()
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Math Study Schedule</h1>
            <p className="text-lg text-muted-foreground">Plan your math learning sessions</p>
          </div>
          <CreateSessionDialog
            userId={user.uid}
            userName={user.displayName || "Student"}
            userEmail={user.email || ""}
            onSessionCreated={handleSessionCreated}
          />
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex h-96 items-center justify-center">
              <p className="text-muted-foreground">Loading sessions...</p>
            </CardContent>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
              <Calendar className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">No sessions scheduled</h3>
                <p className="text-muted-foreground">Create your first study session to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dateSessions = groupedSessions[date]
              const today = new Date().toISOString().split("T")[0]
              const isToday = date === today

              return (
                <Card key={date}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{formatDate(date)}</CardTitle>
                        <CardDescription>{dateSessions.length} session(s) scheduled</CardDescription>
                      </div>
                      {isToday && <Badge variant="secondary">Today</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dateSessions.map((session) => {
                      const isCreator = session.creatorId === user.uid
                      const isParticipant = session.participants.includes(user.uid)
                      const course = curriculum.find((c) => c.id === session.courseId)

                      return (
                        <div key={session.id} className="flex gap-4 rounded-lg border bg-card p-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            {session.isPublic ? (
                              <Globe className="h-6 w-6 text-primary" />
                            ) : (
                              <Lock className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                          
                              <div>
                                <h4 className="font-semibold">{session.title}</h4>
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                                {course && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Course: {course.name}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={session.isPublic ? "default" : "secondary"}>
                                  {session.isPublic ? "Public" : "Private"}
                                </Badge>
                                {isCreator && <Badge variant="outline">Creator</Badge>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {session.participants.length} participant(s)
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                by {isCreator ? "You" : session.creatorName}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {isCreator ? (
                                <>
                                  <Button size="sm" variant="outline" className="gap-1 bg-transparent" asChild>
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
                                      <Calendar className="h-3 w-3" />
                                      Add to Calendar
                                    </a>
                                  </Button>
                                  {session.isPublic && (
                                    <InviteDialog
                                      sessionTitle={session.title}
                                      sessionDate={session.date}
                                      sessionTime={session.startTime}
                                    />
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1"
                                    onClick={() => handleDeleteSession(session.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </>
                              ) : session.isPublic ? (
                                <>
                                  {isParticipant ? (
                                    <>
                                      <Button size="sm" variant="outline" className="gap-1 bg-transparent" asChild>
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
                                          <Calendar className="h-3 w-3" />
                                          Add to Calendar
                                        </a>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleLeaveSession(session.id)}
                                      >
                                        Leave Session
                                      </Button>
                                    </>
                                  ) : (
                                    <Button size="sm" onClick={() => handleJoinSession(session.id)}>
                                      Join Session
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Badge variant="secondary">Private Session</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
