
'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStudyGroups, createStudyGroup, type StudyGroup } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { StudyGroupSkeleton } from "@/components/study-group-skeleton";

export default function StudyGroupsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStudyGroups() {
      const groups = await getStudyGroups();
      setStudyGroups(groups);
      setLoading(false);
    }
    fetchStudyGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!user || !newGroupTitle || !newGroupDescription) return;

    await createStudyGroup({ title: newGroupTitle, description: newGroupDescription });
    setNewGroupTitle("");
    setNewGroupDescription("");
    setIsCreateGroupOpen(false);
    const groups = await getStudyGroups();
    setStudyGroups(groups);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
            Study Groups
          </h1>
        </div>
        <StudyGroupSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
          Study Groups
        </h1>
        {user && (
          <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Create New Group</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#FFC971] border-4 border-black">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Create a new study group</DialogTitle>
                <DialogDescription className="text-lg font-bold text-[#2C2C2C]/60">
                  Fill in the details below to create a new study group.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right font-bold text-lg text-[#2C2C2C]">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right font-bold text-lg text-[#2C2C2C]">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateGroup} className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {studyGroups.map((group) => (
          <Link href={`/community/studygroups/${group.id}`} key={group.id}>
            <div className="bg-[#FFC971] rounded-2xl p-8 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-shadow duration-300">
                <div>
                    <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
                        {group.title}
                    </h3>
                    <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">
                        {group.description}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2">
                        <Users className="w-6 h-6 text-[#006B6B]" />
                        <span className="font-bold text-lg text-[#006B6B]">{group.members.length} members</span>
                    </div>
                    <Button className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        View Group
                    </Button>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
