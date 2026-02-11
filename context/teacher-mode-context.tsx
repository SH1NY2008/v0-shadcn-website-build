"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface TeacherModeContextType {
  isTeacherMode: boolean
  setIsTeacherMode: (value: boolean) => void
}

const TeacherModeContext = createContext<TeacherModeContextType | undefined>(undefined)

export function TeacherModeProvider({ children }: { children: React.ReactNode }) {
  const [isTeacherMode, setIsTeacherMode] = useState(false)

  // Load from localStorage if available
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
    <TeacherModeContext.Provider value={{ isTeacherMode, setIsTeacherMode }}>
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
