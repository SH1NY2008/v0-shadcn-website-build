
'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getParentStudents } from '@/lib/teacher'
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface QuizResult {
  id: string
  category: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: any
}

interface StudentData {
  id: string
  name: string
  quizResults: QuizResult[]
}

export default function ParentPortalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [students, setStudents] = useState<StudentData[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        getParentStudents(user.uid).then((studentIds) => {
          if (studentIds.length > 0) {
            const unsubscribes = studentIds.map((studentId) => {
              const studentQuery = query(collection(db, 'users'), where('uid', '==', studentId))
              const studentUnsub = onSnapshot(studentQuery, (snapshot) => {
                if (!snapshot.empty) {
                  const studentDoc = snapshot.docs[0]
                  const resultsQuery = query(
                    collection(db, 'quiz_results'),
                    where('userId', '==', studentId)
                  )
                  const resultsUnsub = onSnapshot(resultsQuery, (resultsSnapshot) => {
                    const quizResults = resultsSnapshot.docs.map(
                      (doc) => ({ id: doc.id, ...doc.data() } as QuizResult)
                    )
                    setStudents((prev) => {
                      const existing = prev.find((s) => s.id === studentId)
                      if (existing) {
                        return prev.map((s) =>
                          s.id === studentId ? { ...s, quizResults } : s
                        )
                      } else {
                        return [
                          ...prev,
                          {
                            id: studentId,
                            name: studentDoc.data().displayName,
                            quizResults,
                          },
                        ]
                      }
                    })
                  })
                  return resultsUnsub
                }
              })
              return studentUnsub
            })

            return () => unsubscribes.forEach((unsub) => unsub())
          }
        })
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Parent Portal</h1>
        {students.map((student) => (
          <div key={student.id} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{student.name}'s Progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.quizResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <CardTitle>{result.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Score: {result.score} / {result.totalQuestions}
                    </p>
                    <p>Percentage: {result.percentage}%</p>
                    <p className="text-sm text-gray-500 mt-4">
                      {new Date(result.completedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
