"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CallPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [api, setApi] = useState<any>(null)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const roomUrl = `https://meet.jit.si/NumeriaStudy-${id}`

  useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return
      if ((window as any).JitsiMeetExternalAPI) {
        setReady(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = () => setReady(true)
      document.body.appendChild(script)
    }
    load()
    return () => {
      try {
        api?.dispose?.()
      } catch {}
    }
  }, [api])

  useEffect(() => {
    if (!ready || !containerRef.current || !id || !permissionGranted) return
    const ExternalAPI = (window as any).JitsiMeetExternalAPI
    const domain = "meet.jit.si"
    const roomName = `NumeriaStudy-${id}`
    setJoining(true)
    const instance = new ExternalAPI(domain, {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: { disableDeepLinking: true },
    })
    instance.addEventListener("videoConferenceJoined", () => {
      setJoining(false)
      setError(null)
    })
    instance.addEventListener("readyToClose", () => {
      setJoining(false)
    })
    instance.addEventListener("errorOccurred", (e: any) => {
      setJoining(false)
      setError(e?.message || "Jitsi error occurred")
    })
    const timeout = setTimeout(() => {
      if (joining) setError("Taking too long to join. Try external link or retry.")
    }, 6000)
    setApi(instance)
    return () => {
      clearTimeout(timeout)
    }
  }, [ready, id, permissionGranted, joining])

  const requestPermissions = async () => {
    if (requesting) return
    setRequesting(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionGranted(true)
      setShowPrompt(false)
    } catch (e: any) {
      setError(e?.message || "Microphone/Camera permission denied")
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      <main className="container mx-auto max-w-6xl px-4 py-4 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Study Session Call</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => api?.executeCommand?.("toggleTileView")}>Toggle Tile View</Button>
            <Button onClick={() => router.back()}>Leave</Button>
          </div>
        </div>
        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enable Mic & Camera</DialogTitle>
              <DialogDescription>Grant access to your microphone and camera to join the call.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button onClick={requestPermissions} disabled={requesting} className="flex-1">
                {requesting ? "Requesting..." : "Enable"}
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href={roomUrl} target="_blank" rel="noopener noreferrer">Open in Jitsi</a>
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </DialogContent>
        </Dialog>
        {joining && (
          <div className="text-sm text-muted-foreground">Joining room...</div>
        )}
        {error && !showPrompt && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                setJoining(false)
                setApi(null)
                setReady(false)
                const script = document.createElement("script")
                script.src = "https://meet.jit.si/external_api.js"
                script.async = true
                script.onload = () => setReady(true)
                document.body.appendChild(script)
              }}
            >
              Retry
            </Button>
            <Button asChild size="sm" variant="default">
              <a href={roomUrl} target="_blank" rel="noopener noreferrer">Open in Jitsi</a>
            </Button>
          </div>
        )}
        <div className="w-full flex-1 rounded-lg border overflow-hidden">
          <div ref={containerRef} className="w-full h-[70vh]" />
        </div>
      </main>
    </div>
  )
}
