"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceNavigation } from "@/hooks/use-voice-navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function VoiceNavigator() {
  const { isListening, transcript, startListening, stopListening, isSupported, error, isChecking } = useVoiceNavigation()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  
  useEffect(() => {
    if (transcript) {
      toast.success(`Heard: "${transcript}"`)
    }
  }, [transcript])

  useEffect(() => {
    if (error) {
      // Don't show toast for network error if we are already showing visual indication
      if (!error.includes("internet connection")) {
         toast.error(`Voice Error: ${error}`)
      }
    }
  }, [error])

  if (isChecking) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant={isListening ? "destructive" : "default"}
        size="icon"
        disabled={!isOnline || !isSupported}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isListening ? "animate-pulse scale-110" : "hover:scale-105",
          (!isOnline || !isSupported) && "opacity-50 cursor-not-allowed"
        )}
        onClick={isListening ? stopListening : startListening}
        aria-label={!isSupported ? "Voice control not supported" : !isOnline ? "Voice unavailable offline" : isListening ? "Stop voice control" : "Start voice control"}
      >
        {!isSupported ? (
          <MicOff className="h-6 w-6 text-gray-400" />
        ) : !isOnline ? (
          <WifiOff className="h-6 w-6" />
        ) : isListening ? (
          <Mic className="h-6 w-6" />
        ) : (
          <MicOff className="h-6 w-6" />
        )}
      </Button>
      {isListening && (
        <div className="absolute bottom-16 right-0 bg-black/80 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap mb-2 backdrop-blur-sm">
          Listening... Say "Dashboard", "Quizzes", etc.
        </div>
      )}
      {!isOnline && (
         <div className="absolute bottom-16 right-0 bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap mb-2 backdrop-blur-sm">
          Voice unavailable offline
        </div>
      )}
      {!isSupported && (
         <div className="absolute bottom-16 right-0 bg-yellow-500/80 text-black px-4 py-2 rounded-lg text-sm whitespace-nowrap mb-2 backdrop-blur-sm">
          Browser not supported (Use Chrome/Edge)
        </div>
      )}
    </div>
  )
}
