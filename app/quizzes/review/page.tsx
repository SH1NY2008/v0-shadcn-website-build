
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { auth, db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'

interface ReviewItem {
    id: string;
    questionId: string;
    level: number;
}

export default function ReviewQuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [reviewItems, setReviewItems] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const { playCorrect, playIncorrect, playComplete } = useQuizSound()
  const { hapticSuccess, hapticError, hapticImpact } = useQuizHaptics()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        const q = query(
          collection(db, 'wrong_answers'),
          where('userId', '==', user.uid),
          where('nextReview', '<=', new Date())
        )

        const unsub = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ReviewItem))
          setReviewItems(items)
          const questionIds = items.map((item) => item.questionId)
          const reviewQuestions = questionsData.filter((q) =>
            questionIds.includes(q.id)
          )
          setQuestions(reviewQuestions)
        })
        return unsub
      }
    })
    return unsubscribe
  }, [])

  const handleSelectAnswer = (value: string) => {
    if (showResult) return
    setSelectedAnswer(value)
    hapticImpact()
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer
    const reviewItem = reviewItems[currentQuestionIndex];
    const reviewItemRef = doc(db, 'wrong_answers', reviewItem.id);

    if (isCorrect) {
      const nextReview = new Date()
      const newLevel = reviewItem.level + 1;
      nextReview.setDate(nextReview.getDate() + 2 ** newLevel) // exponential backoff
      await updateDoc(reviewItemRef, { nextReview, level: newLevel });
      playCorrect()
      hapticSuccess()
    } else {
      await updateDoc(reviewItemRef, { level: 1 }); // a wrong answer resets the level
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

  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">No questions to review right now!</h2>
          <Button onClick={() => router.push('/quizzes')} variant="outline">
            Return to Quizzes
          </Button>
        </div>
      </PageLayout>
    )
  }

  const progress = ((currentQuestionIndex) / questions.length) * 100

  if (quizCompleted) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto py-10">
          <div className="text-center p-8 rounded-xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] mb-4">Review Complete!</h2>
             <Button onClick={() => router.push('/quizzes')} size="lg" className="mt-4">Back to Quizzes</Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
         <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] leading-none mb-4">Review Session</h1>
         <Progress value={progress} className="h-4 border-2 border-black/10 bg-white [&>div]:bg-[#006B6B] mb-8" />
        <div className="mb-8 overflow-hidden rounded-xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="p-6 md:p-8">
             <div className="text-xl md:text-2xl leading-relaxed font-bold text-[#2C2C2C] mb-8">
               <MathText content={currentQuestion.content} />
             </div>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option: any) => {
                const isSelected = selectedAnswer === option.id
                const isCorrect = option.id === currentQuestion.correctAnswer
                
                let variantClass = "hover:border-[#006B6B] hover:bg-[#006B6B]/5 cursor-pointer border-black/10 bg-white"
                
                if (showResult) {
                    if (isCorrect) {
                        variantClass = "border-[#006B6B] bg-[#006B6B]/10 ring-2 ring-[#006B6B]"
                    } else if (isSelected && !isCorrect) {
                        variantClass = "border-red-500 bg-red-50 ring-2 ring-red-500"
                    } else {
                        variantClass = "opacity-50 border-black/10 bg-black/5"
                    }
                } else if (isSelected) {
                    variantClass = "border-[#006B6B] bg-[#006B6B]/10 ring-2 ring-[#006B6B]"
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
                       <MathText content={option.content} />
                    </div>
                )
              })}
            </div>
          </div>
          <div className="bg-black/5 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-black/10">
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
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
