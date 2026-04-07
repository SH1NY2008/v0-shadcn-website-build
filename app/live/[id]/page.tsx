
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useTeacherMode } from '@/context/teacher-mode-context'
import {
    getLiveSession,
    joinLiveSession,
    endLiveSession,
    LiveSession,
} from '@/lib/live'
import { getDoc, doc } from 'firebase/firestore'

export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<LiveSession | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const { userRole } = useTeacherMode()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        setUser(user)
        if (user && sessionId) {
            await joinLiveSession(sessionId, user.uid)
        }
    })

    if (sessionId) {
        getLiveSession(sessionId).then(setSession)
        return () => {
            unsubscribeAuth()
        }
    }
    return unsubscribeAuth
  }, [sessionId])

  useEffect(() => {
    if (session) {
        const fetchParticipants = async () => {
            const participantNames = await Promise.all(session.participants.map(async (id) => {
                const userDoc = await getDoc(doc(db, 'users', id));
                return userDoc.exists() ? userDoc.data().displayName : 'Anonymous';
            }));
            setParticipants(participantNames);
        }
        fetchParticipants();
    }
  }, [session])

  const handleEndSession = async () => {
    if (sessionId) {
      await endLiveSession(sessionId)
      router.push('/live')
    }
  }

  if (!session) {
    return <PageLayout>Loading session...</PageLayout>
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{session.title}</h1>
        {userRole === 'teacher' && session.createdBy === user?.uid && (
            <Button variant="destructive" onClick={handleEndSession} className="mb-8">End Session</Button>
        )}

        <div>
            <Card>
              <CardHeader>
                <CardTitle>Participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                    {participants.map((name, i) => <li key={i}>{name}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
    </PageLayout>
  )
}
