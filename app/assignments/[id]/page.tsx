
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAssignment, submitAssignment, Assignment } from '@/lib/assignments'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { MathText } from '../../components/MathText'

export default function AssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (assignmentId) {
      getAssignment(assignmentId).then(setAssignment)
    }
  }, [assignmentId])

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmit = async () => {
    if (!user || !assignment) return

    let score = 0;
    for(const q of assignment.questions) {
        if (answers[q.id] === q.correctAnswer) {
            score++;
        }
    }

    await submitAssignment(assignmentId, user.uid, answers, score)
    setSubmitted(true)
  }

  if (!assignment) {
    return <PageLayout>Loading assignment...</PageLayout>
  }

  if (submitted) {
    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Assignment Submitted!</h1>
                <p className="text-xl">Your score will be calculated and available soon.</p>
                <Button onClick={() => router.push('/assignments')} className="mt-4">Back to Assignments</Button>
            </div>
        </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{assignment.title}</h1>
        <p className="text-gray-500 mb-8">Due: {new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}</p>

        {assignment.questions.map((question) => (
          <Card key={question.id} className="mb-8">
            <CardHeader>
              <MathText content={question.content} />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {question.options.map((option: any) => (
                <Button
                  key={option.id}
                  variant={answers[question.id] === option.id ? 'default' : 'outline'}
                  onClick={() => handleSelectAnswer(question.id, option.id)}
                >
                  <MathText content={option.content} />
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button onClick={handleSubmit} size="lg">Submit Assignment</Button>
      </div>
    </PageLayout>
  )
}
