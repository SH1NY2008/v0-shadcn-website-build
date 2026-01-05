import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, Award, BookOpen, Target } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Welcome back, Alex</h1>
          <p className="text-lg text-muted-foreground">Track your progress in high school mathematics</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12.5</div>
              <p className="text-xs text-muted-foreground">+2.5 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-xs text-muted-foreground">Algebra 2, Pre-Calc, Calc 1</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">67%</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground">2 new this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Algebra 2 w/ Trig</h4>
                    <p className="text-sm text-muted-foreground">Chapter 8: Trigonometric Functions</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">65%</Badge>
                </div>
                <Progress value={65} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Pre-Calculus</h4>
                    <p className="text-sm text-muted-foreground">Chapter 3: Polynomial Functions</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">42%</Badge>
                </div>
                <Progress value={42} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Calculus 1</h4>
                    <p className="text-sm text-muted-foreground">Chapter 1: Limits and Continuity</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">18%</Badge>
                </div>
                <Progress value={18} className="h-2" />
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                View All Courses
              </Button>
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals</CardTitle>
              <CardDescription>Your learning targets for this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Complete 5 Lessons</h4>
                    <span className="text-sm font-medium text-primary">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Practice 20 Problems</h4>
                    <span className="text-sm font-medium text-primary">14/20</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Study 10 Hours</h4>
                    <span className="text-sm font-medium text-primary">7.5/10</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">View All Goals</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
