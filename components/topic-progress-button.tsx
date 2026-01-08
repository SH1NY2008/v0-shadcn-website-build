"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { isTopicCompleted, toggleTopicCompletion } from "@/lib/progress"

export function TopicProgressButton({
  courseId,
  videoId,
}: {
  courseId: string
  videoId: string
}) {
  const [user, setUser] = useState<User | null>(null)
  const [completed, setCompleted] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ok = await isTopicCompleted(u.uid, courseId, videoId)
        setCompleted(ok)
      } else {
        setCompleted(false)
      }
    })
    return () => unsub()
  }, [courseId, videoId])

  const handleToggle = async () => {
    if (!user) return
    setLoading(true)
    try {
      await toggleTopicCompletion(user.uid, courseId, videoId)
      const ok = await isTopicCompleted(user.uid, courseId, videoId)
      setCompleted(ok)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant={completed ? "secondary" : "outline"} onClick={handleToggle} disabled={!user || loading}>
      {completed ? "Completed" : "Mark complete"}
    </Button>
  )
}

