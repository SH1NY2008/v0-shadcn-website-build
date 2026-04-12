"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useTeacherMode } from "@/context/teacher-mode-context"
import { curriculum } from "@/lib/curriculum"
import {
  subscribeCurriculumSettings,
  saveTopicPatch,
  addExtraTopic,
  removeExtraTopic,
  topicKey,
  unitKey,
  type CurriculumSettingsData,
  type TopicPatch,
} from "@/lib/curriculum-settings"
import type { Topic } from "@/lib/curriculum"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, EyeOff, RotateCcw, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function CurriculumEditorPage() {
  const { userRole, isRoleResolved } = useTeacherMode()
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<CurriculumSettingsData | null>(null)

  useEffect(() => {
    const u = onAuthStateChanged(auth, (x) => {
      setUser(x)
      setAuthReady(true)
    })
    return () => u()
  }, [])

  useEffect(() => {
    if (userRole !== "teacher" || !isRoleResolved) return
    const unsub = subscribeCurriculumSettings(setSettings)
    return () => unsub()
  }, [userRole, isRoleResolved])

  if (!authReady || !isRoleResolved) {
    return (
      <PageLayout>
        <div className="py-24 text-center animate-pulse font-black text-[#2C2C2C]/40">Loading…</div>
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="py-24 text-center">
          <Button asChild className="bg-[#006B6B] font-bold">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  if (userRole !== "teacher") {
    return (
      <PageLayout>
        <p className="py-24 text-center font-bold">Teachers only.</p>
      </PageLayout>
    )
  }

  const patches = settings?.topicPatches ?? {}
  const extras = settings?.extraTopicsByUnit ?? {}

  return (
    <PageLayout>
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-[#2C2C2C]/60 hover:text-[#2C2C2C]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-[#2C2C2C] md:text-7xl">
          Curriculum editor
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-bold text-[#2C2C2C]/80">
          Changes apply to the Resources page for everyone. Replace YouTube video IDs, hide lessons, or add extra
          videos to a unit.
        </p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {curriculum.map((course) => (
          <AccordionItem
            key={course.id}
            value={course.id}
            className="rounded-2xl border-4 border-black/10 bg-[#FFC971]/30 px-4"
          >
            <AccordionTrigger className="font-black text-xl text-[#2C2C2C] hover:no-underline py-4">
              {course.name}
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-6">
              {course.units.map((unit, unitIndex) => {
                const uk = unitKey(course.id, unitIndex)
                const extraList = extras[uk] ?? []
                return (
                  <div key={uk} className="rounded-xl border-2 border-black/10 bg-white/60 p-4">
                    <h3 className="font-black text-lg text-[#006B6B] mb-4">{unit.name}</h3>
                    <div className="space-y-4">
                      {unit.topics.map((topic, topicIndex) => {
                        const key = topicKey(course.id, unitIndex, topicIndex)
                        const p: TopicPatch | undefined = patches[key]
                        const hidden = p?.hidden === true
                        const effectiveVideo = p?.videoId ?? topic.videoId
                        return (
                          <div
                            key={key}
                            className={`rounded-lg border-2 border-black/10 p-3 ${hidden ? "opacity-50" : ""}`}
                          >
                            <div className="font-bold text-[#2C2C2C] mb-2">{topic.name}</div>
                            {hidden ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <BadgeHidden />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="font-bold"
                                  onClick={async () => {
                                    await saveTopicPatch(key, null)
                                    toast.success("Lesson visible again")
                                  }}
                                >
                                  <RotateCcw className="mr-1 h-4 w-4" /> Restore
                                </Button>
                              </div>
                            ) : (
                              <TopicRow
                                initialVideoId={effectiveVideo}
                                onSave={async (videoId) => {
                                  await saveTopicPatch(key, { videoId, hidden: false })
                                  toast.success("Video ID updated")
                                }}
                                onHide={async () => {
                                  await saveTopicPatch(key, { hidden: true })
                                  toast.success("Lesson hidden on Resources")
                                }}
                              />
                            )}
                          </div>
                        )
                      })}

                      {extraList.map((t, i) => (
                        <div
                          key={`extra-${i}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-dashed border-[#006B6B]/40 p-3"
                        >
                          <div>
                            <div className="text-xs font-black uppercase text-[#006B6B]">Added video</div>
                            <div className="font-bold text-[#2C2C2C]">{t.name}</div>
                            <div className="text-xs font-mono text-[#2C2C2C]/60">{t.videoId}</div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="font-bold"
                            onClick={async () => {
                              await removeExtraTopic(uk, i)
                              toast.success("Removed")
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <AddExtraForm
                        unitKeyStr={uk}
                        onAdd={async (topic) => {
                          await addExtraTopic(uk, topic)
                          toast.success("Video added to unit")
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageLayout>
  )
}

function BadgeHidden() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-xs font-black uppercase text-[#2C2C2C]">
      <EyeOff className="h-3 w-3" /> Hidden
    </span>
  )
}

function TopicRow({
  initialVideoId,
  onSave,
  onHide,
}: {
  initialVideoId: string
  onSave: (videoId: string) => Promise<void>
  onHide: () => Promise<void>
}) {
  const [vid, setVid] = useState(initialVideoId)
  useEffect(() => {
    setVid(initialVideoId)
  }, [initialVideoId])
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[200px]">
        <Label className="text-xs font-black uppercase text-[#2C2C2C]/50">YouTube video ID</Label>
        <Input
          value={vid}
          onChange={(e) => setVid(e.target.value)}
          className="border-2 border-black font-mono text-sm"
        />
      </div>
      <Button
        type="button"
        className="bg-[#006B6B] font-bold"
        onClick={() => onSave(vid.trim())}
      >
        Save
      </Button>
      <Button type="button" variant="outline" className="font-bold border-2 border-black/20" onClick={onHide}>
        <EyeOff className="mr-1 h-4 w-4" />
        Hide lesson
      </Button>
    </div>
  )
}

function AddExtraForm({
  unitKeyStr,
  onAdd,
}: {
  unitKeyStr: string
  onAdd: (t: Topic) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [videoId, setVideoId] = useState("")
  return (
    <div className="rounded-lg border-2 border-black/5 bg-[#FFC971]/20 p-3 space-y-2">
      <div className="text-xs font-black uppercase text-[#2C2C2C]/60 flex items-center gap-1">
        <Plus className="h-4 w-4" /> Add video to this unit
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Topic title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-2 border-black font-bold"
        />
        <Input
          placeholder="YouTube video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          className="border-2 border-black font-mono text-sm"
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="font-bold"
        disabled={!name.trim() || !videoId.trim()}
        onClick={async () => {
          await onAdd({ name: name.trim(), videoId: videoId.trim() })
          setName("")
          setVideoId("")
        }}
      >
        Add to unit
      </Button>
    </div>
  )
}
