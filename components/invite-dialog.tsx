"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Send, Copy, Check, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface InviteDialogProps {
  sessionTitle?: string
  sessionDate?: string
  sessionTime?: string
}

export function InviteDialog({ sessionTitle, sessionDate, sessionTime }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(sessionDate ? new Date(sessionDate) : undefined)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [formData, setFormData] = useState({
    friendName: "",
    friendEmail: "",
    time: sessionTime || "",
    message: "",
  })

  const generateInviteMessage = () => {
    return `Hey ${formData.friendName}!

I'd like to invite you to join me for a study session on Numeria.inc:

📚 Session: ${sessionTitle || "Math Study Session"}
📅 Date: ${date ? format(date, "MMMM do, yyyy") : "TBD"}
⏰ Time: ${formData.time || "TBD"}

${formData.message ? `Message: ${formData.message}\n\n` : ""}Join me at: ${window.location.origin}

Looking forward to studying together!`
  }

  const handleCopyInvite = async () => {
    const message = generateInviteMessage()
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = async () => {
    if (sending) return
    setSending(true)
    setSent(false)
    try {
      const res = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendName: formData.friendName,
          friendEmail: formData.friendEmail,
          sessionTitle,
          sessionDate: date ? format(date, "yyyy-MM-dd") : sessionDate,
          sessionTime: formData.time,
          message: formData.message,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        const detailsStr =
          err && err.details
            ? typeof err.details === "string"
              ? err.details
              : JSON.stringify(err.details)
            : ""
        const msg = err?.error ? `${err.error}${detailsStr ? `: ${detailsStr}` : ""}` : "Failed to send invite"
        throw new Error(msg)
      }
      setSent(true)
      setFormData((prev) => ({ ...prev, message: "" }))
    } catch (e: any) {
      alert(e?.message || "Failed to send invite. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Send className="h-4 w-4" />
          Invite Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Friend to Study</DialogTitle>
          <DialogDescription>
            Create an invitation to study together for {sessionTitle || "a math session"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="friendName">Friend's Name</Label>
            <Input
              id="friendName"
              placeholder="John Doe"
              value={formData.friendName}
              onChange={(e) => setFormData({ ...formData, friendName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="friendEmail">Friend's Email</Label>
            <Input
              id="friendEmail"
              type="email"
              placeholder="friend@example.com"
              value={formData.friendEmail}
              onChange={(e) => setFormData({ ...formData, friendEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Study Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Study Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Let's study together for the upcoming quiz!"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
              onClick={handleCopyInvite}
              disabled={!formData.friendName}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Invite
                </>
              )}
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={handleSendInvite}
              disabled={!formData.friendName || !formData.friendEmail || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <Check className="h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
