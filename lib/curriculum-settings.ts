import { db } from "./firebase"
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"
import type { Course, Topic, Unit } from "./curriculum"

const DOC_ID = "global"

export interface TopicPatch {
  videoId?: string
  /** When true, topic is omitted from merged curriculum */
  hidden?: boolean
}

export interface CurriculumSettingsData {
  /** Key: `${courseId}_${unitIndex}_${topicIndex}` */
  topicPatches: Record<string, TopicPatch>
  /** Key: `${courseId}_${unitIndex}` → extra topics appended to that unit */
  extraTopicsByUnit: Record<string, Topic[]>
  updatedAt?: unknown
}

const empty: CurriculumSettingsData = {
  topicPatches: {},
  extraTopicsByUnit: {},
}

export function topicKey(courseId: string, unitIndex: number, topicIndex: number): string {
  return `${courseId}_${unitIndex}_${topicIndex}`
}

export function unitKey(courseId: string, unitIndex: number): string {
  return `${courseId}_${unitIndex}`
}

export function mergeCourses(base: Course[], settings: CurriculumSettingsData | null): Course[] {
  const patches = settings?.topicPatches ?? {}
  const extras = settings?.extraTopicsByUnit ?? {}

  return base.map((course) => ({
    ...course,
    units: course.units.map((unit, unitIndex) => {
      const uKey = unitKey(course.id, unitIndex)
      const appended = extras[uKey] ?? []
      const topics = unit.topics
        .map((topic, topicIndex) => {
          const key = topicKey(course.id, unitIndex, topicIndex)
          const p = patches[key]
          if (p?.hidden) return null
          if (p?.videoId) return { ...topic, videoId: p.videoId }
          return { ...topic }
        })
        .filter((t): t is Topic => t !== null)

      return {
        ...unit,
        topics: [...topics, ...appended.map((t) => ({ ...t }))],
      }
    }),
  }))
}

export async function getCurriculumSettings(): Promise<CurriculumSettingsData> {
  const ref = doc(db, "curriculum_settings", DOC_ID)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { ...empty }
  const data = snap.data() as Partial<CurriculumSettingsData>
  return {
    topicPatches: data.topicPatches ?? {},
    extraTopicsByUnit: data.extraTopicsByUnit ?? {},
  }
}

export function subscribeCurriculumSettings(callback: (data: CurriculumSettingsData) => void) {
  const ref = doc(db, "curriculum_settings", DOC_ID)
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback({ ...empty })
        return
      }
      const data = snap.data() as Partial<CurriculumSettingsData>
      callback({
        topicPatches: data.topicPatches ?? {},
        extraTopicsByUnit: data.extraTopicsByUnit ?? {},
      })
    },
    (err) => {
      console.error("subscribeCurriculumSettings:", err)
      callback({ ...empty })
    }
  )
}

export async function saveTopicPatch(key: string, patch: TopicPatch | null): Promise<void> {
  const ref = doc(db, "curriculum_settings", DOC_ID)
  const snap = await getDoc(ref)
  const cur = snap.exists()
    ? ((snap.data() as Partial<CurriculumSettingsData>).topicPatches ?? {})
    : {}
  const next = { ...cur }
  if (patch === null) {
    delete next[key]
  } else {
    next[key] = patch
  }
  await setDoc(
    ref,
    {
      topicPatches: next,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function addExtraTopic(unitKeyStr: string, topic: Topic): Promise<void> {
  const ref = doc(db, "curriculum_settings", DOC_ID)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as Partial<CurriculumSettingsData>) : {}
  const extra = { ...(data.extraTopicsByUnit ?? {}) }
  const list = extra[unitKeyStr] ?? []
  extra[unitKeyStr] = [...list, { name: topic.name.trim(), videoId: topic.videoId.trim() }]
  await setDoc(
    ref,
    {
      extraTopicsByUnit: extra,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function removeExtraTopic(unitKeyStr: string, index: number): Promise<void> {
  const ref = doc(db, "curriculum_settings", DOC_ID)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as Partial<CurriculumSettingsData>
  const extra = { ...(data.extraTopicsByUnit ?? {}) }
  const list = [...(extra[unitKeyStr] ?? [])]
  list.splice(index, 1)
  if (list.length === 0) delete extra[unitKeyStr]
  else extra[unitKeyStr] = list
  await setDoc(
    ref,
    {
      extraTopicsByUnit: extra,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
