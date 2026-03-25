
'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopics, type Topic } from "@/lib/community";
import { CreateTopicButton } from "./CreateTopicButton";

export default function DiscussionPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      const topics = await getTopics();
      setTopics(topics);
      setLoading(false);
    }
    fetchTopics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
          Discussions
        </h1>
        <CreateTopicButton />
      </div>
      <div className="space-y-6">
        {topics.map((topic) => (
          <Link href={`/community/discussion/${topic.id}`} key={topic.id}>
            <div className="bg-[#FFC971] rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] transition-shadow duration-300">
              <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
                {topic.title}
              </h3>
              <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">
                {topic.description}
              </p>
              <Button className="mt-4 bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Join Discussion
              </Button>
            </div>
          </Link>
        ))}
      </div>
      {topics.length === 0 && (
        <div className="text-center py-12">
          <p className="font-bold text-lg">No topics yet.</p>
          <p className="text-sm text-gray-500">Be the first to create a new topic!</p>
        </div>
      )}
    </PageLayout>
  );
}
