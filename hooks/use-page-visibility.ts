
'use client'

import { useState, useEffect } from 'react'

function getIsDocumentHidden() {
    return typeof document !== 'undefined' && document.hidden;
}

export function usePageVisibility() {
  const [isHidden, setIsHidden] = useState(getIsDocumentHidden())

  useEffect(() => {
    const handleChange = () => {
      setIsHidden(getIsDocumentHidden())
    }

    document.addEventListener('visibilitychange', handleChange)

    return () => {
      document.removeEventListener('visibilitychange', handleChange)
    }
  }, [])

  return isHidden
}
