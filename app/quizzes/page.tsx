'use client'

import questionsData from '../data/questions.json'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calculator, BookOpen, Sigma, FunctionSquare, Pi, Triangle, Binary, Activity, Volume2, VolumeX, Smartphone, Settings2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useQuizSettings } from "@/hooks/use-quiz-settings"

// Group by category
const categories = questionsData.reduce((acc: any, q: any) => {
  if (!acc[q.category]) {
    acc[q.category] = []
  }
  acc[q.category].push(q)
  return acc
}, {})

// Map categories to icons (fallback to Calculator)
const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes('algebra')) return <FunctionSquare className="h-6 w-6" />
  if (lower.includes('geometry')) return <Triangle className="h-6 w-6" />
  if (lower.includes('precalculus')) return <Activity className="h-6 w-6" />
  if (lower.includes('calculus')) return <Sigma className="h-6 w-6" />
  if (lower.includes('limit')) return <Pi className="h-6 w-6" />
  
  return <BookOpen className="h-6 w-6" />
}

export default function QuizzesPage() {
  const { settings, toggleSound, toggleHaptics, loaded } = useQuizSettings()

  return (
    <PageLayout>
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
              Quizzes
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
              Master mathematics concepts from Algebra to Calculus.
            </p>
          </div>
          
          {/* Accessibility Settings Card */}
          {loaded && (
            <Card className="border-4 border-black/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] bg-white w-full md:w-auto">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#2C2C2C] font-black uppercase tracking-tight border-b-2 border-black/5 pb-2 mb-1">
                  <Settings2 className="h-5 w-5" />
                  <span>Accessibility</span>
                </div>
                
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-[#006B6B]" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <Label htmlFor="sound-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Sound Effects</Label>
                  </div>
                  <Switch 
                    id="sound-toggle" 
                    checked={settings.soundEnabled} 
                    onCheckedChange={toggleSound}
                    className="data-[state=checked]:bg-[#006B6B]"
                  />
                </div>

                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-3">
                    <Smartphone className={`h-5 w-5 ${settings.hapticsEnabled ? "text-[#006B6B]" : "text-gray-400"}`} />
                    <Label htmlFor="haptics-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Haptic Feedback</Label>
                  </div>
                  <Switch 
                    id="haptics-toggle" 
                    checked={settings.hapticsEnabled} 
                    onCheckedChange={toggleHaptics}
                    className="data-[state=checked]:bg-[#006B6B]"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(categories).map((category, index) => (
          <div 
            key={category} 
            className="group flex flex-col justify-between rounded-xl border-4 border-black/10 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
          >
            <div>
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-black/10 bg-[#FFC971] text-[#2C2C2C] transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {getCategoryIcon(category)}
                </div>
                <Badge className="bg-[#006B6B] text-white hover:bg-[#005555] border-none text-xs px-2 py-1 rounded-lg font-bold">
                  {categories[category].length} Qs
                </Badge>
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase leading-[0.9] text-[#2C2C2C]">
                {category}
              </h3>
              <p className="text-sm font-bold text-[#2C2C2C]/60 leading-tight">
                Practice problems focusing on {category.toLowerCase()} concepts and applications.
              </p>
            </div>
            <div className="mt-8">
              <Link href={`/quizzes/${encodeURIComponent(category)}`} className="w-full block">
                <Button className="w-full gap-2 border-4 border-black/10 bg-[#006B6B] hover:bg-[#005555] text-white font-bold text-lg h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all">
                  Start Quiz
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
