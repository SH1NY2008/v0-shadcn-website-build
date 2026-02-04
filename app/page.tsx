"use client"

import { cn } from "@/lib/utils"
import { LandingNav } from "@/components/landing-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { ArrowRight, BookOpen, CheckCircle2, Layers, Layout, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { curriculum } from "@/lib/curriculum"
import { Progress } from "@/components/ui/progress"
import { DivideSign, MultiplySign } from "../components/ui/math-symbols"
import { motion } from "framer-motion"
import { NumeriaLoader } from "@/components/ui/numeria-loader"

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [coursePercents, setCoursePercents] = useState<Record<string, number>>({})
  const [showLoader, setShowLoader] = useState(true)
  const [heroStarted, setHeroStarted] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) {
      setCoursePercents({})
      return
    }
    const unsubs: Array<() => void> = []
    for (const course of curriculum) {
      const total = course.units.reduce((acc, u) => acc + u.topics.length, 0)
      const ref = collection(db, "users", user.uid, "courses", course.id, "topics")
      const unsub = onSnapshot(ref, (snap) => {
        const completed = snap.size
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
        setCoursePercents((prev) => ({ ...prev, [course.id]: percent }))
      })
      unsubs.push(unsub)
    }
    return () => {
      for (const u of unsubs) u()
    }
  }, [user])

  return (
    // Base layer: Full viewport background color
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans selection:bg-primary/20 overflow-x-hidden">
      
      {showLoader && (
        <NumeriaLoader 
          onFadeOutStart={() => setHeroStarted(true)} 
          onComplete={() => setShowLoader(false)} 
        />
      )}

      {/* Hero Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ 
            opacity: heroStarted ? 1 : 0,
            scale: heroStarted ? 1 : 0.96 
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative mx-auto min-h-[90vh] w-full max-w-[1600px] rounded-2xl md:rounded-[2rem] bg-card text-card-foreground shadow-2xl overflow-hidden border-4 border-black/10 mb-8"
      >
        
        {/* Navigation inside the card */}
        <div className="absolute top-0 left-0 right-0 z-50">
           <LandingNav heroStarted={heroStarted} />
        </div>

        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-6 py-24 md:py-32">
          
          {/* Decorative Math Symbols Removed */}
          
          <div className="text-center max-w-5xl mx-auto z-10 space-y-6 md:space-y-8">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={heroStarted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
              className="text-lg md:text-2xl font-bold tracking-wide text-primary uppercase mb-2 md:mb-4"
            >
              Math without the headaches
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={heroStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-card-foreground"
            >
              START LEARNING <br/>
              <span className="relative inline-block px-4">
                <span className="absolute inset-0 bg-primary -rotate-2 rounded-lg transform scale-105" />
                <span className="relative text-primary-foreground">WITH CONFIDENCE</span>
              </span>
            </motion.h1>
    

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={heroStarted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: 2.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            >
              <Link href="/signup">
                <Button size="lg" className="w-52 h-16 px-10 text-xl font-bold rounded-full bg-primary text-primary-foreground hover:bg-black hover:text-white hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="w-52 h-16 px-10 text-xl font-bold rounded-full hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                  Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.div>

      {/* Content Below Hero */}
      <div className="relative mx-auto w-full max-w-[1600px] rounded-[2rem] bg-card text-card-foreground shadow-2xl overflow-hidden">
        {/* Value Proposition */}
        <section className="w-full px-6 py-24 md:py-32 bg-black/5">
          <div className="max-w-[1200px] mx-auto">
            <ScrollReveal>
              <h2 className="text-4xl md:text-6xl font-black mb-16 text-center tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                WHY NUMERIA?
              </h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Layout,
                  title: "Structured Learning",
                  desc: "A carefully curated curriculum that guides you from Algebra to Calculus with clarity."
                },
                {
                  icon: Zap,
                  title: "Instant Feedback",
                  desc: "Practice problems with real-time feedback to help you understand concepts immediately."
                },
                {
                  icon: Layers,
                  title: "Track Progress",
                  desc: "Visual progress tracking to keep you motivated and aware of your improvements."
                }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.1} yOffset={40} scaleOffset={0.04} className="group">
                  <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2rem] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full">
                    <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground border-2 border-black mb-2">
                      <item.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-bold">{item.title}</h3>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Items (Courses) */}
        <section className="w-full px-6 py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <ScrollReveal>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    EXPLORE <span className="inline-block bg-primary text-white px-4 py-1 -rotate-2 rounded-lg transform">COURSES</span>
                  </h2>
                </ScrollReveal>
                <ScrollReveal delay={0.15} duration={0.8}>
                  <p className="text-xl text-foreground/80 font-medium max-w-md">
                    Start your journey with one of our core mathematics courses.
                  </p>
                </ScrollReveal>
              </div>
              <ScrollReveal delay={0.2}>
                <Button variant="ghost" className="text-xl font-bold hover:bg-transparent hover:text-primary transition-colors group" asChild>
                  <Link href="/resources">
                    View All Courses <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </Link>
                </Button>
              </ScrollReveal>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {curriculum.slice(0, 4).map((course, i) => (
                <ScrollReveal key={course.id} delay={i * 0.1} yOffset={40} scaleOffset={0.04}>
                  <Link href={`/resources?course=${course.id}`} className="block group h-full">
                    <Card className="h-full rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 bg-white overflow-hidden">
                      <CardHeader className="bg-muted/30 border-b-4 border-black p-8">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className="bg-primary text-primary-foreground border-2 border-black text-sm px-3 py-1 rounded-full hover:bg-primary">
                            {course.id.includes('calculus') ? 'Advanced' : 'Core'}
                          </Badge>
                          {coursePercents[course.id] !== undefined && coursePercents[course.id] > 0 && (
                            <Badge className="bg-green-500 text-white border-2 border-black text-sm px-3 py-1 rounded-full">
                              {coursePercents[course.id]}% Complete
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-3xl font-black group-hover:text-primary transition-colors">
                          {course.name}
                        </CardTitle>
                        <CardDescription className="text-lg font-medium text-black/60 line-clamp-2 mt-2">
                          Master the fundamentals and advanced concepts of {course.name}.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="flex items-center text-base font-bold text-muted-foreground mb-6">
                          <BookOpen className="mr-2 h-5 w-5" />
                          {course.units.length} Units
                          <span className="mx-2 text-black/30">•</span>
                          {course.units.reduce((acc, u) => acc + u.topics.length, 0)} Topics
                        </div>
                        {coursePercents[course.id] !== undefined && (
                          <div className="w-full bg-black/5 rounded-full h-4 border-2 border-black overflow-hidden">
                             <div 
                               className="bg-primary h-full transition-all duration-500" 
                               style={{ width: `${coursePercents[course.id]}%` }}
                             />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 border-t-4 border-black bg-muted/20">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-base font-medium text-black">
            <p>© 2026 Numeria.inc. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
