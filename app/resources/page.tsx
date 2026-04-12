"use client"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Play, Calculator, Library, Clapperboard, Search } from "lucide-react"
import { curriculum, type Course } from "@/lib/curriculum"
import { mergeCourses, subscribeCurriculumSettings } from "@/lib/curriculum-settings"
import { apCourses } from "@/lib/ap-courses"
import { CourseProgressBadge } from "@/components/course-progress-badge"
import { TopicProgressButton } from "@/components/topic-progress-button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { useState, useMemo, useEffect } from "react"
import { VideoPlayerDialog } from "@/components/video-player-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const TEXTBOOK_CATEGORY_LABELS = {
  math: "Math & statistics",
  science: "Science",
  "computer-science": "Computer science",
  "history-civics": "History & civics",
  "economics-psychology": "Economics & psychology",
} as const

type TextbookCategory = keyof typeof TEXTBOOK_CATEGORY_LABELS

const TEXTBOOK_CATEGORY_ORDER: TextbookCategory[] = [
  "math",
  "science",
  "computer-science",
  "history-civics",
  "economics-psychology",
]

type OpenStaxResource = {
  title: string
  url: string
  description: string
  category: TextbookCategory
}

const OPENSTAX_RESOURCES: OpenStaxResource[] = [
  {
    title: "Elementary Algebra (Algebra Foundation)",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/ElementaryAlgebra2e-WEB_EjIP4sI.pdf",
    description: "OpenStax Elementary Algebra",
    category: "math",
  },
  {
    title: "College Algebra",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/CollegeAlgebra-OP.pdf",
    description: "OpenStax College Algebra",
    category: "math",
  },
  {
    title: "Algebra & Trigonometry",
    url: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
    description: "Algebra and Trigonometry (OpenStax)",
    category: "math",
  },
  {
    title: "Precalculus",
    url: "https://openstax.org/details/books/precalculus-2e",
    description: "Precalculus (OpenStax)",
    category: "math",
  },
  {
    title: "Calculus I",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_1_-_WEB_68M1Z5W.pdf",
    description: "Calculus Volume 1 (OpenStax)",
    category: "math",
  },
  {
    title: "Calculus II",
    url: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_2_-_WEB.pdf",
    description: "Calculus Volume 2 (OpenStax)",
    category: "math",
  },
  {
    title: "Introductory Statistics 2e",
    url: "https://openstax.org/details/books/introductory-statistics-2e",
    description: "Introductory Statistics 2e (OpenStax)",
    category: "math",
  },
  {
    title: "University Physics Vol 1",
    url: "https://openstax.org/details/books/university-physics-volume-1",
    description: "University Physics Vol 1 (OpenStax)",
    category: "science",
  },
  {
    title: "University Physics Vol 2",
    url: "https://openstax.org/details/books/university-physics-volume-2",
    description: "University Physics Vol 2 (OpenStax)",
    category: "science",
  },
  {
    title: "University Physics Vol 3",
    url: "https://openstax.org/details/books/university-physics-volume-3",
    description: "University Physics Vol 3 (OpenStax)",
    category: "science",
  },
  {
    title: "Chemistry 2e",
    url: "https://openstax.org/details/books/chemistry-2e",
    description: "Chemistry 2e (OpenStax)",
    category: "science",
  },
  {
    title: "Biology 2e",
    url: "https://openstax.org/details/books/biology-2e",
    description: "Biology 2e (OpenStax)",
    category: "science",
  },
  {
    title: "Environmental Science",
    url: "https://openstax.org/details/books/introduction-environmental-science",
    description: "Environmental Science (OpenStax)",
    category: "science",
  },
  {
    title: "Think Java",
    url: "https://greenteapress.com/wp/think-java-2e/",
    description: "Think Java (Green Tea Press)",
    category: "computer-science",
  },
  {
    title: "CS Principles",
    url: "https://studio.code.org/courses/csp",
    description: "CS Principles (Code.org)",
    category: "computer-science",
  },
  {
    title: "AP US History",
    url: "https://openstax.org/details/books/us-history",
    description: "American History (OpenStax)",
    category: "history-civics",
  },
  {
    title: "AP World History",
    url: "https://library.oapen.org/handle/20.500.12657/25960",
    description: "World History: Cultures, States & Societies",
    category: "history-civics",
  },
  {
    title: "AP European History",
    url: "https://courses.lumenlearning.com/suny-hccc-worldhistory2/",
    description: "Western Civilization (Lumen Learning)",
    category: "history-civics",
  },
  {
    title: "AP US Government",
    url: "https://openstax.org/details/books/american-government-3e",
    description: "American Government 3e (OpenStax)",
    category: "history-civics",
  },
  {
    title: "AP Comparative Government",
    url: "https://open.umn.edu/opentextbooks/textbooks/comparative-politics",
    description: "Comparative Politics (open.umn.edu)",
    category: "history-civics",
  },
  {
    title: "AP Macroeconomics",
    url: "https://openstax.org/details/books/principles-macroeconomics-3e",
    description: "Principles of Macroeconomics 3e (OpenStax)",
    category: "economics-psychology",
  },
  {
    title: "AP Microeconomics",
    url: "https://openstax.org/details/books/principles-microeconomics-3e",
    description: "Principles of Microeconomics 3e (OpenStax)",
    category: "economics-psychology",
  },
  {
    title: "AP Psychology",
    url: "https://openstax.org/details/books/psychology-2e",
    description: "Psychology 2e (OpenStax)",
    category: "economics-psychology",
  },
]

function filterCoursesByVideoSearch(courses: Course[], rawQuery: string): Course[] {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return courses

  const matches = (s: string) => s.toLowerCase().includes(q)

  return courses
    .map((course) => {
      if (matches(course.name)) return course

      const newUnits = course.units
        .map((unit) => {
          if (matches(unit.name)) return unit
          const matchedTopics = unit.topics.filter((t) => matches(t.name))
          if (matchedTopics.length === 0) return null
          return { ...unit, topics: matchedTopics }
        })
        .filter((u): u is NonNullable<typeof u> => u !== null)

      if (newUnits.length === 0) return null
      return { ...course, units: newUnits }
    })
    .filter((c): c is Course => c !== null)
}

export default function ResourcesPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null)
  const [videoSearchTerm, setVideoSearchTerm] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [mergedCurriculum, setMergedCurriculum] = useState(curriculum)

  useEffect(() => {
    const unsub = subscribeCurriculumSettings((s) => {
      setMergedCurriculum(mergeCourses(curriculum, s))
    })
    return () => unsub()
  }, [])

  const filteredResources = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return OPENSTAX_RESOURCES
    return OPENSTAX_RESOURCES.filter(
      (resource) =>
        resource.title.toLowerCase().includes(q) || resource.description.toLowerCase().includes(q)
    )
  }, [searchTerm])

  const textbooksByCategory = useMemo(() => {
    const map = new Map<TextbookCategory, OpenStaxResource[]>()
    for (const r of filteredResources) {
      const list = map.get(r.category) ?? []
      list.push(r)
      map.set(r.category, list)
    }
    return TEXTBOOK_CATEGORY_ORDER.filter((c) => map.has(c) && (map.get(c)?.length ?? 0) > 0).map((category) => ({
      category,
      label: TEXTBOOK_CATEGORY_LABELS[category],
      items: map.get(category)!,
    }))
  }, [filteredResources])

  const categoryIds = [
    "ap-capstone",
    "ap-arts",
    "ap-english",
    "ap-history-social-sciences",
    "ap-math-computer-science",
    "ap-sciences",
    "ap-world-languages-cultures",
  ]

  const allCourses = [
    ...mergedCurriculum,
    ...apCourses.flatMap((course) => {
      if (categoryIds.includes(course.id)) {
        return course.units.map((unit) => ({
          id: unit.name.toLowerCase().replace(/\s+/g, "-"),
          name: unit.name,
          units: unit.topics.length > 0 ? [{ name: "Overview", topics: unit.topics }] : [],
        }))
      } else {
        return course
      }
    }),
  ]

  const filteredVideoCourses = useMemo(
    () => filterCoursesByVideoSearch(allCourses, videoSearchTerm),
    [allCourses, videoSearchTerm]
  )

  const topicCountByCourseId = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of allCourses) {
      m.set(c.id, c.units.reduce((acc, u) => acc + u.topics.length, 0))
    }
    return m
  }, [allCourses])

  const totalVideoTopics = allCourses.reduce(
    (acc, c) => acc + c.units.reduce((u, unit) => u + unit.topics.length, 0),
    0
  )

  return (
    <PageLayout>
      <header className="mb-10 border-b-4 border-black/10 pb-10">
        <h1 className="mb-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-[#2C2C2C] md:text-7xl lg:text-8xl">
          Resources
        </h1>
        <p className="max-w-2xl text-lg font-bold text-[#2C2C2C]/80 md:text-xl">
          Video lessons by course and unit, plus free open textbooks—organized so you can find what you need quickly.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-4 border-black/10 bg-white/90 px-5 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
            <dt className="text-xs font-black uppercase tracking-wide text-[#2C2C2C]/50">Courses</dt>
            <dd className="mt-1 text-3xl font-black tabular-nums text-[#2C2C2C]">{allCourses.length}</dd>
          </div>
          <div className="rounded-xl border-4 border-black/10 bg-white/90 px-5 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
            <dt className="text-xs font-black uppercase tracking-wide text-[#2C2C2C]/50">Video topics</dt>
            <dd className="mt-1 text-3xl font-black tabular-nums text-[#2C2C2C]">{totalVideoTopics}</dd>
          </div>
          <div className="rounded-xl border-4 border-black/10 bg-white/90 px-5 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
            <dt className="text-xs font-black uppercase tracking-wide text-[#2C2C2C]/50">Open textbooks</dt>
            <dd className="mt-1 text-3xl font-black tabular-nums text-[#2C2C2C]">{OPENSTAX_RESOURCES.length}</dd>
          </div>
        </dl>
      </header>

      <Tabs defaultValue="videos" className="w-full gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 gap-2 bg-transparent p-0">
            <TabsTrigger
              value="videos"
              className={cn(
                "gap-2 border-4 border-black/10 bg-white py-3 text-sm font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] transition-all",
                "data-[state=active]:-translate-y-0.5 data-[state=active]:border-black/20 data-[state=active]:bg-[#FFC971] data-[state=active]:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]",
                "data-[state=inactive]:text-[#2C2C2C]/70"
              )}
            >
              <Clapperboard className="h-4 w-4 shrink-0" aria-hidden />
              Video lessons
            </TabsTrigger>
            <TabsTrigger
              value="textbooks"
              className={cn(
                "gap-2 border-4 border-black/10 bg-white py-3 text-sm font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] transition-all",
                "data-[state=active]:-translate-y-0.5 data-[state=active]:border-black/20 data-[state=active]:bg-[#FFC971] data-[state=active]:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]",
                "data-[state=inactive]:text-[#2C2C2C]/70"
              )}
            >
              <Library className="h-4 w-4 shrink-0" aria-hidden />
              Textbooks
            </TabsTrigger>
          </TabsList>
          <p className="text-sm font-bold text-[#2C2C2C]/60 lg:max-w-md lg:text-right">
            Switch between guided videos and reference books. Your progress still syncs across the app.
          </p>
        </div>

        <TabsContent value="videos" className="mt-2 space-y-6 outline-none">
          <div className="rounded-2xl border-4 border-black/10 bg-white/60 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.06)] md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#2C2C2C] md:text-3xl">All courses</h2>
            <p className="mt-2 max-w-3xl text-base font-bold text-[#2C2C2C]/65">
              Expand a course, then a unit, to open lessons. Mark topics complete as you go.
            </p>
            <div className="mt-6">
              <label htmlFor="video-search" className="sr-only">
                Search video lessons
              </label>
              <div className="relative max-w-lg">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2C2C2C]/40"
                  aria-hidden
                />
                <Input
                  id="video-search"
                  type="search"
                  placeholder="Search by course, unit, or lesson title…"
                  className="border-4 border-black/10 py-6 pl-11 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]"
                  value={videoSearchTerm}
                  onChange={(e) => setVideoSearchTerm(e.target.value)}
                />
              </div>
              {videoSearchTerm.trim() ? (
                <p className="mt-3 text-sm font-bold text-[#2C2C2C]/55">
                  {filteredVideoCourses.length === 0
                    ? "No lessons match your search."
                    : `Showing ${filteredVideoCourses.length} of ${allCourses.length} courses with matching content.`}
                </p>
              ) : null}
            </div>
          </div>

          {filteredVideoCourses.length === 0 ? (
            <div className="rounded-xl border-4 border-dashed border-black/15 bg-white/40 px-6 py-14 text-center">
              <Clapperboard className="mx-auto mb-4 h-12 w-12 text-[#2C2C2C]/35" aria-hidden />
              <p className="text-lg font-black uppercase tracking-tight text-[#2C2C2C]/70">No video lessons found</p>
              <p className="mt-2 text-sm font-bold text-[#2C2C2C]/50">
                Try another keyword, or clear the search to see everything.
              </p>
            </div>
          ) : (
          <Accordion type="multiple" className="space-y-6">
            {filteredVideoCourses.map((course, index) => (
              <ScrollReveal key={course.id} delay={index * 0.1} className="w-full">
                <AccordionItem
                  value={course.id}
                  className="overflow-hidden rounded-xl border-4 border-black/10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  <AccordionTrigger className="group py-6 px-6 hover:no-underline data-[state=open]:bg-black/5">
                    <div className="flex w-full items-center gap-6 text-left">
                      <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-black/10 bg-[#006B6B] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105 sm:flex">
                        <Calculator className="h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-black uppercase tracking-tight text-[#2C2C2C] md:text-2xl lg:text-3xl">
                          {course.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-[#2C2C2C]/60 md:text-base">
                          {course.units.length} units ·{" "}
                          {course.units.reduce((acc, unit) => acc + unit.topics.length, 0)} video lessons
                        </p>
                      </div>
                      <div className="mr-2 shrink-0">
                        <CourseProgressBadge
                          courseId={course.id}
                          totalTopics={topicCountByCourseId.get(course.id) ?? 0}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="divide-y-4 divide-black/5">
                      {course.units.map((unit, unitIdx) => (
                        <Accordion type="single" collapsible key={unitIdx} className="w-full">
                          <AccordionItem value={`unit-${unitIdx}`} className="border-0">
                            <AccordionTrigger className="px-6 py-4 hover:bg-black/5 hover:no-underline">
                              <div className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black/10 bg-[#FFC971] text-sm font-black text-[#2C2C2C]">
                                  {unitIdx + 1}
                                </span>
                                <div className="text-left">
                                  <div className="text-lg font-bold text-[#2C2C2C]">{unit.name}</div>
                                  <div className="text-xs font-bold uppercase text-[#2C2C2C]/60">
                                    {unit.topics.length} topics
                                  </div>
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
                                      <div className="mb-2 text-base font-bold leading-tight text-[#2C2C2C]">
                                        {topic.name}
                                      </div>
                                      <div className="inline-flex items-center rounded-md border-2 border-black/5 bg-black/5 px-2 py-1 text-xs font-bold uppercase text-[#2C2C2C]/60">
                                        Video lesson
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                      <Button
                                        size="sm"
                                        className="flex-1 gap-2 rounded-lg border-2 border-black/10 bg-[#006B6B] font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:bg-[#005555]"
                                        onClick={() => setSelectedVideo({ id: topic.videoId, title: topic.name })}
                                      >
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
          )}
        </TabsContent>

        <TabsContent value="textbooks" className="mt-2 space-y-8 outline-none">
          <div className="rounded-2xl border-4 border-black/10 bg-white/60 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.06)] md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#2C2C2C] md:text-3xl">Open textbooks</h2>
            <p className="mt-2 max-w-3xl text-base font-bold text-[#2C2C2C]/65">
              Free references from OpenStax and partner publishers. Links open in a new tab.
            </p>
            <div className="mt-6">
              <label htmlFor="textbook-search" className="sr-only">
                Search textbooks
              </label>
              <Input
                id="textbook-search"
                type="search"
                placeholder="Search by title or publisher…"
                className="w-full max-w-lg border-4 border-black/10 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {textbooksByCategory.length === 0 ? (
            <div className="rounded-xl border-4 border-dashed border-black/15 bg-white/40 px-6 py-14 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#2C2C2C]/35" aria-hidden />
              <p className="text-lg font-black uppercase tracking-tight text-[#2C2C2C]/70">No matches</p>
              <p className="mt-2 text-sm font-bold text-[#2C2C2C]/50">Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {textbooksByCategory.map(({ category, label, items }) => (
                <section key={category} aria-labelledby={`cat-${category}`} className="space-y-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-black/10 pb-3">
                    <h3 id={`cat-${category}`} className="text-xl font-black uppercase tracking-tight text-[#2C2C2C] md:text-2xl">
                      {label}
                    </h3>
                    <span className="text-xs font-black uppercase tracking-widest text-[#2C2C2C]/50">
                      {items.length} {items.length === 1 ? "book" : "books"}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((resource) => (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={`${category}-${resource.title}`}
                        className="group block rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]"
                      >
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-black/10 bg-[#FFC971] text-[#2C2C2C] transition-transform group-hover:scale-105">
                            <BookOpen className="h-6 w-6" aria-hidden />
                          </div>
                          <h4 className="text-lg font-bold leading-snug text-[#2C2C2C]">{resource.title}</h4>
                        </div>
                        <p className="text-sm font-medium text-[#2C2C2C]/60">{resource.description}</p>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
