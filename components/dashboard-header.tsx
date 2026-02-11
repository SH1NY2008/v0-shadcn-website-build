"use client"

import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, Calendar, BookOpen, GraduationCap, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useState } from "react"
import { useTeacherMode } from "@/context/teacher-mode-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { isTeacherMode, setIsTeacherMode } = useTeacherMode()

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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b-4 border-black/10 bg-[#FFB627] px-6 lg:px-12">
      <div className="flex items-center gap-8">
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-8 w-8 text-[#2C2C2C]" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r-4 border-black/10 bg-[#FFC971] p-0">
              <SheetHeader className="border-b-4 border-black/10 p-6">
                <SheetTitle className="text-left text-2xl font-black uppercase tracking-tighter text-[#2C2C2C]">
                  Numeria
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col justify-between h-[calc(100%-80px)]">
                <nav className="flex-1 space-y-2 p-6">
                  <div className="flex items-center justify-between bg-black/5 px-4 py-4 rounded-xl border-2 border-black/10 mb-6">
                    <Label htmlFor="teacher-mode-mobile" className="font-bold text-lg text-[#2C2C2C] cursor-pointer">
                      Teacher Mode
                    </Label>
                    <Switch
                      id="teacher-mode-mobile"
                      checked={isTeacherMode}
                      onCheckedChange={setIsTeacherMode}
                    />
                  </div>
                  {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-bold transition-all",
                          isActive
                            ? "bg-[#006B6B] text-white shadow-md"
                            : "text-[#2C2C2C]/70 hover:bg-[#2C2C2C]/5 hover:text-[#2C2C2C]"
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="border-t-4 border-black/10 p-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 rounded-xl px-4 py-4 text-lg font-bold text-[#2C2C2C]/70 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                    onClick={() => {
                      setOpen(false)
                      handleSignOut()
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="flex items-center space-x-2 bg-black/5 px-4 py-2 rounded-full border-2 border-black/10">
            <Switch
              id="teacher-mode"
              checked={isTeacherMode}
              onCheckedChange={setIsTeacherMode}
            />
            <Label htmlFor="teacher-mode" className="font-bold text-[#2C2C2C] cursor-pointer">
              Teacher Mode
            </Label>
          </div>
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xl font-bold transition-colors",
                  isActive
                    ? "text-[#2C2C2C]" 
                    : "text-[#2C2C2C]/70 hover:text-[#2C2C2C]"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/" className="text-4xl font-black tracking-tighter text-[#2C2C2C] uppercase">
          NUMERIA
        </Link>
        <div className="hidden lg:block">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#2C2C2C] font-bold hover:bg-black/5"
                onClick={handleSignOut}
            >
                Sign Out
            </Button>
        </div>
      </div>
    </header>
  )
}
