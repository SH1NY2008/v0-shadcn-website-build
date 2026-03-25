
'use client'

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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Peer Review</h1>
            {user && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Submit for Review</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                        <DialogTitle>Submit for Peer Review</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to submit your work for peer review.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" value={newReviewTitle} onChange={(e) => setNewReviewTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="submission" className="text-right">Submission</Label>
                                <Textarea id="submission" value={newReviewSubmission} onChange={(e) => setNewReviewSubmission(e.target.value)} className="col-span-3" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">Rubric</h3>
                                {rubricItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-5 items-center gap-2 mb-2">
                                        <Input placeholder="Criterion" value={item.criterion} onChange={(e) => handleRubricItemChange(index, 'criterion', e.target.value)} className="col-span-3" />
                                        <Input type="number" placeholder="Max Score" value={item.maxScore} onChange={(e) => handleRubricItemChange(index, 'maxScore', e.target.value)} className="col-span-2" />
                                    </div>
                                ))}
                                <Button onClick={handleAddRubricItem} variant="outline">Add Rubric Item</Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreatePeerReview}>Submit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {peerReviews.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Author: {assignment.author}</p>
                <p>Status: {assignment.status}</p>
                <Link href={`/community/peerreview/${assignment.id}`}>
                  <Button className="mt-4">Start Review</Button>
                </Link>
              </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
