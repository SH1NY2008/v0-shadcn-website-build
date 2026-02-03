"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, BookOpen, GraduationCap, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/quizzes", label: "Quizzes", icon: GraduationCap },
  ]

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] lg:w-[320px] -translate-x-full border-r-4 border-black/10 bg-[#FFC971] transition-transform lg:translate-x-0 hidden lg:flex flex-col">
      <div className="flex h-20 items-center border-b-4 border-black/10 px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-[#2C2C2C] uppercase">Numeria</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-6">
        <nav className="space-y-4">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-bold transition-all duration-200",
                  isActive
                    ? "bg-[#006B6B] text-white shadow-md translate-x-2"
                    : "text-[#2C2C2C]/70 hover:bg-[#2C2C2C]/5 hover:text-[#2C2C2C]"
                )}
              >
                <link.icon className={cn("h-6 w-6", isActive ? "text-white" : "text-[#2C2C2C]/70")} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t-4 border-black/10 p-6">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 rounded-xl px-4 py-6 text-lg font-bold text-[#2C2C2C]/70 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          onClick={handleSignOut}
        >
          <LogOut className="h-6 w-6" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
