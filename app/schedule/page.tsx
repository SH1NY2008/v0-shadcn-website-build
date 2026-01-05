import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Video, Users, BookOpen, Plus } from "lucide-react"

export default function SchedulePage() {
  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="container px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Schedule</h1>
            <p className="text-lg text-muted-foreground">Manage your learning sessions</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>

        <Tabs defaultValue="week" className="space-y-6">
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4">
            {/* Monday */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Monday, January 6</CardTitle>
                    <CardDescription>3 sessions scheduled</CardDescription>
                  </div>
                  <Badge variant="secondary">Today</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">React Hooks Deep Dive</h4>
                        <p className="text-sm text-muted-foreground">Advanced React Patterns</p>
                      </div>
                      <Badge>Live</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        2:00 PM - 3:30 PM
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        24 participants
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Join Session</Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Self-Study: TypeScript Generics</h4>
                        <p className="text-sm text-muted-foreground">TypeScript Fundamentals</p>
                      </div>
                      <Badge variant="outline">Self-paced</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        4:00 PM - 5:00 PM
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Start Learning</Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tuesday */}
            <Card>
              <CardHeader>
                <CardTitle>Tuesday, January 7</CardTitle>
                <CardDescription>2 sessions scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">TypeScript Workshop</h4>
                        <p className="text-sm text-muted-foreground">Interactive coding session</p>
                      </div>
                      <Badge variant="secondary">Workshop</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        10:00 AM - 12:00 PM
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        15 participants
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Friday */}
            <Card>
              <CardHeader>
                <CardTitle>Friday, January 10</CardTitle>
                <CardDescription>1 session scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">CSS Grid Assessment Quiz</h4>
                        <p className="text-sm text-muted-foreground">Web Accessibility Course</p>
                      </div>
                      <Badge variant="outline">Quiz</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        3:00 PM - 4:00 PM
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardContent className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Calendar view coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardContent className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Upcoming sessions view</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
