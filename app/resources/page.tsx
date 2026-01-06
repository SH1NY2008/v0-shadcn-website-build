"use client"

import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, FileText, Download, Play, Calculator } from "lucide-react"
import { getKhanAcademyVideos } from "@/lib/youtube"
import Link from "next/link"

export default async function ResourcesPage() {
  const algebra1Videos = await getKhanAcademyVideos("Algebra 1")
  const geometryVideos = await getKhanAcademyVideos("Geometry")
  const algebra2Videos = await getKhanAcademyVideos("Algebra 2")
  const preCalculusVideos = await getKhanAcademyVideos("Pre-Calculus")
  const calculus1Videos = await getKhanAcademyVideos("Calculus 1")
  const calculus2Videos = await getKhanAcademyVideos("Calculus 2")

  const courses = [
    { name: "Algebra 1", videos: algebra1Videos, icon: Calculator, color: "bg-chart-1" },
    { name: "Geometry", videos: geometryVideos, icon: Calculator, color: "bg-chart-2" },
    { name: "Algebra 2 w/ Trig", videos: algebra2Videos, icon: Calculator, color: "bg-chart-3" },
    { name: "Pre-Calculus", videos: preCalculusVideos, icon: Calculator, color: "bg-chart-4" },
    { name: "Calculus 1", videos: calculus1Videos, icon: Calculator, color: "bg-chart-5" },
    { name: "Calculus 2", videos: calculus2Videos, icon: Calculator, color: "bg-chart-1" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Learning Resources</h1>
          <p className="text-lg text-muted-foreground">Khan Academy video lessons for high school mathematics</p>
        </div>

        <div className="mb-8">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for topics, concepts, or formulas..." className="pl-9" />
          </div>
        </div>

        <div className="space-y-12">
          {courses.map((course, idx) => (
            <section key={idx}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${course.color} text-white`}>
                    <course.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{course.name}</h2>
                    <p className="text-sm text-muted-foreground">Video lessons from Khan Academy</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Practice Worksheets
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Formula Sheets
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {course.videos.map((video, videoIdx) => (
                  <Card key={videoIdx} className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all hover:bg-black/30">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
                          <Play className="ml-1 h-6 w-6 fill-primary-foreground text-primary-foreground" />
                        </div>
                      </div>
                      <Badge className="absolute right-2 top-2 bg-black/70 text-white">{video.duration}</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-primary hover:bg-primary/90" size="sm" asChild>
                        <Link href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank">
                          Watch on YouTube
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">Practice & Study Materials</h2>
            <p className="text-lg text-muted-foreground">Downloadable resources to supplement your learning</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Formula Sheets</CardTitle>
                <CardDescription>Quick reference guides for all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-transparent" variant="outline">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Practice Worksheets</CardTitle>
                <CardDescription>Hundreds of problems with solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-transparent" variant="outline">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Calculator className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Study Guides</CardTitle>
                <CardDescription>Comprehensive topic summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-transparent" variant="outline">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
