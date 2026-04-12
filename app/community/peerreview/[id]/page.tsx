
'use client'

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { use, useEffect, useState } from "react";
import {
  createReview,
  deletePeerReview,
  peerReviewPaperDisplayUrl,
  rubricAttachmentDisplayUrl,
  subscribeToPeerReviewComments,
  type PeerReview,
  type RubricItem,
  type Review,
} from "@/lib/community";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, Trash2, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

function isImageSubmission(pr: PeerReview): boolean {
  const ext = pr.paperExternalUrl?.trim();
  if (ext && /\.(png|jpe?g|gif|webp|bmp|svg|heic|avif)(\?|#|$)/i.test(ext)) return true;
  const t = pr.paperContentType || "";
  if (t.startsWith("image/")) return true;
  const n = (pr.paperFileName || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|avif)$/i.test(n);
}

function isPdfSubmission(pr: PeerReview): boolean {
  const t = pr.paperContentType || "";
  if (t.includes("pdf")) return true;
  if ((pr.paperFileName || "").toLowerCase().endsWith(".pdf")) return true;
  const ext = pr.paperExternalUrl?.trim();
  return !!ext && /\.pdf(\?|#|$)/i.test(ext);
}

export default function PeerReviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [peerReview, setPeerReview] = useState<PeerReview | null>(null);
  const [rubric, setRubric] = useState<RubricItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReviewFeedback, setNewReviewFeedback] = useState("");
  const [newReviewScores, setNewReviewScores] = useState<{ [key: string]: number }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { userRole, isRoleResolved } = useTeacherMode();
  const isTeacher = isRoleResolved && userRole === "teacher";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ref = doc(db, "peer-reviews", id);
    const unsubDoc = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setPeerReview({ id: snap.id, ...snap.data() } as PeerReview);
        } else {
          setPeerReview(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("peer review snapshot:", err);
        setLoading(false);
      }
    );
    const rubricCol = collection(db, "peer-reviews", id, "rubric");
    const unsubRubric = onSnapshot(
      rubricCol,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RubricItem));
        setRubric(list);
      },
      (err) => console.error("rubric snapshot:", err)
    );
    return () => {
      unsubDoc();
      unsubRubric();
    };
  }, [id]);

  useEffect(() => {
    const unsub = subscribeToPeerReviewComments(id, setReviews);
    return () => unsub();
  }, [id]);

  const handleScoreChange = (rubricItemId: string, raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) {
      const next = { ...newReviewScores };
      delete next[rubricItemId];
      setNewReviewScores(next);
      return;
    }
    setNewReviewScores({ ...newReviewScores, [rubricItemId]: n });
  };

  const handleCreateReview = async () => {
    if (!user || !newReviewFeedback.trim()) return;

    await createReview(id, {
      reviewerId: user.uid,
      reviewerName: user.displayName || user.email || "Reviewer",
      feedback: newReviewFeedback.trim(),
      scores: newReviewScores,
    });

    setNewReviewFeedback("");
    setNewReviewScores({});
  };

  const handleDeletePeerReview = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePeerReview(id);
      toast.success("Peer review deleted.");
      router.push("/community/peerreview");
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not delete. Ensure your Firebase rules allow teachers to delete peer-reviews documents and storage objects."
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  function reviewTimestamp(review: Review): string {
    const c = review.createdAt as { seconds?: number; toDate?: () => Date } | undefined;
    if (!c) return "";
    const d =
      typeof c.toDate === "function"
        ? c.toDate()
        : c.seconds != null
          ? new Date(c.seconds * 1000)
          : null;
    if (!d) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center animate-pulse">
          <p className="text-[#2C2C2C]/60 font-bold uppercase tracking-widest">Loading peer review…</p>
        </div>
      </PageLayout>
    );
  }

  if (!peerReview) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-2xl font-black text-[#2C2C2C]">{`Peer review not found`}</p>
        </div>
      </PageLayout>
    );
  }

  const canReview = user && user.uid !== peerReview.authorId;
  const paperUrl = peerReviewPaperDisplayUrl(peerReview);

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col gap-4 border-b-4 border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
            {peerReview.title}
          </h1>
          <p className="mt-4 text-xl font-bold text-[#2C2C2C]/60">Authored by {peerReview.author}</p>
        </div>
        {isTeacher && (
          <Button
            type="button"
            variant="destructive"
            className="shrink-0 gap-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteDialogOpen(open);
        }}
        onConfirm={handleDeletePeerReview}
        title="Delete this peer review?"
        description="This permanently removes the submission, rubric, all reviews, and uploaded files. This cannot be undone."
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Submission</h2>
                {paperUrl && isImageSubmission(peerReview) && (
                  <div className="mt-4 overflow-hidden rounded-xl border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paperUrl}
                      alt={peerReview.paperFileName || "Submitted image"}
                      className="mx-auto max-h-[min(75vh,900px)] w-auto max-w-full object-contain"
                    />
                  </div>
                )}
                {paperUrl && isPdfSubmission(peerReview) && (
                  <div className="mt-4 h-[min(70vh,720px)] w-full overflow-hidden rounded-xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]">
                    <iframe
                      title="PDF submission"
                      src={paperUrl}
                      className="h-full min-h-[480px] w-full"
                    />
                  </div>
                )}
                {paperUrl && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border-2 border-black bg-white p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Download className="h-6 w-6 shrink-0 text-[#006B6B]" />
                      <div className="min-w-0">
                        <p className="font-black text-[#2C2C2C]">File</p>
                        <p className="truncate text-sm font-bold text-[#2C2C2C]/60">
                          {peerReview.paperFileName || "Open file"}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="shrink-0 bg-[#006B6B] font-bold text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
                      asChild
                    >
                      <a href={paperUrl} target="_blank" rel="noopener noreferrer">
                        Open / download
                      </a>
                    </Button>
                  </div>
                )}
                {peerReview.submission?.trim() ? (
                  <div className="mt-4 p-6 bg-white rounded-lg border-2 border-black">
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#2C2C2C]/50">Notes</p>
                    <p className="text-lg text-black/80 whitespace-pre-wrap">{peerReview.submission}</p>
                  </div>
                ) : !paperUrl ? (
                  <div className="mt-4 rounded-lg border-2 border-dashed border-black/20 bg-white/50 p-6 text-center font-bold text-[#2C2C2C]/60">
                    No text or file on this submission.
                  </div>
                ) : null}
            </div>

            {canReview && (
                <div>
                    <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Write a Review</h2>
                    <div className="mt-4 p-6 bg-[#FFC971] rounded-2xl border-4 border-black">
                        {rubric.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 items-start gap-4 mb-4">
                            <div>
                              <p className="font-bold text-lg text-[#2C2C2C]">{item.criterion}</p>
                              {rubricAttachmentDisplayUrl(item) && (
                                <a
                                  href={rubricAttachmentDisplayUrl(item)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-[#006B6B] hover:underline"
                                >
                                  <Download className="h-4 w-4 shrink-0" />
                                  {item.attachmentFileName || "Rubric file"}
                                </a>
                              )}
                            </div>
                            <Input
                                type="number"
                                max={item.maxScore}
                                min={0}
                                placeholder={`Score (0-${item.maxScore})`}
                                onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                className="bg-white border-2 border-black text-black font-bold focus:ring-0"
                            />
                        </div>
                        ))}
                        <Textarea
                            placeholder="Comments and feedback for the author…"
                            className="mt-4 min-h-[140px] bg-white border-2 border-black text-black font-bold focus:ring-0"
                            value={newReviewFeedback}
                            onChange={(e) => setNewReviewFeedback(e.target.value)}
                        />
                        <Button
                          className="mt-4 w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          onClick={handleCreateReview}
                          disabled={!newReviewFeedback.trim()}
                        >
                          Submit review
                        </Button>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Reviews</h2>
                <div className="mt-4 space-y-6">
                    {reviews.length === 0 && (
                      <p className="rounded-lg border-2 border-dashed border-black/15 bg-white/60 p-6 text-center font-bold text-[#2C2C2C]/60">
                        No reviews yet. Share this page with a classmate so they can download your paper and leave feedback.
                      </p>
                    )}
                    {reviews.map((review) => {
                      const ts = reviewTimestamp(review);
                      return (
                        <div key={review.id} className="p-6 bg-white rounded-lg border-2 border-black">
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-[#2C2C2C]/70">
                              <UserIcon className="h-4 w-4 text-[#006B6B]" />
                              <span>{review.reviewerName || "Reviewer"}</span>
                              {ts ? <span className="text-[#2C2C2C]/50">· {ts}</span> : null}
                            </div>
                            <p className="text-lg text-black/80 whitespace-pre-wrap">{review.feedback}</p>
                            <Separator className="my-4 bg-black/10" />
                            <div className="space-y-2">
                                {rubric.map((item) => (
                                    <p key={item.id} className="font-bold text-md text-[#2C2C2C]"><span className="font-black">{item.criterion}:</span> {review.scores[item.id] || 0}/{item.maxScore}</p>
                                ))}
                            </div>
                        </div>
                      );
                    })}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black text-[#2C2C2C] uppercase tracking-tight">Rubric</h2>
                <div className="mt-4 p-6 bg-[#FFC971] rounded-2xl border-4 border-black space-y-4">
                    {rubric.length === 0 && (
                      <p className="text-sm font-bold text-[#2C2C2C]/60">
                        No rubric rows were added for this submission.
                      </p>
                    )}
                    {rubric.map((item) => (
                        <div key={item.id}>
                        <p className="text-xl font-black text-[#2C2C2C]">{item.criterion}</p>
                        <p className="text-lg font-bold text-[#2C2C2C]/60">Max score: {item.maxScore}</p>
                        {rubricAttachmentDisplayUrl(item) && (
                          <Button
                            className="mt-2 w-full bg-white font-bold text-[#006B6B] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)]"
                            variant="outline"
                            asChild
                          >
                            <a href={rubricAttachmentDisplayUrl(item)!} target="_blank" rel="noopener noreferrer" download>
                              Download rubric file
                            </a>
                          </Button>
                        )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
