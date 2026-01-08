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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Calculator className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Numeria<span className="text-primary">.inc</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={cn("gap-2", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            )
          })}
          <div className="ml-2 flex items-center gap-2">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                    <div className="h-8 w-8 overflow-hidden rounded-full border">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName ?? "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs">
                          {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm">{user.displayName ?? "Account"}</span>
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
                <Button
                  variant={pathname === "/google-signin" ? "secondary" : "outline"}
                  size="sm"
                  asChild
                  className={cn("gap-2", pathname === "/google-signin" && "bg-primary/10 text-primary hover:bg-primary/20")}
                >
                  <Link href="/google-signin">
                    <span className="hidden sm:inline">Google Sign-In</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
