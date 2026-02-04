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
import { useQuizSound } from "@/hooks/use-quiz-sound"
import { useQuizHaptics } from "@/hooks/use-quiz-haptics"

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

  const { playCorrect, playIncorrect, playComplete } = useQuizSound()
  const { hapticSuccess, hapticError, hapticImpact } = useQuizHaptics()

  useEffect(() => {
    if (category) {
      const filtered = questionsData.filter((q: any) => q.category === category)
      setQuestions(filtered)
    }
  }, [category])

  const handleSelectAnswer = (value: string) => {
    if (showResult) return
    setSelectedAnswer(value)
    hapticImpact()
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return
    
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer
    if (isCorrect) {
      setScore(score + 1)
      playCorrect()
      hapticSuccess()
    } else {
      playIncorrect()
      hapticError()
    }
    
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizCompleted(true)
      playComplete()
      hapticSuccess()
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
          <div className="text-center p-8 rounded-xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="mx-auto bg-[#FFC971] border-4 border-black/10 p-4 rounded-full mb-6 w-24 h-24 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <CheckCircle2 className="w-12 h-12 text-[#2C2C2C]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] mb-4">Quiz Completed!</h2>
            
            <div className="space-y-8 my-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="text-7xl font-black text-[#006B6B] mb-2">{percentage}%</div>
                    <p className="text-xl font-bold text-[#2C2C2C]/60">You scored {score} out of {questions.length}</p>
                </div>
                
                <div className="w-full bg-black/5 h-6 rounded-full overflow-hidden border-2 border-black/10">
                    <div className="bg-[#006B6B] h-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
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
                    className="border-4 border-black/10 bg-white hover:bg-black/5 text-[#2C2C2C] font-black h-14 px-8 text-lg"
                >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Retry Quiz
                </Button>
                <Button 
                    onClick={() => router.push('/quizzes')}
                    size="lg"
                    className="border-4 border-black/10 bg-[#FFB627] hover:bg-[#FFC971] text-[#2C2C2C] font-black h-14 px-8 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                >
                    Back to Quizzes
                </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link href="/quizzes" className="inline-flex items-center text-sm font-bold text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors mb-4 uppercase tracking-wide">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
            </Link>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-2">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] leading-none">{category}</h1>
                <span className="text-lg font-bold text-[#2C2C2C]/60 bg-white/50 px-3 py-1 rounded-lg border-2 border-black/5">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </span>
            </div>
            <Progress value={progress} className="h-4 border-2 border-black/10 bg-white [&>div]:bg-[#006B6B]" />
        </div>

        <div className="mb-8 overflow-hidden rounded-xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="p-6 md:p-8">
                {currentQuestion.topic && (
                    <Badge variant="secondary" className="mb-6 text-sm font-black uppercase tracking-wider bg-[#FFC971] text-[#2C2C2C] border-2 border-black/10 px-3 py-1 hover:bg-[#FFC971]">
                        {currentQuestion.topic}
                    </Badge>
                )}
                <div className="text-xl md:text-2xl leading-relaxed font-bold text-[#2C2C2C] mb-8">
                    <MathText content={currentQuestion.content} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option: any) => {
                    const isSelected = selectedAnswer === option.id
                    const isCorrect = option.id === currentQuestion.correctAnswer
                    
                    let variantClass = "hover:border-[#006B6B] hover:bg-[#006B6B]/5 cursor-pointer border-black/10 bg-white"
                    let iconClass = "border-black/10 bg-black/5 text-[#2C2C2C]"
                    
                    if (showResult) {
                        if (isCorrect) {
                            variantClass = "border-[#006B6B] bg-[#006B6B]/10 ring-2 ring-[#006B6B]"
                            iconClass = "border-[#006B6B] bg-[#006B6B] text-white"
                        } else if (isSelected && !isCorrect) {
                            variantClass = "border-red-500 bg-red-50 ring-2 ring-red-500"
                            iconClass = "border-red-500 bg-red-500 text-white"
                        } else {
                            variantClass = "opacity-50 border-black/10 bg-black/5"
                        }
                    } else if (isSelected) {
                        variantClass = "border-[#006B6B] bg-[#006B6B]/10 ring-2 ring-[#006B6B]"
                        iconClass = "border-[#006B6B] bg-[#006B6B] text-white"
                    }

                    return (
                        <div 
                            key={option.id}
                            onClick={() => handleSelectAnswer(option.id)}
                            className={cn(
                                "p-4 md:p-6 border-4 rounded-xl transition-all duration-200 flex items-center relative font-bold text-lg",
                                variantClass
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg border-2 flex items-center justify-center mr-4 font-black text-base shrink-0 transition-colors",
                                iconClass
                            )}>
                                {option.id}
                            </div>
                            <div className="flex-1 text-[#2C2C2C]">
                                <MathText content={option.content} />
                            </div>
                            {showResult && isCorrect && (
                                <CheckCircle2 className="absolute right-4 text-[#006B6B] h-8 w-8" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                                <XCircle className="absolute right-4 text-red-500 h-8 w-8" />
                            )}
                        </div>
                    )
                })}
                </div>
            </div>
            <div className="bg-black/5 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-black/10">
                <div className="text-lg font-black text-[#2C2C2C] uppercase tracking-wide bg-white px-4 py-2 rounded-lg border-2 border-black/10">
                    Score: {score} / {questions.length}
                </div>
                {!showResult ? (
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedAnswer}
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-black h-14 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
                    >
                        Submit Answer
                    </Button>
                ) : (
                    <Button 
                        onClick={handleNext} 
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] border-4 border-black/10 bg-[#FFB627] hover:bg-[#FFC971] text-[#2C2C2C] font-black h-14 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                    >
                        {currentQuestionIndex < questions.length - 1 ? (
                            <>
                                Next Question
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        ) : (
                            <>
                                Finish Quiz
                                <CheckCircle2 className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
