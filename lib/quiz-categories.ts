import questionsData from "@/app/data/questions.json"

/** Group flat question list by `category` (used on dashboard + quizzes). */
export function getQuestionsGroupedByCategory(): Record<string, unknown[]> {
  return (questionsData as { category: string }[]).reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {} as Record<string, unknown[]>)
}
