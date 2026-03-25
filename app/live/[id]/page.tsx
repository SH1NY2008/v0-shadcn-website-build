
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useTeacherMode } from '@/context/teacher-mode-context'
import { 
    getLiveSession, 
    joinLiveSession, 
    endLiveSession, 
    sendChatMessage, 
    onChatMessagesUpdate, 
    LiveSession, 
    ChatMessage 
} from '@/lib/live'
import { getDoc, doc } from 'firebase/firestore'

export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<LiveSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const { userRole } = useTeacherMode()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        setUser(user)
        if (user && sessionId) {
            await joinLiveSession(sessionId, user.uid)
        }
    })

    if (sessionId) {
        getLiveSession(sessionId).then(setSession)
        const unsubscribeMessages = onChatMessagesUpdate(sessionId, setMessages)
        return () => {
            unsubscribeAuth()
            unsubscribeMessages()
        }
    }
    return unsubscribeAuth
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  const handleSendMessage = async () => {
    if (user && newMessage.trim()) {
      await sendChatMessage(sessionId, user.uid, user.displayName || 'Anonymous', newMessage)
      setNewMessage('')
    }
  }

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[500px]">
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-lg px-4 py-2 ${msg.userId === user?.uid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                <p className="font-bold text-sm">{msg.userName}</p>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2 p-4 border-t">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
      </div>
    </PageLayout>
  )
}
