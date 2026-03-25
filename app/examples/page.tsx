
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import workedExamples from '@/app/data/worked-examples.json'
import { MathText } from '../components/MathText'

const categories = [...new Set(workedExamples.map(e => e.category))]

export default function WorkedExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredExamples = selectedCategory === 'All' 
    ? workedExamples 
    : workedExamples.filter(e => e.category === selectedCategory)

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Worked Examples</h1>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExamples.map(example => (
            <Link key={example.id} href={`/examples/${example.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>{example.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <MathText content={example.problem} />
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
