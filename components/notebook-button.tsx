
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { onNotesUpdate, createNote, updateNote, deleteNote, Note } from '@/lib/notebook'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { Book, Plus, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function NotebookButton({ topic }: { topic: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        const unsubNotes = onNotesUpdate(user.uid, (notes) => {
            setNotes(notes)
            if (selectedNote) {
                const updatedSelectedNote = notes.find(n => n.id === selectedNote.id)
                setSelectedNote(updatedSelectedNote || null)
            }
        })
        return () => unsubNotes()
      }
    })
    return () => unsubscribe()
  }, [selectedNote])

  const handleCreateNote = async () => {
    if (user && newNote.trim()) {
      await createNote({ userId: user.uid, topic, content: newNote })
      setNewNote('')
    }
  }

  const handleUpdateNote = async () => {
    if (selectedNote && user && selectedNote.userId === user.uid) {
      await updateNote(selectedNote.id, selectedNote.content)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (user) {
      await deleteNote(noteId)
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Book className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-3/4 flex flex-col">
        <DialogHeader>
          <DialogTitle>Notebook</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          <div className="col-span-1 flex flex-col gap-2 overflow-y-auto pr-2">
            <div className='flex justify-between items-center'>
                <h3 className="text-lg font-bold">Notes for {topic}</h3>
                <Button size='sm' onClick={() => setSelectedNote(null)}><Plus/></Button>
            </div>
            {notes
              .filter((note) => note.topic === topic)
              .map((note) => (
                <div
                  key={note.id}
                  className={`p-2 rounded-lg cursor-pointer ${
                    selectedNote?.id === note.id ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <p className="font-bold truncate">{note.content}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(note.createdAt?.toDate()), { addSuffix: true })}
                  </p>
                </div>
              ))}
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            {selectedNote ? (
              <>
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                  className="flex-1"
                  rows={15}
                />
                <div className="flex justify-end gap-2">
                    <Button onClick={handleUpdateNote}>Save</Button>
                    <Button variant='destructive' onClick={() => handleDeleteNote(selectedNote.id)}><Trash2/></Button>
                </div>
              </>
            ) : (
              <>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Create a new note..."
                  className="flex-1"
                  rows={15}
                />
                <Button onClick={handleCreateNote} className="self-end">Create Note</Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

