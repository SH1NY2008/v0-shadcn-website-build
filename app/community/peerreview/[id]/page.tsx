
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getPeerReview, getRubric, getReviews, createReview, type PeerReview, type RubricItem, type Review } from "@/lib/community";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Input } from "@/components/ui/input";

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
    return <div>Loading...</div>;
  }

  if (!peerReview) {
    return <div>Peer review not found</div>;
  }

  const canReview = user && user.uid !== peerReview.authorId;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-2">{peerReview.title}</h1>
      <p className="text-lg text-gray-500 mb-8">Authored by {peerReview.author}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{peerReview.submission}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rubric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rubric.map((item) => (
                <div key={item.id} className="space-y-2">
                  <p className="font-bold">{item.criterion}</p>
                  <p className="text-sm text-gray-500">Max score: {item.maxScore}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {canReview && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {rubric.map((item) => (
              <div key={item.id} className="grid grid-cols-2 items-center gap-4 mb-4">
                <p>{item.criterion}</p>
                <Input
                  type="number"
                  max={item.maxScore}
                  min={0}
                  placeholder={`Score (0-${item.maxScore})`}
                  onChange={(e) => handleScoreChange(item.id, parseInt(e.target.value))}
                />
              </div>
            ))}
            <Textarea
              placeholder="Provide feedback..."
              className="mt-4"
              value={newReviewFeedback}
              onChange={(e) => setNewReviewFeedback(e.target.value)}
            />
            <Button className="mt-4" onClick={handleCreateReview}>Submit Review</Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-4">Reviews</h2>
        {reviews.map((review) => (
            <Card key={review.id} className="mb-4">
                <CardContent className="pt-6">
                    <p>{review.feedback}</p>
                    <div className="mt-4">
                        {rubric.map((item) => (
                            <p key={item.id}><span className="font-bold">{item.criterion}:</span> {review.scores[item.id] || 0}/{item.maxScore}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
