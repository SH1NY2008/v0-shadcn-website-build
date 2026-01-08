"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function CourseProgressBadge({ courseId, totalTopics }: { courseId: string; totalTopics: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = collection(db, "users", user.uid, "courses", courseId, "topics")
    const unsub = onSnapshot(ref, (snap) => setCompleted(snap.size))
    return () => unsub()
  }, [user, courseId])

  const percent = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0

  return (
    <Badge variant="secondary" className="text-white">
      {percent}%
    </Badge>
  )
}
