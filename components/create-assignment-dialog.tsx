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
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { createAssignment, ClassData } from "@/lib/teacher"
import { curriculum } from "@/lib/curriculum"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"

interface CreateAssignmentDialogProps {
  teacherId: string
  classes: ClassData[]
  trigger?: React.ReactNode
}

export function CreateAssignmentDialog({ teacherId, classes, trigger }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("")
  const [classId, setClassId] = useState("")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !courseId || !classId || !dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await createAssignment(teacherId, {
        title,
        description,
        courseId,
        classId,
        teacherId,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        status: "active",
      })
      toast.success("Assignment created!")
      setOpen(false)
      // Reset form
      setTitle("")
      setDescription("")
      setCourseId("")
      setClassId("")
      setDueDate("")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#006B6B] text-white font-bold gap-2">
            <Plus className="h-4 w-4" /> Create Assignment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#FFC971] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">New Assignment</DialogTitle>
          <DialogDescription className="text-[#006B6B] font-bold text-lg">
            Create a new task for your students.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 1 Quiz: Algebra Basics"
              className="border-2 border-black bg-white font-bold"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide instructions or details..."
              className="border-2 border-black bg-white font-bold resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Course</Label>
              <Select value={courseId} onValueChange={setCourseId} required>
                <SelectTrigger className="border-2 border-black bg-white font-bold">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {curriculum.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="font-black uppercase text-xs tracking-widest text-[#2C2C2C]/60">Due Date</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-2 border-black bg-white font-bold pl-10"
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
