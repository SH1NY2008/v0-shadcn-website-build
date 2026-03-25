
'use client'

import { useState, useEffect } from 'react'
import { onChallengesUpdate, createChallenge, Challenge } from '@/lib/challenges'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTeacherMode } from '@/context/teacher-mode-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import questionsData from '@/app/data/questions.json'
import { formatDistanceToNow } from 'date-fns'

const topics = [...new Set(questionsData.map(q => q.category))]

function CreateChallengeForm({ user }: { user: User }) {
  const [topic, setTopic] = useState('')
  const [timeLimit, setTimeLimit] = useState(300) // 5 minutes default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (topic && user) {
      await createChallenge(topic, timeLimit, user.uid)
      setTopic('')
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Label htmlFor="topic">Topic</Label>
            <Select onValueChange={setTopic} value={topic}>
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
            <Input 
              id="timeLimit"
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            />
          <Button type="submit" disabled={!topic}>Create Challenge</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [user, setUser] = useState<User | null>(null)
  const { userRole } = useTeacherMode()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onChallengesUpdate(setChallenges)
    return unsubscribe
  }, [])

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Challenges</h1>
        {userRole === 'teacher' && user && <CreateChallengeForm user={user} />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <CardTitle>{challenge.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{challenge.questions.length} questions</p>
                <p>{challenge.participants.length} participants</p>
                <p className="text-sm text-gray-500">Created {challenge.createdAt && formatDistanceToNow(challenge.createdAt.toDate(), { addSuffix: true })}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/challenges/${challenge.id}`} passHref>
                  <Button>Join Challenge</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
