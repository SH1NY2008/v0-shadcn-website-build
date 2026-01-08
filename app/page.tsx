import { cn } from "@/lib/utils"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { EncryptedText } from "@/components/ui/encrypted-text"
import { Calculator, TrendingUp, Award, BookOpen, Brain, Target, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const courses = [
    { name: "Algebra 1", level: "Foundational", progress: 0, color: "bg-chart-1" },
    { name: "Geometry", level: "Foundational", progress: 0, color: "bg-chart-2" },
    { name: "Algebra 2 w/ Trig", level: "Intermediate", progress: 0, color: "bg-chart-3" },
    { name: "Pre-Calculus", level: "Advanced", progress: 0, color: "bg-chart-4" },
    { name: "Calculus 1", level: "Advanced", progress: 0, color: "bg-chart-5" },
    { name: "Calculus 2", level: "Advanced", progress: 0, color: "bg-chart-1" },
  ]

  return (
    <div className="min-h-screen">
      <NavHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" variant="outline">
            High School Math Mastery Platform
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl">
            <EncryptedText
              text="Master Math with Numeria.inc"
              className="inline-block"
              encryptedClassName="text-muted-foreground"
              revealedClassName="text-foreground"
              revealDelayMs={40}
            />
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty md:text-xl">
            From Algebra to Calculus, experience interactive learning designed for high school students. Build
            confidence, track progress, and excel in mathematics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
              Start Learning Free
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              View Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Complete Courses</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Interactive Lessons</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Practice Problems</div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress/Courses Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Your Math Journey</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Progress through comprehensive courses designed for high school success
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.level}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={cn("", course.color, "text-white")}>
                      {course.progress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={course.progress} className="h-2" />
                  <Button variant="ghost" size="sm" className="mt-3 w-full gap-2" asChild>
                    <Link href="/resources">
                      View Course
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Comprehensive tools and resources for mastering high school mathematics
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interactive Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Engage with dynamic video lessons, step-by-step examples, and visual explanations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Practice Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Test your knowledge with adaptive quizzes that adjust to your skill level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor your growth with detailed analytics and personalized insights
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Plan your learning sessions around your schedule with smart reminders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn certificates as you complete courses and demonstrate mastery
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Downloadable Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access study guides, formula sheets, and practice worksheets anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Numeria.inc. Empowering students to master mathematics.</p>
        </div>
      </footer>
    </div>
  )
}
