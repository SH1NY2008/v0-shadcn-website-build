'use client'

import React, { useEffect, useRef } from 'react'

interface MathTextProps {
  content: string
  className?: string
}

declare global {
  interface Window {
    MathJax: any
  }
}

export function MathText({ content, className }: MathTextProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const typeset = () => {
      if (window.MathJax && ref.current) {
        if (window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([ref.current])
            .catch((err: any) => console.log('MathJax typeset failed:', err))
        } else if (window.MathJax.typeset) {
           window.MathJax.typeset([ref.current])
        }
      }
    }

    if (window.MathJax) {
      typeset()
    } else {
      // Poll for MathJax to be ready
      const interval = setInterval(() => {
        if (window.MathJax) {
          clearInterval(interval)
          typeset()
        }
      }, 50)
      
      // Stop polling after 3 seconds to avoid infinite loops
      const timeout = setTimeout(() => {
          clearInterval(interval)
      }, 3000)

      return () => {
          clearInterval(interval)
          clearTimeout(timeout)
      }
    }
  })

  return (
    <div 
      ref={ref} 
      className={className} 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  )
}
