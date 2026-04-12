"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

// Define types for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any
  SpeechRecognition: any
}

export function useVoiceNavigation() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  /** Sync guard — isListening only flips in onstart/onend, so double-clicks can call start() twice. */
  const recognitionActiveRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow
      const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition

      if (SpeechRecognitionConstructor) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognitionConstructor()
        recognitionInstance.continuous = true
        recognitionInstance.lang = "en-US"
        recognitionInstance.interimResults = true
        recognitionInstance.maxAlternatives = 1

        recognitionInstance.onstart = () => {
          recognitionActiveRef.current = true
          setIsListening(true)
          setError(null)
        }

        recognitionInstance.onend = () => {
          recognitionActiveRef.current = false
          setIsListening(false)
        }

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
              const command = finalTranscript.toLowerCase().trim()
              processCommand(command)
            } else {
              interimTranscript += event.results[i][0].transcript
            }
          }
          
          if (finalTranscript || interimTranscript) {
             setTranscript(finalTranscript || interimTranscript)
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          if (event.error === "network") {
            setError("Voice navigation requires an internet connection.")
          } else if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone access in your browser settings.")
          } else if (event.error === "no-speech") {
            setError("No speech detected. Please try again.")
          } else if (event.error === "aborted") {
             // Ignore aborted errors (usually happens when stopping manually)
             setError(null)
          } else {
            setError(`Error: ${event.error}`)
          }
          recognitionActiveRef.current = false
          setIsListening(false)
        }

        setRecognition(recognitionInstance)

        return () => {
          recognitionActiveRef.current = false
          try {
            recognitionInstance.stop()
          } catch {
            /* already stopped */
          }
        }
      } else {
        setIsSupported(false)
        setError("Voice navigation is not supported in this browser.")
      }
      setIsChecking(false)
    }
  }, [])

  const processCommand = useCallback((command: string) => {
    // Simple command mapping
    if (command.includes("dashboard")) {
      router.push("/dashboard")
    } else if (command.includes("quiz") || command.includes("quizzes")) {
      router.push("/quizzes")
    } else if (command.includes("schedule") || command.includes("calendar")) {
      router.push("/schedule")
    } else if (command.includes("resources") || command.includes("resource")) {
      router.push("/resources")
    } else if (command.includes("home") || command.includes("main")) {
      router.push("/")
    } else if (command.includes("login") || command.includes("sign in")) {
      router.push("/login")
    } else if (command.includes("sign up") || command.includes("register")) {
      router.push("/signup")
    }
  }, [router])

  const startListening = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition not supported in this browser.")
      return
    }
    if (!navigator.onLine) {
      setError("You are offline. Voice navigation requires an internet connection.")
      return
    }
    if (recognitionActiveRef.current) {
      return
    }
    try {
      recognitionActiveRef.current = true
      recognition.start()
    } catch (e) {
      if (e instanceof DOMException && e.name === "InvalidStateError") {
        setIsListening(true)
        return
      }
      recognitionActiveRef.current = false
      console.error("Error starting recognition:", e)
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
    }
  }, [recognition])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported,
    isChecking
  }
}
