"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { WifiOff } from "lucide-react"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { DashboardHeader } from "@/components/dashboard-header"

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PageLayout({ children, className, style }: PageLayoutProps) {
  const isOnline = useOnlineStatus()

  return (
    <div className="min-h-screen bg-[#FFB627]" style={style}>
      <div className="flex min-h-screen flex-col transition-all duration-300 ease-in-out">
        <DashboardHeader />
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-red-500 p-2 text-white">
            <WifiOff className="h-4 w-4" />
            <p className="text-sm font-medium">
              You are currently offline. Some features may be unavailable.
            </p>
          </div>
        )}
        <main role="main" className={cn("flex-1 px-4 py-8 md:px-8 md:py-12 lg:px-12", className)}>
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
