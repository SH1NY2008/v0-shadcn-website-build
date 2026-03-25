
'use client'

import { useState } from 'react'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import questionsData from '@/app/data/questions.json'
import { MathText } from '../components/MathText'

const topics = [...new Set(questionsData.map(q => q.category))]
const difficulties = ['Easy', 'Medium', 'Hard']

export default function PracticePage() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [generatedProblem, setGeneratedProblem] = useState<any | null>(null)

  const handleGenerate = () => {
    const problemsInTopic = questionsData.filter(q => q.category === topic)
    if (problemsInTopic.length > 0) {
      const problem = { ...problemsInTopic[Math.floor(Math.random() * problemsInTopic.length)] }
      // Simulate generating a new problem by adding a note to the content
      problem.content = `<div><p className="text-sm text-gray-500 mb-2">Generated (${difficulty})</p>${problem.content}</div>`
      setGeneratedProblem(problem)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Problem Generator</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate a Practice Problem</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="flex-1">
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
                </div>
                <div className="flex-1">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select onValueChange={setDifficulty} value={difficulty}>
                    <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select a difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        {difficulties.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handleGenerate} disabled={!topic}>Generate Problem</Button>
          </CardContent>
        </Card>

        {generatedProblem && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <MathText content={generatedProblem.content} />
              <div className="grid grid-cols-1 gap-4 mt-4">
                {generatedProblem.options.map((option: any) => (
                    <Button key={option.id} variant="outline">
                        <MathText content={option.content} />
                    </Button>
                ))}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
