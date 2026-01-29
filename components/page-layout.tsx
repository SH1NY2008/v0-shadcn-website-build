import { LandingNav } from "@/components/landing-nav"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Floating Card Container */}
      <div className="relative mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1600px] rounded-[2rem] bg-card text-card-foreground shadow-2xl overflow-hidden border-4 border-black/10 flex flex-col">
        
        {/* Navigation inside the card */}
        <div className="absolute top-0 left-0 right-0 z-50">
           <LandingNav />
        </div>

        {/* Content */}
        <div className={cn("w-full flex-1 pt-24 px-6 md:px-12 pb-12", className)}>
          {children}
        </div>
      </div>
    </div>
  )
}
