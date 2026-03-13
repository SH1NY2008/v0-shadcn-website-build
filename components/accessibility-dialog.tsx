'use client'

import * as React from 'react'
import { Settings2, Volume2, VolumeX, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useQuizSettings } from "@/hooks/use-quiz-settings"

export function AccessibilityDialog() {
  const { settings, toggleSound, toggleHaptics, updateZoom, loaded } = useQuizSettings()

  if (!loaded) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold">
          <Settings2 className="h-5 w-5 mr-2" />
          Accessibility
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-4 border-black/10 bg-[#FFB627] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Accessibility
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-[#006B6B]" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <Label htmlFor="sound-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Sound Effects</Label>
            </div>
            <Switch 
              id="sound-toggle" 
              checked={settings.soundEnabled} 
              onCheckedChange={toggleSound}
              className="data-[state=checked]:bg-[#006B6B]"
            />
          </div>

          <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <Smartphone className={`h-5 w-5 ${settings.hapticsEnabled ? "text-[#006B6B]" : "text-gray-400"}`} />
                <Label htmlFor="haptics-toggle" className="font-bold text-[#2C2C2C] cursor-pointer">Haptic Feedback</Label>
              </div>
              <Switch 
                id="haptics-toggle" 
                checked={settings.hapticsEnabled} 
                onCheckedChange={toggleHaptics}
                className="data-[state=checked]:bg-[#006B6B]"
              />
            </div>

            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <Label htmlFor="font-size" className="font-bold text-[#2C2C2C] cursor-pointer">Zoom Level</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => updateZoom(settings.zoom - 0.1)} size="sm" variant="outline" className="font-bold">-</Button>
                <span className="font-bold text-[#2C2C2C]">{Math.round(settings.zoom * 100)}%</span>
                <Button onClick={() => updateZoom(settings.zoom + 0.1)} size="sm" variant="outline" className="font-bold">+</Button>
                <Button onClick={() => updateZoom(1)} size="sm" variant="outline" className="font-bold">Reset</Button>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
