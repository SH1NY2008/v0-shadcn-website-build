"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Calendar as CalendarIcon } from "lucide-react"
import { createClassWorkAssignment } from "@/lib/class-work"
import type { ClassData } from "@/lib/teacher"
import { toast } from "sonner"

interface CreateClassWorkDialogProps {
  teacherId: string
  classes: ClassData[]
  trigger?: React.ReactNode
}

export function CreateClassWorkDialog({ teacherId, classes, trigger }: CreateClassWorkDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classId, setClassId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !classId || !dueDate) {
      toast.error("Title, class, and due date are required.")
      return
    }

    setLoading(true)
    try {
      await createClassWorkAssignment({
        teacherId,
        classId,
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate),
        file,
      })
      toast.success("Assignment posted for your class.")
      setOpen(false)
      setTitle("")
      setDescription("")
      setClassId("")
      setDueDate("")
      setFile(null)
    } catch (err) {
      console.error(err)
      toast.error("Could not create assignment. Check Firebase Storage rules and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#006B6B] text-white font-bold gap-2">
            <Plus className="h-4 w-4" /> New class assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
            Create class assignment
          </DialogTitle>
          <DialogDescription className="text-[#006B6B] font-bold text-lg">
            Upload instructions or a worksheet. Students in the class can download it and submit their work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cw-title" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
              Title
            </Label>
            <Input
              id="cw-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 4 — Polynomials"
              className="border-2 border-black bg-white font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw-desc" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
              Instructions
            </Label>
            <Textarea
              id="cw-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What students should do, due expectations, etc."
              className="border-2 border-black bg-white font-bold min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Class</Label>
            <Select value={classId} onValueChange={setClassId} required>
              <SelectTrigger className="border-2 border-black bg-white font-bold">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.period})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cw-due" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
              Due date
            </Label>
            <div className="relative">
              <Input
                id="cw-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-2 border-black bg-white font-bold pl-10"
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
              Attachment (optional)
            </Label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/30 bg-white/80 px-4 py-6">
              <Upload className="mb-2 h-8 w-8 text-[#006B6B]" />
              <span className="text-center text-sm font-bold text-[#2C2C2C]">
                {file ? file.name : "PDF, images, or document"}
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => setFile(null)}>
                Remove file
              </Button>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loading || classes.length === 0}
              className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? "Publishing…" : "Publish assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
