
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { onChallengeUpdate, joinChallenge, submitChallengeAnswer, Challenge, Participant } from '@/lib/challenges'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MathText } from '../../components/MathText'
import { cn } from '@/lib/utils'

function Leaderboard({ participants }: { participants: Participant[] }) {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sortedParticipants.map((entry, index) => (
          <div key={entry.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <div className="text-xl font-bold w-10 text-center">{index + 1}</div>
            <Avatar>
              <AvatarImage src={entry.avatar} />
              <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold">{entry.name}</p>
              <p className="text-sm text-gray-500">{entry.score} pts</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user && challengeId) {
        joinChallenge(challengeId, user.uid, user.displayName || 'Anonymous', user.photoURL || '')
      }
    })
    return unsubscribe
  }, [challengeId])

  useEffect(() => {
    if (challengeId) {
      const unsubscribe = onChallengeUpdate(challengeId, (challenge) => {
        setChallenge(challenge)
        if (challenge && timeLeft === null) {
            setTimeLeft(challenge.timeLimit)
        }
      })
      return unsubscribe
    }
  }, [challengeId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleSubmit = () => {
    if (!selectedAnswer || !user) return
    const isCorrect = selectedAnswer === challenge!.questions[currentQuestionIndex].correctAnswer
    submitChallengeAnswer(challengeId, user.uid, challenge!.questions[currentQuestionIndex].id, isCorrect)
    
    if (currentQuestionIndex < challenge!.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
    } else {
        // Challenge finished for this user
    }
  }

  if (!challenge) {
    return <PageLayout>Loading challenge...</PageLayout>
  }

  if (timeLeft !== null && timeLeft <= 0) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Challenge Over!</h1>
          <Leaderboard participants={challenge.participants} />
        </div>
      </PageLayout>
    )
  }

  const currentQuestion = challenge.questions[currentQuestionIndex]
  const me = user ? challenge.participants.find(p => p.id === user.uid) : null
  const hasAnswered = me && me.answers[currentQuestion.id]

  return (
    <PageLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{challenge.topic}</h1>
            <div className="text-2xl font-bold">Time Left: {timeLeft}s</div>
          </div>
          <Progress value={(currentQuestionIndex / challenge.questions.length) * 100} className="mb-8" />
          <Card>
            <CardHeader>
              <MathText content={currentQuestion.content} />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={selectedAnswer === option.id ? 'default' : 'outline'}
                  onClick={() => setSelectedAnswer(option.id)}
                  disabled={!!hasAnswered}
                >
                  <MathText content={option.content} />
                </Button>
              ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} disabled={!selectedAnswer || !!hasAnswered}>
                    {hasAnswered ? 'Answered' : 'Submit'}
                </Button>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Leaderboard participants={challenge.participants} />
        </div>
      </div>
    </PageLayout>
  )
}
