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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, ClipboardList } from "lucide-react"
import { createAssignment, type ClassData } from "@/lib/teacher"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"

interface AssignQuizDialogProps {
  teacherId: string
  classes: ClassData[]
  category: string
}

export function AssignQuizDialog({ teacherId, classes, category }: AssignQuizDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(category)
  const [description, setDescription] = useState("")
  const [classId, setClassId] = useState("")
  const [dueDate, setDueDate] = useState("")

  const resetForCategory = () => {
    setTitle(category)
    setDescription("")
    setClassId("")
    setDueDate("")
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) resetForCategory()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherId || !classId || !dueDate) {
      toast.error("Choose a class and due date")
      return
    }

    setLoading(true)
    try {
      await createAssignment(teacherId, {
        title: title.trim() || category,
        description: description.trim(),
        courseId: category,
        classId,
        teacherId,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        status: "active",
      })
      toast.success("Quiz assigned to your class")
      setOpen(false)
    } catch (error) {
      console.error("Error assigning quiz:", error)
      toast.error("Could not assign quiz")
    } finally {
      setLoading(false)
    }
  }

  const noClasses = classes.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full border-2 border-black/15 font-bold text-[#2C2C2C] gap-2 h-10 text-sm bg-[#FFC971]/40 hover:bg-[#FFC971]/70"
        >
          <ClipboardList className="h-4 w-4 shrink-0" />
          Assign quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
            Assign quiz
          </DialogTitle>
          <DialogDescription className="text-[#006B6B] font-bold text-lg">
            {category}
          </DialogDescription>
        </DialogHeader>
        {noClasses ? (
          <p className="py-6 text-center font-bold text-[#2C2C2C]/80">
            Create a class on your dashboard first, then you can assign this quiz.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="assign-title" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
                Title
              </Label>
              <Input
                id="assign-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 border-black bg-white font-bold"
                placeholder="Title shown to students"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-desc" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
                Instructions (optional)
              </Label>
              <Textarea
                id="assign-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-2 border-black bg-white font-bold resize-none min-h-[80px]"
                placeholder="Optional note for your class"
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
              <Label htmlFor="assign-due" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">
                Due date
              </Label>
              <div className="relative">
                <Input
                  id="assign-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-2 border-black bg-white font-bold pl-10"
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 pointer-events-none" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {loading ? "Saving…" : "Assign to class"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
