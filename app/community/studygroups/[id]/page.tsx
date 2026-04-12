
'use client'

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  getStudyGroup,
  getStudyGroupMembers,
  getStudyGroupChallenges,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
  subscribeToStudyGroupMessages,
  sendStudyGroupMessage,
  deleteStudyGroupMessage,
  MAX_GROUP_MESSAGE_LENGTH,
  type StudyGroup,
  type Member,
  type Challenge,
  type GroupMessage,
} from "@/lib/community";
import { syncPublicProfileFromAuthUser } from "@/lib/user-profile";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";

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
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    syncPublicProfileFromAuthUser(user).catch(() => undefined);
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const group = await getStudyGroup(id);
      setStudyGroup(group);
      if (group) {
        const groupMembers = await getStudyGroupMembers(id);
        setMembers(groupMembers);
        const groupChallenges = await getStudyGroupChallenges(id);
        setChallenges(groupChallenges);
      } else {
        setMembers([]);
        setChallenges([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const isMember = !!(user && studyGroup && studyGroup.members.includes(user.uid));

  useEffect(() => {
    if (!user || !studyGroup || !isMember) {
      setMessages([]);
      return;
    }
    const unsub = subscribeToStudyGroupMessages(id, setMessages);
    return () => unsub();
  }, [id, user, studyGroup, isMember]);

  const memberNameById = useMemo(() => {
    const m = new Map<string, string>();
    members.forEach((mem) => m.set(mem.id, mem.name));
    return m;
  }, [members]);

  const handleJoinGroup = async () => {
    if (!user) return;
    await joinStudyGroup(id, user.uid);
    const updated = await getStudyGroup(id);
    if (updated) setStudyGroup(updated);
    const updatedMembers = await getStudyGroupMembers(id);
    setMembers(updatedMembers);
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    await leaveStudyGroup(id, user.uid);
    const updated = await getStudyGroup(id);
    if (updated) setStudyGroup(updated);
    const updatedMembers = await getStudyGroupMembers(id);
    setMembers(updatedMembers);
  };

  const handleSendMessage = async () => {
    if (!user || !isMember) return;
    const text = draft.trim();
    if (!text || text.length > MAX_GROUP_MESSAGE_LENGTH) return;
    setSending(true);
    try {
      await sendStudyGroupMessage(id, user.uid, text);
      setDraft("");
    } catch (e) {
      console.error(e);
      toast.error("Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteStudyGroupMessage(id, messageId);
    } catch (e) {
      console.error(e);
      toast.error("Could not delete message.");
    }
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
        description="This permanently removes the group, its challenges, and group chat. Members will lose access."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <Card className="border-4 border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <MessageCircle className="h-5 w-5 text-[#006B6B]" />
              <CardTitle className="font-black uppercase text-[#2C2C2C]">Group chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <p className="font-bold text-[#2C2C2C]/60">
                  <Link href="/login" className="text-[#006B6B] underline">
                    Sign in
                  </Link>{" "}
                  to participate in group chat.
                </p>
              ) : !isMember ? (
                <p className="font-bold text-[#2C2C2C]/60">
                  Join this study group to read and send messages. Only members can see chat.
                </p>
              ) : (
                <>
                  <div className="max-h-[min(420px,50vh)] space-y-3 overflow-y-auto rounded-lg border-2 border-black/10 bg-white/80 p-3">
                    {messages.length === 0 ? (
                      <p className="text-center font-bold text-[#2C2C2C]/50">
                        No messages yet. Say hello!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const time =
                          msg.createdAt instanceof Timestamp
                            ? msg.createdAt.toDate().toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "";
                        const label = memberNameById.get(msg.authorId) ?? "Member";
                        const own = user.uid === msg.authorId;
                        return (
                          <div
                            key={msg.id}
                            className="flex gap-4 rounded-lg border border-black/5 bg-[#FFC971]/40 p-3"
                          >
                            <Avatar className="h-9 w-9 shrink-0 border-2 border-black/10">
                              <AvatarFallback className="text-xs font-black">
                                {label.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="font-black text-[#2C2C2C]">{label}</span>
                                <span className="text-xs font-bold text-[#2C2C2C]/40">{time}</span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap break-words font-bold text-[#2C2C2C]/90">
                                {msg.text}
                              </p>
                            </div>
                            {own && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-[#2C2C2C]/40 hover:text-destructive"
                                aria-label="Delete message"
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder={`Message (${MAX_GROUP_MESSAGE_LENGTH} characters max, text only)`}
                      value={draft}
                      onChange={(e) =>
                        setDraft(e.target.value.slice(0, MAX_GROUP_MESSAGE_LENGTH))
                      }
                      rows={3}
                      className="resize-none border-2 border-black font-bold"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!draft.trim()) {
                            toast.message("Type a message before sending.");
                            return;
                          }
                          void handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2C2C2C]/40">
                        {draft.length}/{MAX_GROUP_MESSAGE_LENGTH}
                      </span>
                      <Button
                        type="button"
                        disabled={sending || !draft.trim()}
                        onClick={() => void handleSendMessage()}
                        className="bg-[#006B6B] font-bold text-white"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

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
