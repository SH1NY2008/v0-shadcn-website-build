
'use client'

import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getPeerReview, getRubric, getReviews, createReview, type PeerReview, type RubricItem, type Review } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function PeerReviewSessionPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [peerReview, setPeerReview] = useState<PeerReview | null>(null);
  const [rubric, setRubric] = useState<RubricItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReviewFeedback, setNewReviewFeedback] = useState("");
  const [newReviewScores, setNewReviewScores] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const review = await getPeerReview(params.id);
      setPeerReview(review);
      if (review) {
        const rubricItems = await getRubric(params.id);
        setRubric(rubricItems);
        const reviewItems = await getReviews(params.id);
        setReviews(reviewItems);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleScoreChange = (rubricItemId: string, score: number) => {
    setNewReviewScores({ ...newReviewScores, [rubricItemId]: score });
  };

  const handleCreateReview = async () => {
    if (!user || !newReviewFeedback) return;

    await createReview(params.id, {
      reviewerId: user.uid,
      feedback: newReviewFeedback,
      scores: newReviewScores,
    });

    setNewReviewFeedback("");
    setNewReviewScores({});
    const reviewItems = await getReviews(params.id);
    setReviews(reviewItems);
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with a skeleton loader later
  }

  if (!peerReview) {
    return <div>Peer review not found</div>;
  }

  const canReview = user && user.uid !== peerReview.authorId;

  return (
    <PageLayout>
      <div className="mb-8 pb-6 border-b-4 border-black/10">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
            {peerReview.title}
        </h1>
        <p className="text-xl font-bold text-[#2C2C2C]/60 mt-4">Authored by {peerReview.author}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Submission</h2>
                <div className="mt-4 p-6 bg-white rounded-lg border-2 border-black">
                    <p className="text-lg text-black/80 whitespace-pre-wrap">{peerReview.submission}</p>
                </div>
            </div>

            {canReview && (
                <div>
                    <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Write a Review</h2>
                    <div className="mt-4 p-6 bg-[#FFC971] rounded-2xl border-4 border-black">
                        {rubric.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 items-center gap-4 mb-4">
                            <p className="font-bold text-lg text-[#2C2C2C]">{item.criterion}</p>
                            <Input
                                type="number"
                                max={item.maxScore}
                                min={0}
                                placeholder={`Score (0-${item.maxScore})`}
                                onChange={(e) => handleScoreChange(item.id, parseInt(e.target.value))}
                                className="bg-white border-2 border-black text-black font-bold focus:ring-0"
                            />
                        </div>
                        ))}
                        <Textarea
                            placeholder="Provide feedback..."
                            className="mt-4 bg-white border-2 border-black text-black font-bold focus:ring-0"
                            value={newReviewFeedback}
                            onChange={(e) => setNewReviewFeedback(e.target.value)}
                        />
                        <Button className="mt-4 w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={handleCreateReview}>Submit Review</Button>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Reviews</h2>
                <div className="mt-4 space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-6 bg-white rounded-lg border-2 border-black">
                            <p className="text-lg text-black/80 whitespace-pre-wrap">{review.feedback}</p>
                            <Separator className="my-4 bg-black/10" />
                            <div className="space-y-2">
                                {rubric.map((item) => (
                                    <p key={item.id} className="font-bold text-md text-[#2C2C2C]"><span className="font-black">{item.criterion}:</span> {review.scores[item.id] || 0}/{item.maxScore}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Rubric</h2>
                <div className="mt-4 p-6 bg-[#FFC971] rounded-2xl border-4 border-black space-y-4">
                    {rubric.map((item) => (
                        <div key={item.id}>
                        <p className="text-xl font-black text-[#2C2C2C]">{item.criterion}</p>
                        <p className="text-lg font-bold text-[#2C2C2C]/60">Max score: {item.maxScore}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
