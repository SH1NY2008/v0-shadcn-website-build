import React from "react"
import { cn } from "@/lib/utils"

interface MathSymbolProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function PlusSign({ className, ...props }: MathSymbolProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[8px_8px_0px_rgba(0,0,0,0.2)]", className)}
      {...props}
    >
      <path 
        d="M50 15 L50 85 M15 50 L85 50" 
        stroke="currentColor" 
        strokeWidth="15" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MultiplySign({ className, ...props }: MathSymbolProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[8px_8px_0px_rgba(0,0,0,0.2)]", className)}
      {...props}
    >
      <path 
        d="M25 25 L75 75 M75 25 L25 75" 
        stroke="currentColor" 
        strokeWidth="15" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}
