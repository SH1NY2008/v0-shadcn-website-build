
'use client'

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  subscribeToPeerReviews,
  createPeerReview,
  deletePeerReview,
  peerReviewHasPaperAttachment,
  MAX_PEER_REVIEW_INLINE_BYTES,
  type PeerReview,
} from "@/lib/community";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { useTeacherMode } from "@/context/teacher-mode-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
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
  const [paperExternalUrl, setPaperExternalUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rubricItems, setRubricItems] = useState<RubricDraft[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteIdRef = useRef<string | null>(null);
  const { userRole, isRoleResolved } = useTeacherMode();
  const isTeacher = isRoleResolved && userRole === "teacher";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = subscribeToPeerReviews((reviews) => {
      setPeerReviews(reviews);
      setLoading(false);
    });
    return () => unsub();
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
    const external = paperExternalUrl.trim();
    if (!paperFile && !notes && !external) {
      toast.error("Add a file (under 450KB), paste a link to your file, or add notes in the text area.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPeerReview(
        {
          title: newReviewTitle.trim(),
          submission: notes,
          author: user.displayName || user.email || "Anonymous",
          authorId: user.uid,
          status: "Pending Review",
          ...(external ? { paperExternalUrl: external } : {}),
        },
        rubricItems.map(({ criterion, maxScore }) => ({ criterion, maxScore })),
        rubricItems.map((r) => r.file),
        paperFile
      );
      toast.success("Submission posted for peer review.");
      setNewReviewTitle("");
      setNewReviewSubmission("");
      setPaperFile(null);
      setPaperExternalUrl("");
      setRubricItems([]);
      setIsSubmitDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not submit. Try a smaller file or use a link instead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePeerReview = async () => {
    const id = deleteIdRef.current ?? deleteTargetId;
    if (!id || isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePeerReview(id);
      toast.success("Peer review removed.");
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not delete. Ensure your Firebase rules allow teachers to delete peer-reviews documents and storage objects."
      );
    } finally {
      deleteIdRef.current = null;
      setDeleteTargetId(null);
      setIsDeleting(false);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8 border-b-4 border-black/10 pb-6">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85]">
                Peer Review
            </h1>
            {!user && (
              <p className="max-w-md text-sm font-bold text-[#2C2C2C]/70 sm:text-right">
                <Link href="/login" className="text-[#006B6B] underline underline-offset-2">
                  Sign in
                </Link>{" "}
                to submit your work for peer review.
              </p>
            )}
            {user && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Submit for Review</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#FFC971] border-4 border-black sm:max-w-[625px]">
                        <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight">Submit for Peer Review</DialogTitle>
                        <DialogDescription className="text-lg font-bold text-[#2C2C2C]/60">
                            Files are stored in Firestore (no Firebase Storage needed). Images and PDFs up to{" "}
                            {MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB, or paste a link to a larger file (Google Drive, Imgur, etc.).
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
                                      {paperFile ? paperFile.name : "PDF, Word, images, or other files"}
                                    </span>
                                    <input
                                      id="paper"
                                      type="file"
                                      className="sr-only"
                                      accept=".pdf,.doc,.docx,.txt,.rtf,image/*,.png,.jpg,.jpeg,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                      onChange={(e) => setPaperFile(e.target.files?.[0] ?? null)}
                                    />
                                  </label>
                                  {paperFile && (
                                    <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => setPaperFile(null)}>
                                      Remove file
                                    </Button>
                                  )}
                                  <p className="text-xs font-bold text-[#2C2C2C]/50">
                                    Max {MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB per file (stored in the database, not cloud Storage).
                                  </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="paper-link" className="text-right font-bold text-lg text-[#2C2C2C] pt-2">
                                  Link (optional)
                                </Label>
                                <div className="col-span-3 space-y-1">
                                  <Input
                                    id="paper-link"
                                    type="url"
                                    placeholder="https://… if your file is larger, host it elsewhere and paste the link"
                                    value={paperExternalUrl}
                                    onChange={(e) => setPaperExternalUrl(e.target.value)}
                                    className="bg-white border-2 border-black text-black font-bold focus:ring-0"
                                  />
                                  <p className="text-xs font-bold text-[#2C2C2C]/50">
                                    Use this for big PDFs or images over {MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB.
                                  </p>
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
                                  <p className="text-xs font-bold text-[#2C2C2C]/50">Provide a file, a link, notes, or any combination.</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#2C2C2C] mb-2">Rubric</h3>
                                <p className="text-xs font-bold text-[#2C2C2C]/50 mb-3">
                                  Add criteria and max points; optional reference file per row (max {MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB each).
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
                                            accept=".pdf,.doc,.docx,.txt,.rtf,image/*,.png,.jpg,.jpeg,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
      {peerReviews.length === 0 ? (
        <div className="rounded-2xl border-4 border-dashed border-black/15 bg-white/80 p-12 text-center">
          <p className="text-xl font-black text-[#2C2C2C]">No peer reviews yet</p>
          <p className="mt-2 font-bold text-[#2C2C2C]/60">
            Be the first to submit a paper, or check back after classmates post.
          </p>
          {!user && (
            <Button asChild className="mt-6 bg-[#006B6B] font-bold text-white border-2 border-black">
              <Link href="/login">Sign in to submit</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {peerReviews.map((assignment) => (
            <div key={assignment.id} className="relative">
              {isTeacher && (
                <Button
                  type="button"
                  variant="destructive"
                  className="absolute right-4 top-4 z-10 gap-1 border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]"
                  onClick={() => {
                    deleteIdRef.current = assignment.id;
                    setDeleteTargetId(assignment.id);
                  }}
                  aria-label={`Delete peer review ${assignment.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Link href={`/community/peerreview/${assignment.id}`}>
                <div className="bg-[#FFC971] rounded-2xl p-8 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-shadow duration-300">
                  <div>
                    <h3 className="text-3xl font-black text-[#2C2C2C] uppercase tracking-tight pr-24 sm:pr-28">
                      {assignment.title}
                    </h3>
                    <p className="text-lg font-bold text-[#2C2C2C]/60 mt-2">Author: {assignment.author}</p>
                    <p className="text-lg font-bold text-[#2C2C2C]/60">Status: {assignment.status}</p>
                    {peerReviewHasPaperAttachment(assignment) && (
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-[#006B6B]">
                        <FileText className="h-4 w-4" /> Paper attached
                      </p>
                    )}
                  </div>
                  <Button className="mt-8 w-full bg-[#006B6B] text-white font-bold text-lg h-12 rounded-xl hover:bg-[#005555] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {user?.uid === assignment.authorId ? "View your submission" : "Open"}
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      <ConfirmationDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            deleteIdRef.current = null;
            setDeleteTargetId(null);
          }
        }}
        onConfirm={confirmDeletePeerReview}
        title="Delete this peer review?"
        description="This permanently removes the submission, rubric, all reviews, and uploaded files. This cannot be undone."
      />
    </PageLayout>
  );
}
