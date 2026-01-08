"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, RefreshCw, CheckCircle, XCircle, Calculator } from "lucide-react"
import { Input } from "@/components/ui/input"
import { generateMathProblem } from "@/app/actions/practice"

interface MathProblem {
  expression: string
  answer: number | string
  instruction?: string
  explanation?: string
}

interface PracticeModalProps {
  topicName?: string
}

export function PracticeModal({ topicName = "General Math" }: PracticeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchProblem = async () => {
    setLoading(true)
    setResult(null)
    setUserAnswer("")
    setShowExplanation(false)
    setErrorMessage("")

    try {
      const problemData = await generateMathProblem(topicName)
      setProblem(problemData)
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate problem.")
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!problem) return

    const normalize = (val: string | number) => String(val).toLowerCase().replace(/\s+/g, "").replace(/,/g, "").trim()

    const userNormalized = normalize(userAnswer)
    const answerNormalized = normalize(problem.answer)

    const userNum = Number.parseFloat(userNormalized)
    const answerNum = Number.parseFloat(answerNormalized)

    if (!isNaN(userNum) && !isNaN(answerNum)) {
      if (Math.abs(userNum - answerNum) < 0.01) {
        setResult("correct")
        setShowExplanation(true)
        return
      }
    }

    if (userNormalized === answerNormalized) {
      setResult("correct")
      setShowExplanation(true)
    } else {
      setResult("incorrect")
    }
  }

  const handleNewProblem = () => {
    setProblem(null)
    setResult(null)
    setUserAnswer("")
    setShowExplanation(false)
    setErrorMessage("")
    fetchProblem()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open && !problem && !loading) fetchProblem()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calculator className="w-4 h-4 mr-2" />
          Practice Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Practice Question</DialogTitle>
          <DialogDescription>Test your knowledge of {topicName}</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating problem...</p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <p className="text-sm text-center text-muted-foreground">{errorMessage}</p>
              <Button onClick={handleNewProblem} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : problem ? (
            <>
              {problem.instruction && (
                <div className="text-sm font-medium text-muted-foreground">{problem.instruction}</div>
              )}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-lg font-mono text-center">{problem.expression}</p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Your answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") checkAnswer()
                  }}
                  disabled={result === "correct"}
                  className="text-center"
                />
                <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer.trim() || result === "correct"}>
                  Check Answer
                </Button>
              </div>

              {result === "correct" && (
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-green-900 dark:text-green-100">Correct! Great job.</p>
                    {showExplanation && problem.explanation && (
                      <p className="text-sm text-green-800 dark:text-green-200">{problem.explanation}</p>
                    )}
                  </div>
                </div>
              )}

              {result === "incorrect" && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-red-900 dark:text-red-100">Incorrect. Try again.</p>
                    <p className="text-sm text-red-800 dark:text-red-200">The correct answer is: {problem.answer}</p>
                    {problem.explanation && (
                      <p className="text-sm text-red-800 dark:text-red-200 mt-2">{problem.explanation}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={handleNewProblem} variant="outline" disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Problem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
