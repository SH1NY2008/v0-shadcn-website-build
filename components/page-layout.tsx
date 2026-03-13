"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PageLayout({ children, className, style }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFB627]" style={style}>
      <div className="flex min-h-screen flex-col transition-all duration-300 ease-in-out">
        <DashboardHeader />
        <main className={cn("flex-1 px-4 py-8 md:px-8 md:py-12 lg:px-12", className)}>
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
