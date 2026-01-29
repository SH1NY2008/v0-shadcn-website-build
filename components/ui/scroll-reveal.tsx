"use client"

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, MotionValue, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  threshold?: number // 0 to 1, how much of viewport is crossed before starting
  delay?: number // 0 to 1, relative delay within the scroll range
  duration?: number // Relative duration of the scroll effect
  yOffset?: number
  scaleOffset?: number
  blurOffset?: number
  enableBlur?: boolean
  staggerIndex?: number
  once?: boolean // If true, locks at 100%
}

/**
 * A hook that tracks scroll progress but locks it once it reaches 100%
 * to satisfy "All animations execute once... never repeat".
 */
function useLockedScroll(progress: MotionValue<number>) {
  const locked = useMotionValue(0)
  
  useMotionValueEvent(progress, "change", (latest) => {
    const current = locked.get()
    if (latest > current) {
      locked.set(latest)
    }
  })
  
  return locked
}

export function ScrollReveal({
  children,
  className,
  threshold = 0.2, // "20-30% viewport threshold"
  delay = 0,
  duration = 1, // Normalized scroll duration
  yOffset = 30,
  scaleOffset = 0, // 0 means no scale change. For cards: 0.04 (1 - 0.96)
  blurOffset = 0,
  enableBlur = false,
  once = true,
  staggerIndex = 0,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  
  // Calculate offset based on threshold.
  // "start end" means when top of element hits bottom of viewport.
  // We want to start when it's 20% into the viewport.
  // "start 80%" (if 0.2 threshold)
  const startOffset = `${100 - (threshold * 100)}%`
  
  // "slow scrolling creates slow animation unfold"
  // We define a scroll range. The animation completes after scrolling X distance.
  // We'll use a relative end offset.
  
  // Revised approach for offset:
  // We want the animation to *complete* comfortably.
  // Let's say the interaction zone is 40vh.
  const { scrollYProgress: rawProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}` as any, `start ${parseFloat(startOffset) - 30}%` as any] 
    // e.g. start 80% -> start 50%. 30vh scroll distance to complete.
  })

  // Apply the "lock" logic
  const lockedProgress = useLockedScroll(rawProgress)
  const activeProgress = once ? lockedProgress : rawProgress

  // "physically responsive feel" -> useSpring to smooth out the scroll steps
  const smoothProgress = useSpring(activeProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001
  })

  // Handle Delay and Duration by transforming the 0-1 progress
  // If delay is 0.1, we map [0.1, 1] to [0, 1] (simplified)
  // Actually, standard delay just shifts the start.
  // We'll use useTransform.
  
  const effectiveDelay = delay * 0.5 // Scale delay to cover more of the scroll range
  const effectiveDuration = 1 - effectiveDelay
  
  const animationProgress = useTransform(
    smoothProgress,
    [effectiveDelay, effectiveDelay + effectiveDuration], // Map scroll range
    [0, 1], // Output 0 to 1
    { clamp: true }
  )

  const opacity = useTransform(animationProgress, [0, 1], [0, 1])
  const y = useTransform(animationProgress, [0, 1], [shouldReduceMotion ? 0 : yOffset, 0])
  const scale = useTransform(animationProgress, [0, 1], [shouldReduceMotion ? 1 : 1 - scaleOffset, 1])
  
  // "Apply will-change during active animation only"
  const willChange = useTransform(animationProgress, (v) => 
    (v > 0 && v < 1) ? "opacity, transform" : "auto"
  )

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y,
        scale,
        willChange
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
