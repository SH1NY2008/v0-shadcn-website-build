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

  const fetchProblemFromOpenRouter = async () => {
    setLoading(true)
    setResult(null)
    setUserAnswer("")
    setShowExplanation(false)
    setErrorMessage("")

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    if (!apiKey) {
      setErrorMessage("OpenRouter API key missing")
      setLoading(false)
      return
    }

    const prompt = `Generate a single practice problem for the topic: "${topicName}".
Return ONLY a valid JSON object with this structure:
{
  "instruction": "string",
  "expression": "string",
  "answer": "string or number",
  "explanation": "string"
}`

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.2-24b-instruct:free", // reliable free model
          messages: [
            { role: "system", content: "You are a JSON-only math problem generator." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error((errData as any)?.error?.message || res.statusText || "OpenRouter API error")
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ""
      if (!text) throw new Error("No content returned from OpenRouter API")

      const problemData = JSON.parse(text)
      if (!problemData.expression || problemData.answer === undefined) {
        throw new Error("Invalid problem structure returned by model")
      }

      setProblem({
        instruction: problemData.instruction || "Solve",
        expression: problemData.expression,
        answer: problemData.answer,
        explanation: problemData.explanation || "",
      })
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate problem.")
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!problem) return

    const normalize = (val: string | number) =>
      String(val).toLowerCase().replace(/\s+/g, "").replace(/,/g, "").trim()

    const userNormalized = normalize(userAnswer)
    const answerNormalized = normalize(problem.answer)

    const userNum = parseFloat(userNormalized)
    const answerNum = parseFloat(answerNormalized)

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
    fetchProblemFromOpenRouter()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open && !problem && !loading) fetchProblemFromOpenRouter()
    }}>
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
              <Button onClick={handleNewProblem} variant="outline" size="sm">Try Again</Button>
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
                  onKeyDown={(e) => { if (e.key === "Enter") checkAnswer() }}
                  disabled={result === "correct"}
                  className="text-center"
                />
                <Button
                  onClick={checkAnswer}
                  className="w-full"
                  disabled={!userAnswer.trim() || result === "correct"}
                >
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
