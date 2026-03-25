
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageLayout } from "@/components/page-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import videoLessons from '@/app/data/video-lessons.json'

const categories = [...new Set(videoLessons.map(v => v.category))]

export default function VideoLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredVideos = selectedCategory === 'All' 
    ? videoLessons 
    : videoLessons.filter(v => v.category === selectedCategory)

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Video Lesson Library</h1>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map(video => (
            <Link key={video.id} href={`/videos/${video.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                           <p className="text-gray-500">Video Thumbnail</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
