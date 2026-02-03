"use client"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Play, Calculator } from "lucide-react"
import { curriculum } from "@/lib/curriculum"
import Link from "next/link"
import { CourseProgressBadge } from "@/components/course-progress-badge"
import { TopicProgressButton } from "@/components/topic-progress-button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

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
    <PageLayout>
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase">
          Learning Resources
        </h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground">
          Khan Academy video lessons organized by unit and topic
        </p>
      </div>

      <div className="space-y-8">
        <Accordion type="multiple" className="space-y-6">
          {curriculum.map((course, index) => (
            <ScrollReveal key={course.id} delay={index * 0.1} className="w-full">
              <AccordionItem 
                value={course.id} 
                className="border-4 border-border bg-card rounded-2xl shadow-lg px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-6 group">
                <div className="flex items-center gap-4 text-left w-full">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Calculator className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{course.name}</h2>
                    <p className="text-sm font-bold text-muted-foreground mt-1">
                      {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}{" "}
                      video lessons
                    </p>
                  </div>
                  <div className="ml-auto mr-4">
                    <CourseProgressBadge
                      courseId={course.id}
                      totalTopics={course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <Accordion type="multiple" className="w-full pt-2 space-y-4">
                  {course.units.map((unit, unitIdx) => (
                    <AccordionItem 
                      key={unitIdx} 
                      value={`unit-${unitIdx}`} 
                      className="border-2 border-black/5 bg-white/40 rounded-xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div>
                          <div className="font-bold text-lg text-black">{unit.name}</div>
                          <div className="text-sm font-bold text-muted-foreground">{unit.topics.length} topics</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2 pb-4">
                          {unit.topics.map((topic, topicIdx) => (
                            <div
                              key={topicIdx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-black/5 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                              <div className="flex-1">
                                <div className="font-bold text-base text-black">{topic.name}</div>
                                <div className="mt-1 text-xs font-bold text-black/40 uppercase tracking-wide">Khan Academy</div>
                              </div>
                              <div className="flex flex-col items-start sm:items-end gap-3 ml-0 sm:ml-4 sm:flex-row sm:items-center">
                                <Button size="sm" className="gap-2 bg-[#006B6B] hover:bg-[#005555] text-white font-bold rounded-lg" asChild>
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
            </ScrollReveal>
          ))}
        </Accordion>

        <section className="rounded-2xl border-4 border-black/10 bg-[#FFB627] p-8 shadow-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#006B6B] text-white shadow-sm">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-black tracking-tight">OpenStax Textbooks</h2>
              <p className="text-lg font-medium text-[#006B6B]">Free downloadable textbooks and resources</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OPENSTAX_RESOURCES.map((resource, index) => (
              <ScrollReveal key={index} delay={index * 0.1} yOffset={40} scaleOffset={0.04} className="h-full">
                <div className="flex flex-col justify-between rounded-xl border-2 border-black/5 bg-white/40 p-6 transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-md h-full">
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-black mb-2">{resource.title}</h3>
                  <p className="text-sm font-medium text-black/60">{resource.description}</p>
                </div>
                <Button asChild variant="outline" className="w-full gap-2 border-black/20 hover:bg-white bg-transparent font-bold text-[#006B6B]">
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4" />
                    Access Resource
                  </Link>
                </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
