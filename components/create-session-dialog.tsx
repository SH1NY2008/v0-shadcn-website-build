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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createSession, type StudySession } from "@/lib/sessions"
import { curriculum } from "@/lib/curriculum"

interface CreateSessionDialogProps {
  userId: string
  userName: string
  userEmail: string
  onSessionCreated: (session: StudySession) => void
}

export function CreateSessionDialog({ userId, userName, userEmail, onSessionCreated }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    date: "",
    startTime: "",
    endTime: "",
    isPublic: "public",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const session = await createSession(userId, userName, userEmail, {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isPublic: formData.isPublic === "public",
      })

      onSessionCreated(session)

      setOpen(false)
      setFormData({
        title: "",
        description: "",
        courseId: "",
        date: "",
        startTime: "",
        endTime: "",
        isPublic: "public",
      })
    } catch (error) {
      console.error("Failed to create session:", error)
      alert("Failed to create session. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#006B6B] text-white font-bold text-lg h-14 rounded-xl hover:bg-[#005555] shadow-md px-8 uppercase tracking-wide gap-2 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <Plus className="h-5 w-5" />
          Add Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-4 border-black/10 bg-[#FFB627] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Create Study Session</DialogTitle>
          <DialogDescription className="text-[#006B6B] font-bold text-lg mt-1">Schedule a new math study session</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-bold text-[#2C2C2C]">Session Title</Label>
            <Input
              id="title"
              placeholder="Algebra 2: Quadratic Functions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-12 rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium placeholder:text-[#2C2C2C]/40 focus-visible:ring-[#006B6B] focus-visible:border-[#006B6B]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-bold text-[#2C2C2C]">Description</Label>
            <Textarea
              id="description"
              placeholder="Review key concepts and practice problems"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
              className="resize-none rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium placeholder:text-[#2C2C2C]/40 focus-visible:ring-[#006B6B] focus-visible:border-[#006B6B]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseId" className="text-base font-bold text-[#2C2C2C]">Course</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              required
            >
              <SelectTrigger className="h-12 rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium focus:ring-[#006B6B] focus:border-[#006B6B]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-black/10 bg-[#FFC971]">
                {curriculum.map((course) => (
                  <SelectItem key={course.id} value={course.id} className="text-base font-bold focus:bg-white/40 focus:text-[#2C2C2C] cursor-pointer">
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-bold text-[#2C2C2C]">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-12 rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium focus-visible:ring-[#006B6B] focus-visible:border-[#006B6B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-base font-bold text-[#2C2C2C]">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="h-12 rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium focus-visible:ring-[#006B6B] focus-visible:border-[#006B6B]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-base font-bold text-[#2C2C2C]">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="h-12 rounded-xl border-2 border-black/10 bg-white/40 text-lg font-medium focus-visible:ring-[#006B6B] focus-visible:border-[#006B6B]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold text-[#2C2C2C]">Session Type</Label>
            <RadioGroup
              value={formData.isPublic}
              onValueChange={(value) => setFormData({ ...formData, isPublic: value })}
              className="gap-3"
            >
              <div className="flex items-center space-x-3 rounded-xl border-2 border-black/5 bg-white/20 p-3 transition-colors hover:bg-white/40">
                <RadioGroupItem value="public" id="public" className="border-2 border-[#2C2C2C] text-[#006B6B]" />
                <Label htmlFor="public" className="font-bold text-[#2C2C2C] cursor-pointer">
                  Public - Anyone can join this session
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-xl border-2 border-black/5 bg-white/20 p-3 transition-colors hover:bg-white/40">
                <RadioGroupItem value="private" id="private" className="border-2 border-[#2C2C2C] text-[#006B6B]" />
                <Label htmlFor="private" className="font-bold text-[#2C2C2C] cursor-pointer">
                  Private - Only you can access this session
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 bg-transparent border-4 border-black/10 text-[#2C2C2C] font-black text-lg h-14 rounded-xl hover:bg-black/5 uppercase tracking-wide" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gap-2 bg-[#006B6B] text-white font-black text-lg h-14 rounded-xl hover:bg-[#005555] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[2px] uppercase tracking-wide" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Session
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
