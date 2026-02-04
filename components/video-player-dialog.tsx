"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface VideoPlayerDialogProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  title: string
}

export function VideoPlayerDialog({ isOpen, onClose, videoId, title }: VideoPlayerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl border-4 border-black/10 bg-[#FFB627] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-[#2C2C2C] uppercase tracking-tight truncate pr-8">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[#006B6B] font-bold text-lg">
            Video Lesson
          </DialogDescription>
        </DialogHeader>
        <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden border-4 border-black/10 shadow-inner">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
