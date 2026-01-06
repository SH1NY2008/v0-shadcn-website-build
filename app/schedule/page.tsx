import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Video, Users, BookOpen, Plus } from "lucide-react"

function generateGoogleCalendarLink(
  title: string,
  description: string,
  startDate: string,
  startTime: string,
  endTime: string,
): string {
  const [year, month, day] = startDate.split("-")
  const [startHour, startMinute] = startTime.split(":")
  const [endHour, endMinute] = endTime.split(":")

  // Format: YYYYMMDDTHHmmSS
  const start = `${year}${month}${day}T${startHour}${startMinute}00`
  const end = `${year}${month}${day}T${endHour}${endMinute}00`

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    dates: `${start}/${end}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">Math Study Schedule</h1>
            <p className="text-lg text-muted-foreground">Plan your math learning sessions</p>
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
                    <CardDescription>3 study sessions scheduled</CardDescription>
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
                        <h4 className="font-semibold">Calculus 1: Derivatives</h4>
                        <p className="text-sm text-muted-foreground">Limit definition and power rule</p>
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
                        18 students
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Join Session</Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Calculus 1: Derivatives",
                            "Limit definition and power rule",
                            "2026-01-06",
                            "14:00",
                            "15:30",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
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
                        <h4 className="font-semibold">Algebra 2: Quadratic Functions</h4>
                        <p className="text-sm text-muted-foreground">Practice problems and graphing</p>
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
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Algebra 2: Quadratic Functions",
                            "Practice problems and graphing",
                            "2026-01-06",
                            "16:00",
                            "17:00",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Geometry: Triangle Proofs</h4>
                        <p className="text-sm text-muted-foreground">Congruence theorems review</p>
                      </div>
                      <Badge variant="outline">Study</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        7:00 PM - 8:00 PM
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Start Learning</Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Geometry: Triangle Proofs",
                            "Congruence theorems review",
                            "2026-01-06",
                            "19:00",
                            "20:00",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
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
                <CardDescription>2 study sessions scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Pre-Calculus Study Group</h4>
                        <p className="text-sm text-muted-foreground">Trigonometric identities workshop</p>
                      </div>
                      <Badge variant="secondary">Group</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        10:00 AM - 12:00 PM
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />8 students
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Pre-Calculus Study Group",
                            "Trigonometric identities workshop",
                            "2026-01-07",
                            "10:00",
                            "12:00",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Video className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Algebra 1: Linear Functions</h4>
                        <p className="text-sm text-muted-foreground">Slope and graphing review</p>
                      </div>
                      <Badge>Live</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        3:00 PM - 4:30 PM
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        22 students
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Algebra 1: Linear Functions",
                            "Slope and graphing review",
                            "2026-01-07",
                            "15:00",
                            "16:30",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
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
                <CardDescription>1 assessment scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Calculus 1: Unit 2 Quiz</h4>
                        <p className="text-sm text-muted-foreground">Derivatives and applications</p>
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
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={generateGoogleCalendarLink(
                            "Calculus 1: Unit 2 Quiz",
                            "Derivatives and applications",
                            "2026-01-10",
                            "15:00",
                            "16:00",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Add to Calendar
                        </a>
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
