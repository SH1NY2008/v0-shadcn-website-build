"use client"

import { motion, useAnimation, useInView, Variants, HTMLMotionProps } from "framer-motion"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  threshold?: number
  delay?: number
  duration?: number
  yOffset?: number
}

export function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  delay = 0,
  duration = 0.5,
  yOffset = 30,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const variants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
