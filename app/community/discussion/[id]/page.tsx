'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsDown, ThumbsUp, Flag, Trash2, Pin, MessageSquare } from "lucide-react";
import { use, useEffect, useState } from "react";
import { onPostsUpdate, getTopic, createPost, createReply, deletePost, deleteReply, togglePinPost, voteOnPost, voteOnReply, type Topic, type Post, type Reply } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { formatDistanceToNow } from 'date-fns';

function formatPostTime(createdAt: Post['createdAt'] | Reply['createdAt']): string {
  if (!createdAt) return "";
  const c = createdAt as { seconds?: number; toDate?: () => Date };
  if (typeof c.seconds === "number") {
    return formatDistanceToNow(new Date(c.seconds * 1000), { addSuffix: true });
  }
  if (typeof c.toDate === "function") {
    return formatDistanceToNow(c.toDate(), { addSuffix: true });
  }
  if (createdAt instanceof Date) {
    return formatDistanceToNow(createdAt, { addSuffix: true });
  }
  return "";
}
import { useTeacherMode } from "@/context/teacher-mode-context";
import { cn } from "@/lib/utils";
import { DiscussionSkeleton } from "@/components/discussion-skeleton";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import Link from "next/link";

const VoteButton = ({ onClick, voted, count, children }: { onClick: () => void, voted: boolean, count: number, children: React.ReactNode }) => (
  <button onClick={onClick} className={cn(
    "flex items-center space-x-1 text-gray-400 hover:text-white transition-colors",
    voted && "text-indigo-400 hover:text-indigo-300"
  )}>
    {children}
    <span className="font-bold text-xs">{count}</span>
  </button>
);

const PostItem = ({ post, onReply, onDelete, onTogglePin, onVote, isReply = false, userRole, userId }: { post: Post | Reply, onReply: (id: string) => void, onDelete: () => void, onTogglePin: (id: string, pinned: boolean) => void, onVote: (voteType: 'upvote' | 'downvote') => void, isReply?: boolean, userRole: "teacher" | "student" | "parent" | null, userId: string | null }) => {

  const isPost = (p: Post | Reply): p is Post => 'pinned' in p;

  const handleUpvote = () => {
    onVote('upvote');
  };

  const handleDownvote = () => {
    onVote('downvote');
  };

  const upvoted = !!(userId && (post.upvotedBy || []).includes(userId));
  const downvoted = !!(userId && (post.downvotedBy || []).includes(userId));

  const PinnedComponent = () => (
    <div className="absolute -left-4 -top-3">
        <div className="relative">
            <Pin className="w-8 h-8 text-yellow-400 fill-yellow-500/20" />
        </div>
    </div>
  );

  const postBaseClasses = "transition-all duration-300 ease-in-out relative";
  const postBorderStyle = isPost(post) && post.pinned ? "border-2 border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.3)]" : "border border-gray-800";
  const postBgColor = isPost(post) && post.pinned ? "bg-gray-800/20" : "bg-gray-800/50";

  return (
    <div className={cn(postBaseClasses, isReply ? 'ml-12' : 'ml-0', postBorderStyle, postBgColor, 'rounded-xl p-4')}>
      {isPost(post) && post.pinned && <PinnedComponent />}
      <div className={`flex items-start space-x-4`}>
          <Avatar className="w-10 h-10 border-2 border-gray-700 shadow-md">
              <AvatarImage src={post.avatar} />
              <AvatarFallback>{(post.author || "?").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
              <div className="flex items-center space-x-2">
                  <p className="font-bold text-base text-white">{post.author}</p>
                  <p className="text-xs text-gray-400">• {formatPostTime(post.createdAt)}</p>
              </div>
              <p className="mt-2 text-base text-gray-300">{post.message}</p>
              <div className="flex items-center space-x-4 mt-3 text-xs font-bold">
                  <VoteButton onClick={handleUpvote} voted={upvoted} count={post.upvotes ?? 0}>
                      <ThumbsUp className="w-4 h-4" />
                  </VoteButton>
                  <VoteButton onClick={handleDownvote} voted={downvoted} count={post.downvotes ?? 0}>
                      <ThumbsDown className="w-4 h-4" />
                  </VoteButton>

                  <button onClick={() => onReply(post.id)} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-bold text-xs">REPLY</span>
                  </button>

                  {userRole === 'teacher' && isPost(post) && (
                      <button onClick={() => onTogglePin(post.id, post.pinned)} className="flex items-center space-x-1 text-gray-400 hover:text-yellow-400 transition-colors">
                          <Pin className="w-4 h-4" />
                          <span className="font-bold text-xs">{post.pinned ? 'UNPIN' : 'PIN'}</span>
                      </button>
                  )}
                  {userId === post.authorId && (
                    <button onClick={onDelete} className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span className="font-bold text-xs">DELETE</span>
                    </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default function DiscussionThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const { userRole } = useTeacherMode();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{postId: string, replyId?: string} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const topic = await getTopic(id);
      setTopic(topic);
      setLoading(false);
    }
    fetchData();

    const unsubscribe = onPostsUpdate(id, (posts) => {
      setPosts(posts);
    });

    return () => unsubscribe();
  }, [id]);

  const handleCreatePost = async () => {
    if (!user || !newMessage) return;
    const post: Omit<Post, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'upvotedBy' | 'downvotedBy' | 'replies'> = {
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      avatar: user.photoURL || "/avatars/01.png",
      message: newMessage,
      pinned: false,
    };
    await createPost(id, post);
    setNewMessage("");
  };

  const handleCreateReply = async (postId: string) => {
    if (!user || !replyMessage) return;
    const reply: Omit<Reply, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'upvotedBy' | 'downvotedBy'> = {
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      avatar: user.photoURL || "/avatars/01.png",
      message: replyMessage,
    };
    await createReply(id, postId, reply);
    setReplyMessage("");
    setReplyingTo(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.replyId) {
      await deleteReply(id, deleteTarget.postId, deleteTarget.replyId);
    } else {
      await deletePost(id, deleteTarget.postId);
    }
    setDeleteTarget(null);
  };

  const handleTogglePin = async (postId: string, pinned: boolean) => {
    await togglePinPost(id, postId, pinned);
  };

  const handleVote = async (postId: string, replyId: string | null, voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    if (replyId) {
      await voteOnReply(id, postId, replyId, user.uid, voteType);
    } else {
      await voteOnPost(id, postId, user.uid, voteType);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-b-2xl">
          <div className="max-w-4xl mx-auto">
            <DiscussionSkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!topic) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-2xl font-black text-[#2C2C2C]">Topic not found</p>
          <Button asChild className="mt-6 bg-[#006B6B] text-white font-bold">
            <Link href="/community/discussion">Back to discussions</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-[#FFC971] p-8 md:p-12 rounded-t-2xl">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
          {topic.title}
        </h1>
        <p className="text-xl md:text-3xl font-bold text-[#2C2C2C]/60 max-w-2xl leading-tight">
          {topic.description}
        </p>
      </div>

      <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-b-2xl">
        <div className="max-w-4xl mx-auto">
          {!user && (
            <div className="mb-8 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-bold text-amber-100">
              <Link href="/login" className="text-amber-300 underline underline-offset-2">
                Sign in
              </Link>{" "}
              to post and reply in this thread.
            </div>
          )}
          {user && (
            <div className="mb-8 flex items-start space-x-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
              <Avatar className="w-12 h-12 border-2 border-gray-600 shadow-lg">
                <AvatarImage src={user.photoURL || "/avatars/01.png"} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Add to the discussion..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 rounded-none px-0 text-gray-100 placeholder:text-gray-500 focus:border-white focus-visible:ring-0 text-lg resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleCreatePost} disabled={!newMessage.trim()} className="bg-indigo-500 text-white font-bold h-10 rounded-xl hover:bg-indigo-600 px-6 disabled:bg-gray-500 disabled:cursor-not-allowed">Post</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="last:border-b-0">
                <PostItem post={post} onReply={setReplyingTo} onDelete={() => setDeleteTarget({postId: post.id})} onTogglePin={handleTogglePin} userRole={userRole} onVote={(voteType) => handleVote(post.id, null, voteType)} userId={user?.uid || null} />
                {replyingTo === post.id && (
                  <div className="ml-16 py-4">
                    <div className="flex items-start space-x-4">
                       <Avatar className="w-10 h-10 border-2 border-gray-700">
                         <AvatarImage src={user?.photoURL || "/avatars/01.png"} />
                         <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1">
                         <textarea
                           placeholder="Write a reply..."
                           value={replyMessage}
                           onChange={(e) => setReplyMessage(e.target.value)}
                           className="w-full bg-transparent border-b border-gray-600 rounded-none px-0 text-gray-100 placeholder:text-gray-500 focus:border-white focus-visible:ring-0 resize-none"
                           rows={2}
                         />
                         <div className="flex justify-end mt-2 space-x-2">
                            <Button onClick={() => setReplyingTo(null)} variant="ghost" className="text-gray-400 hover:text-white">Cancel</Button>
                            <Button onClick={() => handleCreateReply(post.id)} disabled={!replyMessage.trim()} className="bg-indigo-500 text-white font-bold h-10 rounded-xl hover:bg-indigo-600 px-6 disabled:bg-gray-500 disabled:cursor-not-allowed">Reply</Button>
                         </div>
                       </div>
                     </div>
                  </div>
                )}
                {post.replies && (
                  <div className="mt-6 space-y-6">
                    {post.replies.map((reply) => (
                      <PostItem key={reply.id} post={reply} onReply={setReplyingTo} onDelete={() => setDeleteTarget({postId: post.id, replyId: reply.id})} isReply userRole={userRole} onTogglePin={handleTogglePin} onVote={(voteType) => handleVote(post.id, reply.id, voteType)} userId={user?.uid || null} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmationDialog 
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the post or reply."
      />
    </PageLayout>
  );
}
