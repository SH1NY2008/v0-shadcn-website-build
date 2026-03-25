
'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPeerReviews, createPeerReview, type PeerReview, type RubricItem } from "@/lib/community";
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
import { Textarea } from "@/components/ui/textarea";
import { PeerReviewSkeleton } from "@/components/peer-review-skeleton";

export default function PeerReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewSubmission, setNewReviewSubmission] = useState("");
  const [rubricItems, setRubricItems] = useState<Omit<RubricItem, 'id'>[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchPeerReviews() {
      const reviews = await getPeerReviews();
      setPeerReviews(reviews);
      setLoading(false);
    }
    fetchPeerReviews();
  }, []);

  const handleAddRubricItem = () => {
    setRubricItems([...rubricItems, { criterion: "", maxScore: 0 }]);
  };

  const handleRubricItemChange = (index: number, field: 'criterion' | 'maxScore', value: string) => {
    const newRubricItems = [...rubricItems];
    if (field === 'maxScore') {
        newRubricItems[index][field] = parseInt(value);
    } else {
        newRubricItems[index][field] = value;
    }
    setRubricItems(newRubricItems);
  };

  const handleCreatePeerReview = async () => {
    if (!user || !newReviewTitle || !newReviewSubmission) return;

    await createPeerReview({
      title: newReviewTitle,
      submission: newReviewSubmission,
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      status: "Pending Review",
    }, rubricItems);

    setNewReviewTitle("");
    setNewReviewSubmission("");
    setRubricItems([]);
    setIsSubmitDialogOpen(false);
    const reviews = await getPeerReviews();
    setPeerReviews(reviews);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
            Peer Review
          </h1>
        </div>
        <PeerReviewSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
        <div className="flex justify-between items-center mb-8 border-b-4 border-black/10 pb-6">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
                Peer Review
            </h1>
            {user && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Submit for Review</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#FFC971] border-4 border-black sm:max-w-[625px]">
                        <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Submit for Peer Review</DialogTitle>
                        <DialogDescription className="text-lg font-bold text-[#2C2C2C]/60">
                            Fill in the details below to submit your work for peer review.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right font-bold text-lg text-[#2C2C2C]">Title</Label>
                                <Input id="title" value={newReviewTitle} onChange={(e) => setNewReviewTitle(e.target.value)} className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="submission" className="text-right font-bold text-lg text-[#2C2C2C]">Submission</Label>
                                <Textarea id="submission" value={newReviewSubmission} onChange={(e) => setNewReviewSubmission(e.target.value)} className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#2C2C2C] mb-2">Rubric</h3>
                                {rubricItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-5 items-center gap-2 mb-2">
                                        <Input placeholder="Criterion" value={item.criterion} onChange={(e) => handleRubricItemChange(index, 'criterion', e.target.value)} className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                                        <Input type="number" placeholder="Max Score" value={item.maxScore} onChange={(e) => handleRubricItemChange(index, 'maxScore', e.target.value)} className="col-span-2 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                                    </div>
                                ))}
                                <Button onClick={handleAddRubricItem} variant="outline" className="w-full border-2 border-black bg-transparent text-black font-bold hover:bg-black/10">Add Rubric Item</Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreatePeerReview} className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Submit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {peerReviews.map((assignment) => (
            <Link href={`/community/peerreview/${assignment.id}`} key={assignment.id}>
                <div className="bg-[#FFC971] rounded-2xl p-8 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-shadow duration-300">
                    <div>
                        <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">
                            {assignment.title}
                        </h3>
                        <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">
                            Author: {assignment.author}
                        </p>
                        <p className="text-lg font-bold text-[#2C2C2C]/60">
                            Status: {assignment.status}
                        </p>
                    </div>
                    <Button className="mt-8 w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Start Review
                    </Button>
                </div>
            </Link>
        ))}
      </div>
    </PageLayout>
  );
}
