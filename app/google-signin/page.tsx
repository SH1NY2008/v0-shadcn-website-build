"use client"

import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function GoogleSignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
        <div className="absolute top-1/3 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
      </div>
      <NavHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center animate-in fade-in-0 duration-500">
          <h1 className="text-5xl font-bold tracking-tight">Sign in to continue</h1>
          <p className="mt-3 text-muted-foreground">Access your personalized dashboard and track progress across courses</p>
        </div>
        <div className="mx-auto mt-10 max-w-md animate-in zoom-in-50 duration-500">
          <Card className="bg-card shadow-lg transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-2xl">Google Sign-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</div>}
              <Button
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="secondary"
              >
                {loading ? "Signing in..." : "Continue with Google"}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                By continuing, you agree to basic usage of your profile for personalization
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
