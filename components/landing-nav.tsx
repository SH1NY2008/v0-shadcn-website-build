"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import { useTeacherMode } from "@/context/teacher-mode-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { motion } from "framer-motion"

interface LandingNavProps {
  heroStarted?: boolean
}

export function LandingNav({ heroStarted = true }: LandingNavProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const { isTeacherMode, userRole } = useTeacherMode()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const links =
    isTeacherMode && userRole === "teacher"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Office Hours" },
          { href: "/resources", label: "Resources" },
          { href: "/quizzes#quiz-categories", label: "Quiz library" },
          { href: "/community", label: "Community" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Schedule" },
          { href: "/resources", label: "Resources" },
          { href: "/quizzes", label: "Quizzes" },
          { href: "/community", label: "Community" },
        ]

  /** Logged-in users should see links immediately; hero loader can leave `heroStarted` false for several seconds. */
  const navVisible = heroStarted || !!user

  return (
    <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between relative z-50">
      {/* Left Group */}
      <motion.div 
        className="flex-1 flex items-center justify-start gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: navVisible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] border-r-4 border-foreground bg-background">
            <SheetHeader>
              <SheetTitle className="text-left flex items-center gap-2">
                <span className="text-xl font-black tracking-tighter text-foreground">Numeria</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 mt-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
                  onClick={() => document.body.click()}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden md:block text-lg font-bold hover:text-primary transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}

      </motion.div>

      {/* Right Group */}
      <motion.div 
        className="flex items-center justify-end gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: navVisible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="flex items-center gap-2 group order-first md:order-none">
          {heroStarted && (
            <motion.span 
              className="text-4xl font-black tracking-tighter"
              layoutId="numeria-logo-text"
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              NUMERIA
            </motion.span>
          )}
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border-2 border-black bg-white px-2 py-1 hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-black/20">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName ?? "Profile"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold">
                      {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-sm pr-2">{user.displayName ?? "Account"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] rounded-xl border-2 border-black bg-popover p-1 text-popover-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[60]">
              <DropdownMenuItem
                className="cursor-pointer font-bold"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer font-bold"
                onClick={() => router.push("/resources")}
              >
                Resources
              </DropdownMenuItem>
              {userRole === "teacher" && (
                <DropdownMenuItem
                  className="cursor-pointer font-bold"
                  onClick={() => router.push("/teacher/progress")}
                >
                  Student Progress
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-black/10" />
              <DropdownMenuItem
                className="cursor-pointer font-bold text-destructive focus:text-destructive"
                onClick={async () => {
                  await signOut(auth)
                  router.push("/")
                }}
              >
                <div className="flex items-center gap-2">
                   <span>Sign Out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </motion.div>
    </nav>
  )
}
