
'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getUserStats, UserStats } from '@/lib/gamification'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        getUserStats(user.uid).then(setStats)
      }
    })
    return () => unsubscribe()
  }, [])

  if (!user || !stats) {
    return <PageLayout>Loading...</PageLayout>
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || ''} />
            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold">{user.displayName}</h1>
            <p className="text-xl text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>XP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.xp}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.streak} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stats.badges.length > 0 ? (
                stats.badges.map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))
              ) : (
                <p>No badges yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
