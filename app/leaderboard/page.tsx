
'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserStats } from '@/lib/gamification'

interface LeaderboardEntry extends UserStats {
  id: string
  name: string
  avatar: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const q = query(
      collection(db, 'user_stats'),
      orderBy('xp', 'desc'),
      limit(100)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const entries: LeaderboardEntry[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const userStats = docSnap.data() as UserStats
          const userDoc = await getDoc(doc(db, 'users', docSnap.id))
          const userData = userDoc.data() ?? { displayName: 'Anonymous', photoURL: '' }
          return {
            id: docSnap.id,
            ...userStats,
            name: userData.displayName,
            avatar: userData.photoURL,
          }
        })
      )
      setLeaderboard(entries)
    })

    return () => unsubscribe()
  }, [])

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>
        <Card>
          <CardContent className="p-0">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 border-b last:border-b-0"
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {index + 1}
                </div>
                <Avatar>
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">{entry.name}</p>
                  <p className="text-sm text-gray-500">{entry.xp} XP</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
