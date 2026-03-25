
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useTeacherMode } from '@/context/teacher-mode-context'
import { createLiveSession, onLiveSessionsUpdate, LiveSession } from '@/lib/live'

export default function LiveSessionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const { userRole } = useTeacherMode()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser)
    const unsubscribeSessions = onLiveSessionsUpdate(setSessions)

    return () => {
      unsubscribeAuth()
      unsubscribeSessions()
    }
  }, [])

  const handleCreateSession = async () => {
    if (user && newSessionTitle) {
      await createLiveSession(newSessionTitle, user.uid)
      setNewSessionTitle('')
    }
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Live Sessions</h1>

        {userRole === 'teacher' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create a New Session</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input 
                placeholder="Session Title"
                value={newSessionTitle} 
                onChange={(e) => setNewSessionTitle(e.target.value)} 
              />
              <Button onClick={handleCreateSession}>Create Session</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p>No active sessions right now.</p>
            ) : (
              sessions.map(session => (
                <div key={session.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                  <span className="font-bold">{session.title}</span>
                  <Button asChild>
                    <Link href={`/live/${session.id}`}>Join Session</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
