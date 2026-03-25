
'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createAssignment, onTeacherAssignmentsUpdate, Assignment } from '@/lib/assignments'
import questionsData from '@/app/data/questions.json'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AssignmentBuilderPage() {
  const [title, setTitle] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        onTeacherAssignmentsUpdate(user.uid, setAssignments)
      }
    })
    return unsubscribe
  }, [])

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    )
  }

  const handleCreateAssignment = async () => {
    if (title && selectedQuestions.length > 0 && dueDate && user) {
        // In a real app, you would have a student selector.
        // For this demo, we'll assign to all users.
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const allUserIds = userSnapshot.docs.map(doc => doc.id);

        const questions = questionsData.filter(q => selectedQuestions.includes(q.id));

        await createAssignment(title, questions, user.uid, new Date(dueDate), allUserIds);
        setTitle('')
        setSelectedQuestions([])
        setDueDate('')
    }
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Assignment Builder</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Create New Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        <Button onClick={handleCreateAssignment}>Create Assignment</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>My Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assignments.map(assignment => (
                            <div key={assignment.id} className="p-4 border-b last:border-b-0">
                                <Link href={`/assignments/${assignment.id}`} className="font-bold hover:underline">{assignment.title}</Link>
                                <p className="text-sm text-gray-500">Due: {format(assignment.dueDate.toDate(), 'PPpp')}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Select Questions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                    {questionsData.map((question) => (
                        <div key={question.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Checkbox 
                                id={question.id}
                                checked={selectedQuestions.includes(question.id)}
                                onCheckedChange={() => handleToggleQuestion(question.id)}
                            />
                            <label htmlFor={question.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {question.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
                            </label>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </PageLayout>
  )
}
