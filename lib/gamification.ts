
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserStats {
  xp: number
  streak: number
  lastQuizCompleted: any
  badges: string[]
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const userStatsRef = doc(db, 'user_stats', userId)
  const userStatsSnap = await getDoc(userStatsRef)
  if (userStatsSnap.exists()) {
    return userStatsSnap.data() as UserStats
  } else {
    // Create initial stats if they don't exist
    const initialStats: UserStats = {
      xp: 0,
      streak: 0,
      lastQuizCompleted: null,
      badges: [],
    }
    await setDoc(userStatsRef, initialStats)
    return initialStats
  }
}

export async function awardXP(userId: string, amount: number): Promise<void> {
  const userStatsRef = doc(db, 'user_stats', userId)
  await updateDoc(userStatsRef, { xp: increment(amount) })
}

export async function updateStreak(userId: string): Promise<void> {
  const userStatsRef = doc(db, 'user_stats', userId)
  const userStats = await getUserStats(userId)

  if (userStats) {
    const now = new Date()
    const lastCompletion = userStats.lastQuizCompleted?.toDate()
    let newStreak = userStats.streak

    if (lastCompletion) {
      const diffDays = Math.round(
        (now.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays === 1) {
        newStreak++
      } else if (diffDays > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await updateDoc(userStatsRef, {
      streak: newStreak,
      lastQuizCompleted: serverTimestamp(),
    })
  }
}

export async function awardBadge(
  userId: string,
  badge: string
): Promise<void> {
  const userStatsRef = doc(db, 'user_stats', userId)
  const userStats = await getUserStats(userId)
  if (userStats && !userStats.badges.includes(badge)) {
    await updateDoc(userStatsRef, { badges: [...userStats.badges, badge] })
  }
}
