import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, Play, Calculator } from "lucide-react"
import { curriculum } from "@/lib/curriculum"
import Link from "next/link"
import { CourseProgressBadge } from "@/components/course-progress-badge"
import { TopicProgressButton } from "@/components/topic-progress-button"

const OPENSTAX_RESOURCES = [
  {
    title: "Elementary Algebra (Algebra Foundation)",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/ElementaryAlgebra2e-WEB_EjIP4sI.pdf",
    description: "OpenStax Elementary Algebra",
  },
  {
    title: "College Algebra",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/CollegeAlgebra-OP.pdf",
    description: "OpenStax College Algebra",
  },
  {
    title: "Algebra & Trigonometry",
    url: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
    description: "Algebra and Trigonometry (OpenStax)",
  },
  {
    title: "Precalculus",
    url: "https://openstax.org/details/books/precalculus-2e",
    description: "Precalculus (OpenStax)",
  },
  {
    title: "Calculus I",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_1_-_WEB_68M1Z5W.pdf",
    description: "Calculus Volume 1 (OpenStax)",
  },
  {
    title: "Calculus II",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_2_-_WEB.pdf",
    description: "Calculus Volume 2 (OpenStax)",
  },
]

export default function ResourcesPage() {
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
          <Accordion type="multiple" className="space-y-4">
            {curriculum.map((course) => (
              <AccordionItem key={course.id} value={course.id} className="border bg-card px-6 rounded-lg">
                <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                            <Calculator className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">{course.name}</h2>
                            <p className="text-sm text-muted-foreground font-normal">
                              {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}{" "}
                              video lessons
                            </p>
                          </div>
                          <div className="ml-auto">
                            <CourseProgressBadge
                              courseId={course.id}
                              totalTopics={course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}
                            />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple" className="w-full pt-2 pb-6">
                          {course.units.map((unit, unitIdx) => (
                      <AccordionItem key={unitIdx} value={`unit-${unitIdx}`} className="border-b-0">
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
                              <div className="flex flex-col items-end gap-2 ml-4 sm:flex-row sm:items-center">
                                <Button size="sm" className="gap-2" asChild>
                                  <Link href={`https://www.youtube.com/watch?v=${topic.videoId}`} target="_blank">
                                    <Play className="h-4 w-4" />
                                    Watch
                                  </Link>
                                </Button>
                                <TopicProgressButton courseId={course.id} videoId={topic.videoId} />
                              </div>
                            </div>
                          ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <section className="rounded-lg border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">OpenStax Textbooks</h2>
                <p className="text-sm text-muted-foreground">Free downloadable textbooks and resources</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OPENSTAX_RESOURCES.map((resource, index) => (
                <div key={index} className="flex flex-col justify-between rounded-lg border bg-background p-4 transition-all hover:bg-accent/5">
                  <div className="mb-4">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4" />
                      Access Resource
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
