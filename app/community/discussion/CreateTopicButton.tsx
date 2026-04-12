'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTopic } from "@/lib/community";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Link from "next/link";
import { toast } from "sonner";

export function CreateTopicButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to create a topic.");
      return;
    }
    try {
      await createTopic({ title, description });
      setIsOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Topic created.");
    } catch (err) {
      console.error(err);
      toast.error("Could not create topic. Check Firestore rules and try again.");
    }
  };

  if (!user) {
    return (
      <Button asChild className="bg-[#006B6B] font-bold text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Link href="/login">Sign in to create a topic</Link>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#006B6B] font-bold text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">New Topic</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
