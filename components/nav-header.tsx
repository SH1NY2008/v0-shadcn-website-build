"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calculator, Calendar, LayoutDashboard, Library } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

export function NavHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/resources", label: "Resources", icon: Library },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 py-3 flex justify-center">
        <div className="flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2 shadow-lg backdrop-blur">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">Numeria</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors",
                    isActive && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-white/5">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName ?? "Profile"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs">
                          {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline">{user.displayName ?? "Account"}</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <DropdownMenu.Item
                    className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => router.push("/resources")}
                  >
                    Resources
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground"
                    onClick={async () => {
                      await signOut(auth)
                      router.push("/")
                    }}
                  >
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <>
                <Link href="/google-signin" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
                  Log in
                </Link>
                <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90">
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
