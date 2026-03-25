
'use client'

import { useState, useEffect } from 'react'
import { onNotesUpdate, Note } from '@/lib/notebook'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { PageLayout } from '@/components/page-layout'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

export default function NotebookPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        const unsubNotes = onNotesUpdate(user.uid, setNotes)
        return () => unsubNotes()
      }
    })
    return () => unsubscribe()
  }, [])

  const filteredNotes = notes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">My Notebook</h1>
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-8"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{note.content}</p>
                <p className="text-sm text-gray-500 mt-4">
                  {formatDistanceToNow(new Date(note.createdAt?.toDate()), {
                    addSuffix: true,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
