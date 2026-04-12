
'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  subscribeToStudyGroups,
  subscribeToUsersDirectory,
  createStudyGroup,
  deleteStudyGroup,
  sendStudyGroupInvite,
  type StudyGroup,
  type DirectoryListingUser,
} from "@/lib/community";
import { syncPublicProfileFromAuthUser } from "@/lib/user-profile";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { toast } from "sonner";
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
import { Loader2, Mail, Trash2, Users, UserRound } from "lucide-react";
import { StudyGroupSkeleton } from "@/components/study-group-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudyGroupsPage() {
  const { userRole } = useTeacherMode();
  const [user, setUser] = useState<User | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [people, setPeople] = useState<DirectoryListingUser[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteFor, setInviteFor] = useState<DirectoryListingUser | null>(null);
  const [inviteGroupId, setInviteGroupId] = useState<string>("");
  const [sendInviteLoading, setSendInviteLoading] = useState(false);

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
    const unsub = subscribeToStudyGroups((groups) => {
      setStudyGroups(groups);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setPeople([]);
      return;
    }
    const unsub = subscribeToUsersDirectory(user.uid, setPeople);
    return () => unsub();
  }, [user]);

  const myMemberGroupIds = user
    ? studyGroups.filter((g) => g.members.includes(user.uid)).map((g) => g.id)
    : [];

  const handleCreateGroup = async () => {
    if (!user) return;
    if (!newGroupTitle.trim() || !newGroupDescription.trim()) {
      toast.message("Fill in both title and description before creating a group.");
      return;
    }

    await createStudyGroup(
      { title: newGroupTitle, description: newGroupDescription },
      { creatorId: user.uid }
    );
    setNewGroupTitle("");
    setNewGroupDescription("");
    setIsCreateGroupOpen(false);
  };

  const openInvite = (profile: DirectoryListingUser) => {
    if (!user) {
      toast.message("Sign in to invite people to a group.");
      return;
    }
    if (myMemberGroupIds.length === 0) {
      toast.message("Join a study group first, then you can send invites.");
      return;
    }
    setInviteFor(profile);
    setInviteGroupId(myMemberGroupIds[0] ?? "");
    setInviteOpen(true);
  };

  const handleSendInvite = async () => {
    if (!user || !inviteFor || !inviteGroupId) return;
    const fromName =
      user.displayName || user.email?.split("@")[0] || "Someone";
    setSendInviteLoading(true);
    try {
      await sendStudyGroupInvite(
        user.uid,
        fromName,
        inviteFor.uid,
        inviteGroupId
      );
      toast.success(
        `Invite sent to ${inviteFor.displayName}. They’ll see it on their dashboard.`
      );
      setInviteOpen(false);
      setInviteFor(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "DUPLICATE_INVITE") {
        toast.message("A pending invite already exists for this group.");
      } else if (msg === "ALREADY_MEMBER") {
        toast.message("That person is already in this group.");
      } else if (msg === "NOT_A_MEMBER") {
        toast.error("You must be a member of the group to invite others.");
      } else {
        console.error(e);
        toast.error("Could not send invite.");
      }
    } finally {
      setSendInviteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteStudyGroup(deleteTargetId);
      toast.success("Study group deleted.");
      setStudyGroups((prev) => prev.filter((g) => g.id !== deleteTargetId));
    } catch (e) {
      console.error(e);
      toast.error("Could not delete the study group.");
    } finally {
      setDeleteTargetId(null);
    }
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateGroup();
                }}
              >
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
                      required
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
                      required
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="groups" className="w-full gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border-2 border-black/10 bg-white/90 p-2">
          <TabsTrigger
            value="groups"
            className="rounded-lg font-black uppercase data-[state=active]:bg-[#006B6B] data-[state=active]:text-white"
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="rounded-lg font-black uppercase data-[state=active]:bg-[#006B6B] data-[state=active]:text-white"
          >
            <UserRound className="mr-2 h-4 w-4" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          {studyGroups.length === 0 ? (
            <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/80 p-12 text-center">
              <p className="text-xl font-black text-[#2C2C2C]">No study groups yet</p>
              <p className="mt-2 font-bold text-[#2C2C2C]/60">
                {user ? "Create the first group with the button above." : "Sign in to create a study group."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {studyGroups.map((group) => (
                <div key={group.id} className="relative">
                  {userRole === "teacher" && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-3 top-3 z-10 h-10 w-10 rounded-lg border-2 border-black shadow-md"
                      aria-label="Delete study group"
                      onClick={() => setDeleteTargetId(group.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <Link href={`/community/studygroups/${group.id}`} className="block h-full">
                    <div className="flex h-full flex-col justify-between rounded-2xl bg-[#FFC971] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-shadow duration-300 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
                      <div className={userRole === "teacher" ? "pr-12" : undefined}>
                        <h3 className="text-3xl font-black uppercase tracking-tight text-[#2C2C2C]">{group.title}</h3>
                        <p className="mt-2 text-lg font-bold text-[#2C2C2C]/60">{group.description}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-6 w-6 text-[#006B6B]" />
                          <span className="text-lg font-bold text-[#006B6B]">{group.members.length} members</span>
                        </div>
                        <Button className="pointer-events-none h-12 rounded-xl border-2 border-black bg-[#006B6B] text-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          View Group
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          {!user ? (
            <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/80 p-12 text-center">
              <p className="text-xl font-black text-[#2C2C2C]">Sign in to browse people</p>
              <p className="mt-2 font-bold text-[#2C2C2C]/60">
                Everyone else in the app directory is listed here. You can copy an invite link to a group you belong to.
              </p>
              <Button asChild className="mt-6 bg-[#006B6B] font-bold text-white">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          ) : people.length === 0 ? (
            <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/80 p-12 text-center">
              <p className="text-xl font-black text-[#2C2C2C]">No one else in the directory yet</p>
              <p className="mt-2 font-bold text-[#2C2C2C]/60">
                When other accounts exist in Firestore, they show up here (you are not listed).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {people.map((p) => (
                  <Card
                    key={p.uid}
                    className="border-4 border-black/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12 border-2 border-black/10">
                        <AvatarImage src={p.photoURL} alt="" />
                        <AvatarFallback className="font-black">
                          {(p.displayName || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-[#2C2C2C]">{p.displayName}</p>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#2C2C2C]/50">
                          {p.role}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-2 border-black font-bold"
                        onClick={() => openInvite(p)}
                      >
                        Invite
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <ConfirmationDialog
        open={!!deleteTargetId}
        onOpenChange={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this study group?"
        description="This permanently removes the group, its challenges, and group chat. Members will lose access."
      />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="bg-[#FFC971] border-4 border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-[#2C2C2C]">
              Invite to group
            </DialogTitle>
            <DialogDescription className="font-bold text-[#2C2C2C]/70">
              {inviteFor
                ? `We’ll notify ${inviteFor.displayName}. They can accept or decline on their dashboard.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label className="font-bold text-[#2C2C2C]">Your group</Label>
            <Select value={inviteGroupId} onValueChange={setInviteGroupId}>
              <SelectTrigger className="border-2 border-black bg-white font-bold">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {studyGroups
                  .filter((g) => user && g.members.includes(user.uid))
                  .map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={sendInviteLoading || !inviteGroupId}
              onClick={() => void handleSendInvite()}
              className="bg-[#006B6B] text-white font-bold border-2 border-black"
            >
              {sendInviteLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
