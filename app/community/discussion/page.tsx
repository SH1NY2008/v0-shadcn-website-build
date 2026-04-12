
'use client'

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopics, onTopicsUpdate, type Topic, deleteTopic } from "@/lib/community";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { CreateTopicButton } from "./CreateTopicButton";

export default function DiscussionPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { userRole } = useTeacherMode();

  useEffect(() => {
    const unsubscribe = onTopicsUpdate((topics) => {
      setTopics(topics);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTopic(deleteTarget);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center animate-pulse">
          <p className="text-[#2C2C2C]/60 font-bold uppercase tracking-widest">Loading discussions…</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
          Discussions
        </h1>
        <CreateTopicButton />
      </div>
      <div className="space-y-8">
        {topics.map((topic) => (
          <Link href={`/community/discussion/${topic.id}`} key={topic.id} className="block">
            <div className="bg-[#FFC971] rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] transition-shadow duration-300">
              <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
                {topic.title}
              </h3>
              <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">
                {topic.description}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Button className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Join Discussion
                </Button>
                {userRole === 'teacher' && (
                  <Button
                    variant="destructive"
                    className="bg-red-600 text-white font-bold text-lg h-12 rounded-xl hover:bg-red-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(topic.id);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
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
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the topic."
      />
    </PageLayout>
  );
}
