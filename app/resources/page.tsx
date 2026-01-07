import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, Play, Calculator } from "lucide-react"
import { curriculum } from "@/lib/curriculum"
import Link from "next/link"

const API_ENDPOINTS: Record<string, string> = {
  "algebra-1": "/api/math/algebra1",
  "algebra-2": "/api/math/algebra2",
  precalculus: "/api/math/precalculus",
  "calculus-1": "/api/math/calculus-ab",
  "calculus-2": "/api/math/calculus-bc",
}

async function getTextbookData(courseId: string) {
  const endpoint = API_ENDPOINTS[courseId]
  if (!endpoint) return null

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${endpoint}`, {
      cache: "force-cache",
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch textbook for ${courseId}:`, error)
    return null
  }
}

export default async function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Learning Resources</h1>
          <p className="text-lg text-muted-foreground">Khan Academy video lessons organized by unit and topic</p>
        </div>

        <div className="mb-8">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for topics, concepts, or formulas..." className="pl-9" />
          </div>
        </div>

        <div className="space-y-8">
          {curriculum.map(async (course) => {
            const textbook = await getTextbookData(course.id)

            return (
              <section key={course.id} className="rounded-lg border bg-card p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{course.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}{" "}
                      video lessons
                    </p>
                  </div>
                  {textbook && (
                    <Button asChild variant="outline" className="gap-2 bg-transparent">
                      <Link href={textbook.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Download {textbook.openstaxBookTitle}</span>
                        <span className="sm:hidden">Textbook</span>
                      </Link>
                    </Button>
                  )}
                </div>

                <Accordion type="multiple" className="w-full">
                  {course.units.map((unit, unitIdx) => (
                    <AccordionItem key={unitIdx} value={`unit-${unitIdx}`}>
                      <AccordionTrigger className="text-left">
                        <div>
                          <div className="font-semibold">{unit.name}</div>
                          <div className="text-sm text-muted-foreground">{unit.topics.length} topics</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-4">
                          {unit.topics.map((topic, topicIdx) => (
                            <div
                              key={topicIdx}
                              className="flex items-center justify-between rounded-lg border bg-background p-4 transition-all hover:bg-accent/5"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{topic.name}</div>
                                <div className="mt-1 text-sm text-muted-foreground">Khan Academy</div>
                              </div>
                              <Button size="sm" className="ml-4 gap-2" asChild>
                                <Link href={`https://www.youtube.com/watch?v=${topic.videoId}`} target="_blank">
                                  <Play className="h-4 w-4" />
                                  Watch
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
