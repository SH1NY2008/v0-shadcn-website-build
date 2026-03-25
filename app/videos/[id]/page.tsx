
'use client'

import { useParams } from 'next/navigation'
import { PageLayout } from "@/components/page-layout"
import videoLessons from '@/app/data/video-lessons.json'

export default function VideoPage() {
  const params = useParams()
  const videoId = params.id as string

  const video = videoLessons.find(v => v.id === videoId)

  if (!video) {
    return <PageLayout>Video not found.</PageLayout>
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{video.title}</h1>
        <p className="text-gray-500 mb-8">{video.description}</p>
        <div className="aspect-video">
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${video.videoId}`} 
                title={video.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        </div>
      </div>
    </PageLayout>
  )
}
