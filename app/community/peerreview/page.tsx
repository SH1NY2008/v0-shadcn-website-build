
'use client'

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getPeerReviews,
  createPeerReview,
  attachPeerReviewPaper,
  type PeerReview,
} from "@/lib/community";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
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

type RubricDraft = { criterion: string; maxScore: number; file: File | null };

export default function PeerReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewSubmission, setNewReviewSubmission] = useState("");
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rubricItems, setRubricItems] = useState<RubricDraft[]>([]);

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
    setRubricItems([...rubricItems, { criterion: "", maxScore: 0, file: null }]);
  };

  const handleRubricItemChange = (index: number, field: "criterion" | "maxScore", value: string) => {
    const next = [...rubricItems];
    if (field === "maxScore") {
      const n = parseInt(value, 10);
      next[index][field] = Number.isNaN(n) ? 0 : n;
    } else {
      next[index][field] = value;
    }
    setRubricItems(next);
  };

  const handleRubricFileChange = (index: number, file: File | null) => {
    const next = [...rubricItems];
    next[index] = { ...next[index], file };
    setRubricItems(next);
  };

  const handleCreatePeerReview = async () => {
    if (!user) {
      toast.error("Sign in to submit work for review.");
      return;
    }
    if (!newReviewTitle.trim()) {
      toast.error("Please add a title.");
      return;
    }
    const notes = newReviewSubmission.trim();
    if (!paperFile && !notes) {
      toast.error("Upload a paper (PDF, Word, etc.) or paste your submission in the text area.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createPeerReview(
        {
          title: newReviewTitle.trim(),
          submission: notes,
          author: user.displayName || user.email || "Anonymous",
          authorId: user.uid,
          status: "Pending Review",
        },
        rubricItems.map(({ criterion, maxScore }) => ({ criterion, maxScore })),
        rubricItems.map((r) => r.file)
      );
      if (paperFile) {
        await attachPeerReviewPaper(id, paperFile);
      }
      toast.success("Submission posted for peer review.");
      setNewReviewTitle("");
      setNewReviewSubmission("");
      setPaperFile(null);
      setRubricItems([]);
      setIsSubmitDialogOpen(false);
      const reviews = await getPeerReviews();
      setPeerReviews(reviews);
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not submit. If you uploaded a file, confirm Firebase Storage is enabled and rules allow authenticated uploads."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                            Upload your paper and/or add notes. Reviewers can download your file and leave comments with scores.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right font-bold text-lg text-[#2C2C2C]">Title</Label>
                                <Input id="title" value={newReviewTitle} onChange={(e) => setNewReviewTitle(e.target.value)} className="col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="paper" className="text-right font-bold text-lg text-[#2C2C2C] pt-2">Paper file</Label>
                                <div className="col-span-3 space-y-2">
                                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/30 bg-white/80 px-4 py-6 transition hover:bg-white">
                                    <Upload className="mb-2 h-8 w-8 text-[#006B6B]" />
                                    <span className="text-center text-sm font-bold text-[#2C2C2C]">
                                      {paperFile ? paperFile.name : "PDF, Word, or other document"}
                                    </span>
                                    <input
                                      id="paper"
                                      type="file"
                                      className="sr-only"
                                      accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                      onChange={(e) => setPaperFile(e.target.files?.[0] ?? null)}
                                    />
                                  </label>
                                  {paperFile && (
                                    <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => setPaperFile(null)}>
                                      Remove file
                                    </Button>
                                  )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="submission" className="text-right font-bold text-lg text-[#2C2C2C] pt-2">Notes</Label>
                                <div className="col-span-3 space-y-1">
                                  <Textarea
                                    id="submission"
                                    placeholder="Optional: paste text here if you are not uploading a file, or add context for reviewers."
                                    value={newReviewSubmission}
                                    onChange={(e) => setNewReviewSubmission(e.target.value)}
                                    className="min-h-[120px] bg-white border-2 border-black text-black font-bold focus:ring-0"
                                  />
                                  <p className="text-xs font-bold text-[#2C2C2C]/50">Provide a file, notes, or both.</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#2C2C2C] mb-2">Rubric</h3>
                                <p className="text-xs font-bold text-[#2C2C2C]/50 mb-3">
                                  Add criteria and max points, and optionally upload a reference file per row (PDF, Word, etc.).
                                </p>
                                {rubricItems.map((item, index) => (
                                    <div key={index} className="mb-4 rounded-xl border-2 border-black/20 bg-white/40 p-3 space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                          <Input placeholder="Criterion" value={item.criterion} onChange={(e) => handleRubricItemChange(index, "criterion", e.target.value)} className="sm:col-span-3 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                                          <Input type="number" placeholder="Max Score" value={item.maxScore} onChange={(e) => handleRubricItemChange(index, "maxScore", e.target.value)} className="sm:col-span-2 bg-white border-2 border-black text-black font-bold focus:ring-0" />
                                        </div>
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/25 bg-white/90 px-3 py-3 transition hover:bg-white">
                                          <Upload className="mb-1 h-5 w-5 text-[#006B6B]" />
                                          <span className="text-center text-xs font-bold text-[#2C2C2C] truncate max-w-full px-1">
                                            {item.file ? item.file.name : "Optional rubric file"}
                                          </span>
                                          <input
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={(e) => handleRubricFileChange(index, e.target.files?.[0] ?? null)}
                                          />
                                        </label>
                                        {item.file && (
                                          <Button type="button" variant="outline" size="sm" className="font-bold w-full" onClick={() => handleRubricFileChange(index, null)}>
                                            Remove rubric file
                                          </Button>
                                        )}
                                    </div>
                                ))}
                                <Button onClick={handleAddRubricItem} variant="outline" className="w-full border-2 border-black bg-transparent text-black font-bold hover:bg-black/10">Add Rubric Item</Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                              type="button"
                              disabled={isSubmitting}
                              onClick={handleCreatePeerReview}
                              className="w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60"
                            >
                              {isSubmitting ? "Submitting…" : "Submit"}
                            </Button>
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
                        {assignment.paperDownloadUrl && (
                          <p className="mt-2 inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-[#006B6B]">
                            <FileText className="h-4 w-4" /> Paper attached
                          </p>
                        )}
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
