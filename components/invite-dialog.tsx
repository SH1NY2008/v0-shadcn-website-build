"use client"

import type React from "react"

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
import { CalendarIcon, Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { sendStudyInvite } from "@/app/actions/email"

interface InviteDialogProps {
  sessionTitle?: string
  sessionDate?: string
  sessionTime?: string
}

export function InviteDialog({ sessionTitle, sessionDate, sessionTime }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(sessionDate ? new Date(sessionDate) : undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    friendName: "",
    friendEmail: "",
    time: sessionTime || "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      await sendStudyInvite({
        friendName: formData.friendName,
        friendEmail: formData.friendEmail,
        sessionTitle: sessionTitle || "Math Study Session",
        sessionDate: date ? format(date, "MMMM do, yyyy") : "TBD",
        sessionTime: formData.time,
        message: formData.message,
      })

      setIsSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setIsSuccess(false)
        setFormData({ friendName: "", friendEmail: "", time: sessionTime || "", message: "" })
        setDate(sessionDate ? new Date(sessionDate) : undefined)
      }, 2000)
    } catch (error) {
      console.error("Email sending failed:", error)
      alert(
        error instanceof Error ? error.message : "Failed to send invitation. Please check your EmailJS configuration.",
      )
    } finally {
      setIsSubmitting(false)
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
            Send an email invitation to study together for {sessionTitle || "a math session"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
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
              required
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
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : isSuccess ? (
                "Sent!"
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
