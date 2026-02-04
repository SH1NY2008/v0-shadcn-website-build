"use client"

import { motion, useReducedMotion } from "framer-motion"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  yOffset?: number
  scaleOffset?: number
  // Keeping other props for compatibility but ignoring them
  threshold?: number
  blurOffset?: number
  enableBlur?: boolean
  staggerIndex?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 30,
  scaleOffset = 0,
  ...props
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: shouldReduceMotion ? 0 : yOffset, 
        scale: shouldReduceMotion ? 1 : 1 - scaleOffset 
      }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1 
      }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}
