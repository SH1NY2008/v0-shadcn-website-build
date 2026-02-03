'use client'

import questionsData from '../data/questions.json'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calculator, BookOpen, Sigma, FunctionSquare, Pi, Triangle, Binary, Activity } from "lucide-react"

// Group by category
const categories = questionsData.reduce((acc: any, q: any) => {
  if (!acc[q.category]) {
    acc[q.category] = []
  }
  acc[q.category].push(q)
  return acc
}, {})

// Map categories to icons (fallback to Calculator)
const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes('algebra')) return <FunctionSquare className="h-6 w-6" />
  if (lower.includes('geometry')) return <Triangle className="h-6 w-6" />
  if (lower.includes('precalculus')) return <Activity className="h-6 w-6" />
  if (lower.includes('calculus')) return <Sigma className="h-6 w-6" />
  if (lower.includes('limit')) return <Pi className="h-6 w-6" />
  
  return <BookOpen className="h-6 w-6" />
}

export default function QuizzesPage() {
  return (
    <PageLayout>
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl md:text-7xl font-black tracking-tight text-black uppercase">
          Practice Quizzes
        </h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground">
          Master mathematics concepts from Algebra to Calculus
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(categories).map((category) => (
          <Card key={category} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {getCategoryIcon(category)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {categories[category].length} Questions
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold line-clamp-2">{category}</CardTitle>
              <CardDescription className="line-clamp-2">
                Practice problems focusing on {category.toLowerCase()} concepts and applications.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={`/quizzes/${encodeURIComponent(category)}`} className="w-full">
                <Button className="w-full group-hover:bg-primary/90" size="lg">
                  Start Quiz
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageLayout>
  )
}
