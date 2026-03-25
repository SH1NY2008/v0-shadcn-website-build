"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

interface TeacherModeContextType {
  isTeacherMode: boolean
  setIsTeacherMode: (value: boolean) => void
  userRole: "teacher" | "student" | "parent" | null
}

const TeacherModeContext = createContext<TeacherModeContextType | undefined>(undefined)

export function TeacherModeProvider({ children }: { children: React.ReactNode }) {
  const [isTeacherMode, setIsTeacherMode] = useState(false)
  const [userRole, setUserRole] = useState<"teacher" | "student" | "parent" | null>(null)

  // Listen to Auth and Firestore role
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
          if (doc.exists()) {
            const role = doc.data().role
            setUserRole(role)
            // Auto-enable teacher mode if they are a teacher
            if (role === "teacher") {
              setIsTeacherMode(true)
            }
          }
        }, (error) => {
          console.error("Error listening to user document:", error)
        })
        return () => unsubDoc()
      } else {
        setUserRole(null)
        setIsTeacherMode(false)
      }
    })
    return () => unsubAuth()
  }, [])

  // Load from localStorage if available (as a fallback or for guests)
  useEffect(() => {
    const stored = localStorage.getItem("teacher-mode")
    if (stored === "true") {
      setIsTeacherMode(true)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("teacher-mode", String(isTeacherMode))
  }, [isTeacherMode])

  return (
    <TeacherModeContext.Provider value={{ isTeacherMode, setIsTeacherMode, userRole }}>
      {children}
    </TeacherModeContext.Provider>
  )
}

export function useTeacherMode() {
  const context = useContext(TeacherModeContext)
  if (context === undefined) {
    throw new Error("useTeacherMode must be used within a TeacherModeProvider")
  }
  return context
}
