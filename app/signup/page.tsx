"use client"

import { auth, googleProvider, db } from "@/lib/firebase"
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { syncPublicProfileFromAuthUser, writeNewUserDocuments } from "@/lib/user-profile"
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
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isTeacher, setIsTeacher] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      const role = isTeacher ? "teacher" : "student"
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role,
          discoverable: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      )
      await syncPublicProfileFromAuthUser(user, { role })

      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError("Please enter both email and password.")
      return
    }
    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      const displayName = email.split("@")[0] || "Student"
      await writeNewUserDocuments({
        uid: user.uid,
        email: user.email,
        displayName,
        role: isTeacher ? "teacher" : "student",
      })

      router.push("/dashboard")
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md mx-auto", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-[#FFB627] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
        <CardContent className="grid p-0">
          <form onSubmit={handleEmailSignUp} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-black text-black tracking-tight uppercase">Get Started</h1>
              <p className="text-[#006B6B] font-bold">
                Create your account
              </p>
            </div>
            
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email" className="text-black font-bold">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] text-base placeholder:text-black/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" title="Password" className="text-black font-bold">Password</FieldLabel>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[#006B6B] text-base placeholder:text-black/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border-2 border-black/10">
                <Switch
                  id="teacher-toggle"
                  checked={isTeacher}
                  onCheckedChange={setIsTeacher}
                  className="data-[state=checked]:bg-[#006B6B]"
                />
                <div className="flex flex-col">
                  <FieldLabel htmlFor="teacher-toggle" className="text-black font-black uppercase text-xs tracking-tight leading-none mb-1">Teacher Account</FieldLabel>
                  <p className="text-[10px] font-bold text-black/50 leading-none">I am an educator creating a class</p>
                </div>
              </Field>
              
              <Field>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#006B6B] hover:bg-[#005050] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all h-12 text-lg"
                >
                  {loading ? "Creating account..." : "Sign Up"}
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
                Already have an account? <Link href="/login" className="text-[#006B6B] hover:underline font-bold">Login</Link>
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

export default function SignupPage() {
  return (
    <PageLayout className="flex items-center justify-center min-h-[60vh]">
      <SignupForm />
    </PageLayout>
  )
}