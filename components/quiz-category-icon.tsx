import { Activity, BookOpen, FunctionSquare, Pi, Sigma, Triangle } from "lucide-react"

type Props = { category: string; className?: string }

/** Shared icon mapping for quiz library / dashboard practice cards. */
export function QuizCategoryIcon({ category, className = "h-6 w-6" }: Props) {
  const lower = category.toLowerCase()
  if (lower.includes("algebra")) return <FunctionSquare className={className} />
  if (lower.includes("geometry")) return <Triangle className={className} />
  if (lower.includes("precalculus")) return <Activity className={className} />
  if (lower.includes("calculus")) return <Sigma className={className} />
  if (lower.includes("limit")) return <Pi className={className} />
  return <BookOpen className={className} />
}
