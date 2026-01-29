import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface NumeriaLoaderProps {
  onFadeOutStart: () => void
  onComplete: () => void
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
const BRAND_NAME = "NUMERIA"
const SCRAMBLE_INTERVAL = 50 // ms
const SETTLE_DELAY_START = 800 // ms - time before first letter settles
const SETTLE_STAGGER = 100 // ms - time between letters settling
const HOLD_DURATION = 500 // ms - hold after all settled
const FADE_DURATION = 500 // ms - fade out duration

const LetterScrambler = ({ 
  targetChar, 
  index, 
}: { 
  targetChar: string
  index: number 
}) => {
  const [displayChar, setDisplayChar] = useState(CHARS[Math.floor(Math.random() * CHARS.length)])
  const [isLocked, setIsLocked] = useState(false)
  const [jitter, setJitter] = useState({ x: 0 })
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      setIsLocked(true)
      setDisplayChar(targetChar)
      return
    }

    const settleTime = SETTLE_DELAY_START + (index * SETTLE_STAGGER)
    let intervalId: NodeJS.Timeout
    let settleTimeoutId: NodeJS.Timeout

    // Start scrambling
    intervalId = setInterval(() => {
      setDisplayChar(CHARS[Math.floor(Math.random() * CHARS.length)])
      // Random jitter between -2px and 2px (subtle horizontal jitter)
      setJitter({ x: Math.random() * 4 - 2 })
    }, SCRAMBLE_INTERVAL)

    // Schedule settling
    settleTimeoutId = setTimeout(() => {
      setIsLocked(true)
      setDisplayChar(targetChar)
      setJitter({ x: 0 })
      clearInterval(intervalId)
    }, settleTime)

    return () => {
      clearInterval(intervalId)
      clearTimeout(settleTimeoutId)
    }
  }, [index, targetChar])

  return (
    <motion.span
      className="inline-block font-black text-6xl md:text-8xl tracking-widest text-[#2C2C2C]"
      animate={isLocked ? { 
        scale: [1.1, 1.0],
        opacity: 1,
        x: 0
      } : { 
        opacity: 0.85,
        x: jitter.x
      }}
      transition={isLocked ? { 
        scale: { duration: 0.2 },
        opacity: { duration: 0 }, // Snap to full opacity
        x: { duration: 0.2 }
      } : {
        duration: 0.05
      }}
    >
      {displayChar}
    </motion.span>
  )
}

export function NumeriaLoader({ onFadeOutStart, onComplete }: NumeriaLoaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    // Calculate total time until we should start fading out
    // Last letter settles at: SETTLE_DELAY_START + ((BRAND_NAME.length - 1) * SETTLE_STAGGER)
    // Then we hold for HOLD_DURATION
    const lastLetterSettleTime = SETTLE_DELAY_START + ((BRAND_NAME.length - 1) * SETTLE_STAGGER)
    const startFadeTime = lastLetterSettleTime + HOLD_DURATION
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      onFadeOutStart()
    }, startFadeTime)

    return () => clearTimeout(timer)
  }, [onFadeOutStart])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFB627]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION / 1000, ease: "easeInOut" }}
        >
          <div className="flex">
            {BRAND_NAME.split("").map((char, index) => (
              <LetterScrambler 
                key={index} 
                targetChar={char} 
                index={index} 
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
