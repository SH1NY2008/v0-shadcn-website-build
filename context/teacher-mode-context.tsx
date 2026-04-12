"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

interface TeacherModeContextType {
  isTeacherMode: boolean
  setIsTeacherMode: (value: boolean) => void
  userRole: "teacher" | "student" | "parent" | null
  /** False until the first Firestore snapshot for `users/{uid}` (or confirmed signed-out). Avoids treating "role not loaded yet" as access denied. */
  isRoleResolved: boolean
}

const TeacherModeContext = createContext<TeacherModeContextType | undefined>(undefined)

function normalizeRole(raw: unknown): "teacher" | "student" | "parent" | null {
  if (raw == null || raw === "") return null
  const s = String(raw).toLowerCase().trim()
  if (s === "teacher" || s === "educator") return "teacher"
  if (s === "student") return "student"
  if (s === "parent") return "parent"
  return null
}

export function TeacherModeProvider({ children }: { children: React.ReactNode }) {
  const [isTeacherMode, setIsTeacherMode] = useState(false)
  const [userRole, setUserRole] = useState<"teacher" | "student" | "parent" | null>(null)
  const [isRoleResolved, setIsRoleResolved] = useState(false)

  // Listen to Auth and Firestore role
  useEffect(() => {
    let unsubProfile: (() => void) | undefined

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubProfile?.()
      unsubProfile = undefined

      if (!user) {
        setUserRole(null)
        setIsTeacherMode(false)
        setIsRoleResolved(true)
        return
      }

      setIsRoleResolved(false)
      unsubProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          if (snap.exists()) {
            const normalized = normalizeRole(snap.data().role)
            setUserRole(normalized)
            setIsTeacherMode(normalized === "teacher")
          } else {
            setUserRole(null)
            setIsTeacherMode(false)
          }
          setIsRoleResolved(true)
        },
        (error) => {
          console.error("Error listening to user document:", error)
          setUserRole(null)
          setIsTeacherMode(false)
          setIsRoleResolved(true)
        }
      )
    })

    return () => {
      unsubProfile?.()
      unsubAuth()
    }
  }, [])

  // Load from localStorage only as initial UI hint; Firestore role overrides once loaded.
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
    <TeacherModeContext.Provider value={{ isTeacherMode, setIsTeacherMode, userRole, isRoleResolved }}>
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
