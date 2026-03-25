
'use client'

import { useState, useEffect } from 'react'
import { onUserQuizResultsUpdate, QuizResult } from '@/lib/progress'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns'
import groupBy from 'lodash/groupBy'

export default function ProgressPage() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        onUserQuizResultsUpdate(user.uid, setResults)
      }
    })
    return unsubscribe
  }, [])

  const sortedResults = [...results].sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());

  const resultsByTopic: { [key: string]: QuizResult[] } = groupBy(sortedResults, 'category');

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Progress</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={sortedResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="createdAt" tickFormatter={(tick) => format(tick.toDate(), 'MMM d')} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {Object.entries(resultsByTopic).map(([topic, topicResults]) => (
             <Card key={topic} className="mb-8">
                <CardHeader>
                    <CardTitle>{topic}</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topicResults.map(result => (
                                <TableRow key={result.id}>
                                    <TableCell>{format(result.createdAt.toDate(), 'PPpp')}</TableCell>
                                    <TableCell>{result.score}</TableCell>
                                    <TableCell>{result.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        ))}
      </div>
    </PageLayout>
  )
}
