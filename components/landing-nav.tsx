"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LandingNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  return (
    <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between relative z-50">
      {/* Left Group */}
      <div className="flex-1 flex items-center justify-start gap-6">
        <Link 
          href="/dashboard" 
          className="hidden md:block text-lg font-bold hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          href="/schedule" 
          className="hidden md:block text-lg font-bold hover:text-primary transition-colors"
        >
          Schedule
        </Link>
        <Link 
          href="/resources" 
          className="hidden md:block text-lg font-bold hover:text-primary transition-colors"
        >
          Resources
        </Link>
      </div>

      {/* Center Logo */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <Calculator className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Numeria</span>
        </Link>
      </div>

      {/* Right Group */}
      <div className="flex-1 flex items-center justify-end gap-4">
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
              <DropdownMenuSeparator className="bg-black/10" />
              <DropdownMenuItem
                className="cursor-pointer font-bold text-destructive focus:text-destructive"
                onClick={async () => {
                  await signOut(auth)
                  router.push("/")
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link 
              href="/google-signin" 
              className="hidden sm:inline-block text-lg font-bold hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Button asChild size="lg" className="rounded-full font-bold bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Link href="/google-signin">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
