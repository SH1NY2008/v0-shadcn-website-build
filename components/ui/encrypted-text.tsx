"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface EncryptedTextProps {
  text: string
  className?: string
  encryptedClassName?: string
  revealedClassName?: string
  revealDelayMs?: number
  characters?: string
}

export function EncryptedText({
  text,
  className,
  encryptedClassName = "text-muted-foreground",
  revealedClassName = "text-foreground",
  revealDelayMs = 50,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()",
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start the reveal animation
    const startReveal = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return prev
          }
          return prev + 1
        })
      }, revealDelayMs)
    }

    // Scramble before revealing
    const scrambleInterval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((char, index) => {
            if (index < currentIndex) return text[index]
            if (char === " ") return " "
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join(""),
      )
    }, 50)

    startReveal()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearInterval(scrambleInterval)
    }
  }, [text, currentIndex, revealDelayMs, characters])

  return (
    <span className={cn(className)}>
      {displayText.split("").map((char, index) => (
        <span
          key={index}
          className={cn(
            "transition-colors duration-300",
            index < currentIndex ? revealedClassName : encryptedClassName,
          )}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
