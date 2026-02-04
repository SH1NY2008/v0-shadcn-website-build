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
import { useState } from "react"
import { VideoPlayerDialog } from "@/components/video-player-dialog"

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
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null)

  return (
    <PageLayout>
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
          Resources
        </h1>
        <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
          Curated learning materials organized by course and unit.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
              <Calculator className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Courses</h2>
          </div>
          
          <Accordion type="multiple" className="space-y-6">
            {curriculum.map((course, index) => (
              <ScrollReveal key={course.id} delay={index * 0.1} className="w-full">
                <AccordionItem 
                  value={course.id} 
                  className="border-4 border-black/10 bg-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-6 px-6 group data-[state=open]:bg-black/5">
                    <div className="flex items-center gap-6 text-left w-full">
                      <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl border-4 border-black/10 bg-[#006B6B] text-white shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105">
                        <Calculator className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-black text-[#2C2C2C] tracking-tight uppercase">{course.name}</h3>
                        <p className="text-base font-bold text-[#2C2C2C]/60 mt-1">
                          {course.units.length} units • {course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}{" "}
                          video lessons
                        </p>
                      </div>
                      <div className="mr-4">
                        <CourseProgressBadge
                          courseId={course.id}
                          totalTopics={course.units.reduce((acc, unit) => acc + unit.topics.length, 0)}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="divide-y-4 divide-black/5">
                      {course.units.map((unit, unitIdx) => (
                        <Accordion type="single" collapsible key={unitIdx} className="w-full">
                          <AccordionItem value={`unit-${unitIdx}`} className="border-0">
                            <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-black/5">
                              <div className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFC971] text-sm font-black border-2 border-black/10 text-[#2C2C2C]">
                                  {unitIdx + 1}
                                </span>
                                <div className="text-left">
                                  <div className="font-bold text-lg text-[#2C2C2C]">{unit.name}</div>
                                  <div className="text-xs font-bold text-[#2C2C2C]/60 uppercase">{unit.topics.length} topics</div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {unit.topics.map((topic, topicIdx) => (
                                  <div
                                    key={topicIdx}
                                    className="flex flex-col justify-between gap-4 rounded-xl border-4 border-black/10 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                                  >
                                    <div>
                                      <div className="font-bold text-base text-[#2C2C2C] leading-tight mb-2">{topic.name}</div>
                                      <div className="inline-flex items-center rounded-md border-2 border-black/5 bg-black/5 px-2 py-1 text-xs font-bold text-[#2C2C2C]/60 uppercase">Video Lesson</div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 mt-2">
                                      <Button size="sm" className="flex-1 gap-2 border-2 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]" onClick={() => setSelectedVideo({ id: topic.videoId, title: topic.name })}>
                                        <Play className="h-4 w-4" />
                                        Watch
                                      </Button>
                                      <TopicProgressButton courseId={course.id} videoId={topic.videoId} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">OpenStax Textbooks</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OPENSTAX_RESOURCES.map((resource, index) => (
              <ScrollReveal key={index} delay={index * 0.1} yOffset={40} scaleOffset={0.04} className="h-full">
                <div className="flex flex-col justify-between rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] h-full">
                  <div className="mb-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black/10 bg-[#FFB627]/20 text-[#006B6B]">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-black text-xl text-[#2C2C2C] uppercase mb-2 leading-tight">{resource.title}</h3>
                    <p className="text-sm font-bold text-[#2C2C2C]/60">{resource.description}</p>
                  </div>
                  <Button asChild className="w-full gap-2 border-4 border-black/10 bg-white hover:bg-black/5 text-[#2C2C2C] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                      Access Resource
                      <BookOpen className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>

      {selectedVideo && (
        <VideoPlayerDialog
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoId={selectedVideo.id}
          title={selectedVideo.title}
        />
      )}
    </PageLayout>
  )
}
