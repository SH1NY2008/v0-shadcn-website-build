"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
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
    <PageLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-black">Study Session Call</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => api?.executeCommand?.("toggleTileView")}
              className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Toggle Tile View
            </Button>
            <Button 
              onClick={() => router.back()}
              className="bg-[#006B6B] hover:bg-[#005050] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Leave
            </Button>
          </div>
        </div>
        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
          <DialogContent className="sm:max-w-md border-4 border-black/10 bg-[#FFB627] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-3xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Enable Mic & Camera</DialogTitle>
              <DialogDescription className="text-[#006B6B] font-bold text-lg mt-1">Grant access to your microphone and camera to join the call.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button 
                onClick={requestPermissions} 
                disabled={requesting} 
                className="flex-1 bg-[#006B6B] text-white font-black text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] uppercase tracking-wide"
              >
                {requesting ? "Requesting..." : "Enable"}
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="flex-1 bg-transparent border-4 border-black/10 text-[#2C2C2C] font-black text-lg h-14 rounded-xl hover:bg-black/5 uppercase tracking-wide"
              >
                <a href={roomUrl} target="_blank" rel="noopener noreferrer">Open in Jitsi</a>
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2 font-bold">{error}</p>}
          </DialogContent>
        </Dialog>
        {joining && (
          <div className="text-sm text-muted-foreground font-bold">Joining room...</div>
        )}
        {error && !showPrompt && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-bold">
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
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Retry
            </Button>
            <Button asChild size="sm" variant="default" className="bg-[#006B6B] hover:bg-[#005050] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <a href={roomUrl} target="_blank" rel="noopener noreferrer">Open in Jitsi</a>
            </Button>
          </div>
        )}
        <div className="w-full flex-1 rounded-xl border-4 border-black overflow-hidden bg-[#FFB627] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-1">
          <div ref={containerRef} className="w-full h-[70vh] rounded-lg overflow-hidden bg-black/5" />
        </div>
      </div>
    </PageLayout>
  )
}
