
'use client'

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getStudyGroup,
  getStudyGroupMembers,
  getStudyGroupChallenges,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
  type StudyGroup,
  type Member,
  type Challenge,
} from "@/lib/community";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function StudyGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userRole } = useTeacherMode();
  const [user, setUser] = useState<User | null>(null);
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const group = await getStudyGroup(id);
      setStudyGroup(group);
      if (group) {
        const groupMembers = await getStudyGroupMembers(id);
        setMembers(groupMembers);
        const groupChallenges = await getStudyGroupChallenges(id);
        setChallenges(groupChallenges);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleJoinGroup = async () => {
    if (!user) return;
    await joinStudyGroup(id, user.uid);
    const updatedMembers = await getStudyGroupMembers(id);
    setMembers(updatedMembers);
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    await leaveStudyGroup(id, user.uid);
    const updatedMembers = await getStudyGroupMembers(id);
    setMembers(updatedMembers);
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteStudyGroup(id);
      toast.success("Study group deleted.");
      router.push("/community/studygroups");
    } catch (e) {
      console.error(e);
      toast.error("Could not delete the study group.");
    } finally {
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center animate-pulse">
          <p className="text-[#2C2C2C]/60 font-bold uppercase tracking-widest">Loading study group…</p>
        </div>
      </PageLayout>
    );
  }

  if (!studyGroup) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-2xl font-black text-[#2C2C2C]">{`Study group not found`}</p>
          <Button asChild className="mt-6 bg-[#006B6B] text-white font-bold">
            <Link href="/community/studygroups">Back to study groups</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isMember = !!(user && studyGroup.members.includes(user.uid));

  return (
    <PageLayout>
      <Link
        href="/community/studygroups"
        className="inline-flex items-center text-sm font-bold text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors mb-6 uppercase tracking-wide"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to study groups
      </Link>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-10 border-b-4 border-black/10 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#2C2C2C] md:text-5xl">
            {studyGroup.title}
          </h1>
          <p className="mt-2 text-lg font-bold text-[#2C2C2C]/70">{studyGroup.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {userRole === "teacher" && (
            <Button
              type="button"
              variant="destructive"
              className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete group
            </Button>
          )}
          {user &&
            (isMember ? (
              <Button
                onClick={handleLeaveGroup}
                variant="outline"
                className="border-2 border-black/10 bg-white font-bold"
              >
                Leave group
              </Button>
            ) : (
              <Button
                onClick={handleJoinGroup}
                className="bg-[#006B6B] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
              >
                Join group
              </Button>
            ))}
        </div>
      </div>
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteGroup}
        title="Delete this study group?"
        description="This permanently removes the group and its challenges. Members will lose access."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <CardHeader>
              <CardTitle className="font-black uppercase text-[#2C2C2C]">Group challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.length === 0 ? (
                <p className="font-bold text-[#2C2C2C]/60">No challenges yet.</p>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge.id}>
                    <p className="font-bold text-[#2C2C2C]">{challenge.title}</p>
                    <Progress value={challenge.progress} className="mt-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <CardHeader>
              <CardTitle className="font-black uppercase text-[#2C2C2C]">Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length === 0 ? (
                <p className="font-bold text-[#2C2C2C]/60">No members yet. Be the first to join.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4">
                    <Avatar className="border-2 border-black/10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{(member.name || "?").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-[#2C2C2C]">{member.name}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
