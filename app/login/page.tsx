"use client"

import { auth, googleProvider, db } from "@/lib/firebase"
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/page-layout"
import { FieldDescription } from "@/components/ui/field"
import Link from "next/link"

function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Check if user exists in Firestore, if not create as student by default
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "student", // Default for Google login if not existing
          createdAt: new Date().toISOString()
        })
      }
      
      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md mx-auto", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-[#FFB627] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
        <CardContent className="grid p-0">
          <form onSubmit={handleEmailSignIn} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-black text-black tracking-tight uppercase">Welcome back</h1>
              <p className="text-[#006B6B] font-bold">
                Login to your account
              </p>
            </div>
            
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-black font-bold">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-black font-bold">Password</FieldLabel>
                  <Link
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-[#006B6B] font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              
              <Field>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#006B6B] hover:bg-[#005050] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all h-12 text-lg"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>
              

              
              <Field className="flex gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all h-12 text-black font-bold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </Field>
              <FieldDescription className="text-center text-black font-medium mt-4">
                Don&apos;t have an account? <Link href="/signup" className="text-[#006B6B] hover:underline font-bold">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-black/70">
        By clicking continue, you agree to our <Link href="#" className="hover:underline text-black">Terms of Service</Link>{" "}
        and <Link href="#" className="hover:underline text-black">Privacy Policy</Link>.
      </FieldDescription>
      {error && <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive border-2 border-destructive">{error}</div>}
    </div>
  )
}

export default function LoginPage() {
  return (
    <PageLayout className="flex items-center justify-center min-h-[60vh]">
      <LoginForm />
    </PageLayout>
  )
}