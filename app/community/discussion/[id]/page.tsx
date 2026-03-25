'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsDown, ThumbsUp, Flag, Trash2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { getTopic, getPosts, createPost, createReply, deletePost, deleteReply, type Topic, type Post, type Reply } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { formatDistanceToNow } from 'date-fns';

const PostItem = ({ post, onReply, onDelete, isReply = false }: { post: Post | Reply, onReply: (id: string) => void, onDelete: () => void, isReply?: boolean }) => {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  const handleUpvote = () => setUpvotes(upvotes + 1);
  const handleDownvote = () => setDownvotes(downvotes + 1);

  return (
    <div className={`flex items-start space-x-3 py-4 ${isReply ? 'ml-12' : ''}`}>
      <Avatar className="w-10 h-10 border-2 border-gray-700">
        <AvatarImage src={post.avatar} />
        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="font-bold text-sm text-gray-100">{post.author}</p>
          <p className="text-xs text-gray-400">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) : ''}
          </p>
        </div>
        <p className="mt-1 text-base text-gray-300">{post.message}</p>
        <div className="flex items-center space-x-4 mt-2 text-xs font-bold">
          <button onClick={handleUpvote} className="flex items-center space-x-1 text-gray-400 hover:text-white">
            <ThumbsUp className="w-4 h-4" />
            <span>{upvotes}</span>
          </button>
          <button onClick={handleDownvote} className="flex items-center space-x-1 text-gray-400 hover:text-white">
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button onClick={() => onReply(post.id)} className="text-gray-400 hover:text-white font-bold">REPLY</button>
          <button onClick={onDelete} className="flex items-center space-x-1 text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DiscussionThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

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
      if (topic) {
        const posts = await getPosts(id);
        setPosts(posts);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleCreatePost = async () => {
    if (!user || !newMessage) return;
    const post: Omit<Post, 'id' | 'createdAt'> = {
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      avatar: user.photoURL || "/avatars/01.png",
      message: newMessage,
      pinned: false,
    };
    await createPost(id, post);
    setNewMessage("");
    const updatedPosts = await getPosts(id);
    setPosts(updatedPosts);
  };

  const handleCreateReply = async (postId: string) => {
    if (!user || !replyMessage) return;
    const reply: Omit<Reply, 'id' | 'createdAt'> = {
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      avatar: user.photoURL || "/avatars/01.png",
      message: replyMessage,
    };
    await createReply(id, postId, reply);
    setReplyMessage("");
    setReplyingTo(null);
    const updatedPosts = await getPosts(id);
    setPosts(updatedPosts);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id, postId);
      const updatedPosts = await getPosts(id);
      setPosts(updatedPosts);
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      await deleteReply(id, postId, replyId);
      const updatedPosts = await getPosts(id);
      setPosts(updatedPosts);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!topic) {
    return <div>Topic not found</div>;
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
          {user && (
            <div className="mb-8 flex items-start space-x-4">
              <Avatar className="w-10 h-10 border-2 border-gray-700">
                <AvatarImage src={user.photoURL || "/avatars/01.png"} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Add to the discussion..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-transparent border-b border-gray-600 rounded-none px-0 text-gray-100 placeholder:text-gray-500 focus:border-white focus-visible:ring-0 text-lg"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleCreatePost} className="bg-[#006B6B] text-white font-bold h-10 rounded-xl hover:bg-[#005555] px-6">Post</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b border-gray-800 last:border-b-0">
                <PostItem post={post} onReply={setReplyingTo} onDelete={() => handleDeletePost(post.id)} />
                {replyingTo === post.id && (
                  <div className="ml-16 py-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10 border-2 border-gray-700">
                        <AvatarImage src={user?.photoURL || "/avatars/01.png"} />
                        <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          placeholder="Write a reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="bg-transparent border-b border-gray-600 rounded-none px-0 text-gray-100 placeholder:text-gray-500 focus:border-white focus-visible:ring-0"
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                           <Button onClick={() => setReplyingTo(null)} variant="ghost" className="text-gray-400 hover:text-white">Cancel</Button>
                           <Button onClick={() => handleCreateReply(post.id)} className="bg-[#006B6B] text-white font-bold h-10 rounded-xl hover:bg-[#005555] px-6">Reply</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {post.replies && post.replies.map((reply) => (
                  <PostItem key={reply.id} post={reply} onReply={setReplyingTo} onDelete={() => handleDeleteReply(post.id, reply.id)} isReply />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
