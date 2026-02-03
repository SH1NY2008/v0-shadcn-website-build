'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import questionsData from '../../data/questions.json'
import { MathText } from '../../components/MathText'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function QuizCategoryPage() {
  const params = useParams()
  const router = useRouter()
  // params.category might be undefined initially or array
  const categoryParam = params?.category
  const category = typeof categoryParam === 'string' ? decodeURIComponent(categoryParam) : ''
  
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    if (category) {
      const filtered = questionsData.filter((q: any) => q.category === category)
      setQuestions(filtered)
    }
  }, [category])

  const handleSelectAnswer = (value: string) => {
    if (showResult) return
    setSelectedAnswer(value)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return
    
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer
    if (isCorrect) setScore(score + 1)
    
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizCompleted(true)
    }
  }

  if (!category) return <div>Invalid category</div>
  if (questions.length === 0) return (
    <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">Loading questions...</h2>
            <Button onClick={() => router.push('/quizzes')} variant="outline">
                Return to Quizzes
            </Button>
        </div>
    </PageLayout>
  )

  const progress = ((currentQuestionIndex) / questions.length) * 100

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto py-10">
          <Card className="text-center p-8 border-4 border-primary/10">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-20 h-20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-4xl font-black uppercase mb-2">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center">
                    <div className="text-6xl font-black text-primary mb-2">{percentage}%</div>
                    <p className="text-xl text-muted-foreground">You scored {score} out of {questions.length}</p>
                </div>
                
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 mt-6">
                <Button 
                    onClick={() => {
                        setQuizCompleted(false)
                        setCurrentQuestionIndex(0)
                        setScore(0)
                        setShowResult(false)
                        setSelectedAnswer(null)
                    }}
                    variant="outline"
                    size="lg"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retry Quiz
                </Button>
                <Button 
                    onClick={() => router.push('/quizzes')}
                    size="lg"
                >
                    Back to Quizzes
                </Button>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link href="/quizzes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
            </Link>
            
            <div className="flex justify-between items-end mb-2">
                <h1 className="text-3xl font-bold">{category}</h1>
                <span className="text-sm font-medium text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-8 overflow-hidden border-2">
            <CardContent className="pt-6">
                {currentQuestion.topic && (
                    <Badge variant="secondary" className="mb-4 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20">
                        {currentQuestion.topic}
                    </Badge>
                )}
                <div className="text-lg md:text-xl leading-relaxed font-medium mb-8">
                    <MathText content={currentQuestion.content} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option: any) => {
                    const isSelected = selectedAnswer === option.id
                    const isCorrect = option.id === currentQuestion.correctAnswer
                    
                    let variantClass = "hover:border-primary hover:bg-accent/50 cursor-pointer"
                    
                    if (showResult) {
                        if (isCorrect) {
                            variantClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 ring-1 ring-green-500"
                        } else if (isSelected && !isCorrect) {
                            variantClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-1 ring-red-500"
                        } else {
                            variantClass = "opacity-50"
                        }
                    } else if (isSelected) {
                        variantClass = "border-primary bg-primary/5 ring-1 ring-primary"
                    }

                    return (
                        <div 
                            key={option.id}
                            onClick={() => handleSelectAnswer(option.id)}
                            className={cn(
                                "p-4 border-2 rounded-xl transition-all duration-200 flex items-center relative",
                                variantClass
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold text-sm shrink-0",
                                showResult && isCorrect ? "border-green-500 bg-green-500 text-white" :
                                showResult && isSelected && !isCorrect ? "border-red-500 bg-red-500 text-white" :
                                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                            )}>
                                {option.id}
                            </div>
                            <div className="flex-1">
                                <MathText content={option.content} />
                            </div>
                            {showResult && isCorrect && (
                                <CheckCircle2 className="absolute right-4 text-green-500 h-6 w-6" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                                <XCircle className="absolute right-4 text-red-500 h-6 w-6" />
                            )}
                        </div>
                    )
                })}
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-between items-center border-t">
                <div className="text-sm text-muted-foreground font-medium">
                    Score: {score} / {questions.length}
                </div>
                {!showResult ? (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedAnswer}
                        size="lg"
                        className="w-full md:w-auto min-w-[150px]"
                    >
                        Submit Answer
                    </Button>
                ) : (
                    <Button 
                        onClick={handleNext} 
                        size="lg"
                        className="w-full md:w-auto min-w-[150px]"
                    >
                        {currentQuestionIndex < questions.length - 1 ? (
                            <>
                                Next Question
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Finish Quiz
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}
