
import { db, storage } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot, increment, Timestamp, writeBatch } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";

/** Max binary size before base64 (~600KB encoded) so the peer-review doc stays under Firestore’s 1MB limit. */
export const MAX_PEER_REVIEW_INLINE_BYTES = 450 * 1024;

async function fileToBase64(file: File): Promise<string> {
  if (typeof FileReader === "undefined") {
    throw new Error("File reading is only available in the browser.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      const base64 = r.includes(",") ? r.split(",", 2)[1]! : r;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Sort key for posts (handles Firestore Timestamp, Date, or plain objects with seconds). */
function getCreatedAtMillis(data: { createdAt?: unknown }): number {
  const c = data.createdAt as Timestamp | Date | { seconds?: number } | undefined | null;
  if (!c) return 0;
  if (c instanceof Timestamp) return c.toMillis();
  if (c instanceof Date) return c.getTime();
  if (typeof (c as { seconds?: number }).seconds === "number")
    return (c as { seconds: number }).seconds * 1000;
  return 0;
}

// Types
export interface Topic {
  id: string;
  title: string;
  description: string;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  message: string;
  pinned: boolean;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: any;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  message: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: any;
}

export interface StudyGroup {
    id: string;
    title: string;
    description: string;
    members: string[];
}

export interface Member {
    id: string;
    name: string;
    avatar: string;
}

export interface Challenge {
    id: string;
    title: string;
    progress: number;
}

export interface PeerReview {
    id: string;
    title: string;
    author: string;
    authorId: string;
    status: string;
    /** Optional notes / abstract (paper may be uploaded separately). */
    submission: string;
    /** Original filename when a file was uploaded. */
    paperFileName?: string;
    /** Public download URL (Firebase Storage — legacy). */
    paperDownloadUrl?: string;
    paperStoragePath?: string;
    /** MIME type of uploaded paper (helps preview images/PDF). */
    paperContentType?: string;
    /** Paper bytes stored in Firestore as base64 (no Firebase Storage; Spark plan). */
    paperInlineBase64?: string;
    /** Optional link to a file hosted elsewhere (Imgur, Drive share link, etc.). */
    paperExternalUrl?: string;
}

export interface RubricItem {
    id: string;
    criterion: string;
    maxScore: number;
    /** Optional rubric reference file (syllabus, department rubric PDF, etc.). */
    attachmentFileName?: string;
    attachmentDownloadUrl?: string;
    attachmentStoragePath?: string;
    attachmentInlineBase64?: string;
    attachmentContentType?: string;
}

export interface Review {
    id: string;
    reviewerId: string;
    reviewerName?: string;
    feedback: string;
    scores: { [key: string]: number };
    createdAt?: Timestamp | { seconds?: number };
}

function reviewTimeMs(r: Review): number {
  const c = r.createdAt as Timestamp | { seconds?: number } | undefined;
  if (!c) return 0;
  if (c instanceof Timestamp) return c.toMillis();
  if (typeof (c as { seconds?: number }).seconds === "number")
    return (c as { seconds: number }).seconds * 1000;
  return 0;
}

function sanitizePaperFileName(name: string): string {
  const base = name.replace(/[^\w.\- ]+/g, "_").trim() || "paper";
  return base.slice(0, 180);
}

/** Resolved URL for preview/download (Storage URL, external link, or data URL from Firestore inline bytes). */
export function peerReviewPaperDisplayUrl(pr: PeerReview): string | null {
  if (pr.paperDownloadUrl) return pr.paperDownloadUrl;
  const ext = pr.paperExternalUrl?.trim();
  if (ext) return ext;
  if (pr.paperInlineBase64 && pr.paperContentType) {
    return `data:${pr.paperContentType};base64,${pr.paperInlineBase64}`;
  }
  return null;
}

export function peerReviewHasPaperAttachment(pr: PeerReview): boolean {
  return !!peerReviewPaperDisplayUrl(pr);
}

/** Resolved URL for a rubric attachment (Storage or inline in Firestore). */
export function rubricAttachmentDisplayUrl(item: RubricItem): string | null {
  if (item.attachmentDownloadUrl) return item.attachmentDownloadUrl;
  if (item.attachmentInlineBase64 && item.attachmentContentType) {
    return `data:${item.attachmentContentType};base64,${item.attachmentInlineBase64}`;
  }
  return null;
}

/** Attach a paper file using Firestore only (no Firebase Storage — works on Spark plan). */
export async function attachPeerReviewPaper(peerReviewId: string, file: File): Promise<void> {
  if (file.size > MAX_PEER_REVIEW_INLINE_BYTES) {
    throw new Error(
      `File is too large (${Math.round(file.size / 1024)}KB). Max ${MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB for in-database storage, or use an external link.`
    );
  }
  const base64 = await fileToBase64(file);
  await updateDoc(doc(db, "peer-reviews", peerReviewId), {
    paperFileName: file.name,
    paperInlineBase64: base64,
    paperContentType: file.type || "application/octet-stream",
  });
}

/** Store a rubric attachment in Firestore only (no Storage). */
export async function attachRubricItemFile(
  peerReviewId: string,
  rubricItemId: string,
  file: File
): Promise<void> {
  if (file.size > MAX_PEER_REVIEW_INLINE_BYTES) {
    throw new Error(
      `Rubric file is too large. Max ${MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB per file without cloud storage.`
    );
  }
  const base64 = await fileToBase64(file);
  await updateDoc(doc(db, "peer-reviews", peerReviewId, "rubric", rubricItemId), {
    attachmentFileName: file.name,
    attachmentInlineBase64: base64,
    attachmentContentType: file.type || "application/octet-stream",
  });
}

// Functions
export async function getTopics(): Promise<Topic[]> {
  const topicsCol = collection(db, "topics");
  const topicSnapshot = await getDocs(topicsCol);
  const topicList = topicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
  return topicList;
}

export function onTopicsUpdate(callback: (topics: Topic[]) => void) {
  const topicsCol = collection(db, "topics");
  const unsubscribe = onSnapshot(
    topicsCol,
    (snapshot) => {
      const topicList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Topic));
      callback(topicList);
    },
    (err) => {
      console.error("onTopicsUpdate:", err);
      callback([]);
    }
  );
  return unsubscribe;
}

export async function deleteTopic(topicId: string) {
  const topicRef = doc(db, "topics", topicId);
  await deleteDoc(topicRef);
}

export async function createTopic(topic: Omit<Topic, 'id'>) {
  const topicsCol = collection(db, "topics");
  await addDoc(topicsCol, topic);
}

export async function getTopic(id: string): Promise<Topic | null> {
  const topicRef = doc(db, "topics", id);
  const topicSnap = await getDoc(topicRef);
  if (topicSnap.exists()) {
    return { id: topicSnap.id, ...topicSnap.data() } as Topic;
  }
  return null;
}

export function onPostsUpdate(topicId: string, callback: (posts: Post[]) => void) {
  const postsCol = collection(db, "topics", topicId, "posts");
  const unsubscribe = onSnapshot(
    postsCol,
    (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      const sortedPostList = postList.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return getCreatedAtMillis(a) - getCreatedAtMillis(b);
      });
      callback(sortedPostList);
    },
    (err) => {
      console.error("onPostsUpdate:", err);
      callback([]);
    }
  );
  return unsubscribe;
}

export async function getPosts(topicId: string): Promise<Post[]> {
  const postsCol = collection(db, "topics", topicId, "posts");
  const postSnapshot = await getDocs(postsCol);
  const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  return postList.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return getCreatedAtMillis(a) - getCreatedAtMillis(b);
  });
}

export async function togglePinPost(topicId: string, postId: string, pinned: boolean) {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  await updateDoc(postRef, { pinned: !pinned });
}

export async function createPost(topicId: string, post: Omit<Post, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'upvotedBy' | 'downvotedBy'>) {
  const postsCol = collection(db, "topics", topicId, "posts");
  await addDoc(postsCol, {
    ...post,
    upvotes: 0,
    downvotes: 0,
    upvotedBy: [],
    downvotedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function voteOnPost(topicId: string, postId: string, userId: string, voteType: 'upvote' | 'downvote') {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const post = postSnap.data() as Post;
    const upvotedBy = post.upvotedBy ?? [];
    const downvotedBy = post.downvotedBy ?? [];
    const upvoted = upvotedBy.includes(userId);
    const downvoted = downvotedBy.includes(userId);

    let updates: any = {};

    if (voteType === 'upvote') {
      if (upvoted) {
        // User is removing their upvote
        updates.upvotes = increment(-1);
        updates.upvotedBy = arrayRemove(userId);
      } else {
        // User is adding an upvote
        updates.upvotes = increment(1);
        updates.upvotedBy = arrayUnion(userId);
        if (downvoted) {
          // If user had downvoted, remove the downvote
          updates.downvotes = increment(-1);
          updates.downvotedBy = arrayRemove(userId);
        }
      }
    } else if (voteType === 'downvote') {
      if (downvoted) {
        // User is removing their downvote
        updates.downvotes = increment(-1);
        updates.downvotedBy = arrayRemove(userId);
      } else {
        // User is adding a downvote
        updates.downvotes = increment(1);
        updates.downvotedBy = arrayUnion(userId);
        if (upvoted) {
          // If user had upvoted, remove the upvote
          updates.upvotes = increment(-1);
          updates.upvotedBy = arrayRemove(userId);
        }
      }
    }
    await updateDoc(postRef, updates);
  }
}

export async function createReply(topicId: string, postId: string, reply: Omit<Reply, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'upvotedBy' | 'downvotedBy'>) {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  const replyWithTimestamp = {
    ...reply,
    id: doc(collection(db, "dummy")).id, // Generate a unique ID for the reply
    upvotes: 0,
    downvotes: 0,
    upvotedBy: [],
    downvotedBy: [],
    createdAt: new Date(),
  };
  await updateDoc(postRef, {
    replies: arrayUnion(replyWithTimestamp)
  });
}

export async function voteOnReply(topicId: string, postId: string, replyId: string, userId: string, voteType: 'upvote' | 'downvote') {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const post = postSnap.data() as Post;
    const replyIndex = post.replies?.findIndex(r => r.id === replyId);

    if (post.replies && replyIndex !== undefined && replyIndex !== -1) {
      const reply = { ...post.replies[replyIndex] };
      reply.upvotes = reply.upvotes ?? 0;
      reply.downvotes = reply.downvotes ?? 0;
      reply.upvotedBy = [...(reply.upvotedBy ?? [])];
      reply.downvotedBy = [...(reply.downvotedBy ?? [])];

      const upvoted = reply.upvotedBy.includes(userId);
      const downvoted = reply.downvotedBy.includes(userId);

      if (voteType === 'upvote') {
        if (upvoted) {
          reply.upvotes -= 1;
          reply.upvotedBy = reply.upvotedBy.filter((id) => id !== userId);
        } else {
          reply.upvotes += 1;
          reply.upvotedBy.push(userId);
          if (downvoted) {
            reply.downvotes -= 1;
            reply.downvotedBy = reply.downvotedBy.filter((id) => id !== userId);
          }
        }
      } else if (voteType === 'downvote') {
        if (downvoted) {
          reply.downvotes -= 1;
          reply.downvotedBy = reply.downvotedBy.filter((id) => id !== userId);
        } else {
          reply.downvotes += 1;
          reply.downvotedBy.push(userId);
          if (upvoted) {
            reply.upvotes -= 1;
            reply.upvotedBy = reply.upvotedBy.filter((id) => id !== userId);
          }
        }
      }
      
      const updatedReplies = [...post.replies];
      updatedReplies[replyIndex] = reply;

      await updateDoc(postRef, { replies: updatedReplies });
    }
  }
}

export async function deletePost(topicId: string, postId: string) {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  await deleteDoc(postRef);
}

export async function deleteReply(topicId: string, postId: string, replyId: string) {
  const postRef = doc(db, "topics", topicId, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const post = postSnap.data() as Post;
    const updatedReplies = post.replies?.filter(reply => reply.id !== replyId);
    await updateDoc(postRef, { replies: updatedReplies });
  }
}

export async function getStudyGroups(): Promise<StudyGroup[]> {
    const studyGroupsCol = collection(db, "studygroups");
    const studyGroupSnapshot = await getDocs(studyGroupsCol);
    return studyGroupSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        members: Array.isArray(data.members) ? data.members : [],
      } as StudyGroup;
    });
}

/** Live list for study groups index (join/leave and new groups update without refresh). */
export function subscribeToStudyGroups(callback: (groups: StudyGroup[]) => void) {
  const studyGroupsCol = collection(db, "studygroups");
  return onSnapshot(
    studyGroupsCol,
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          members: Array.isArray(data.members) ? data.members : [],
        } as StudyGroup;
      });
      callback(list);
    },
    (err) => {
      console.error("subscribeToStudyGroups:", err);
      callback([]);
    }
  );
}

export async function getStudyGroup(id: string): Promise<StudyGroup | null> {
    const studyGroupRef = doc(db, "studygroups", id);
    const studyGroupSnap = await getDoc(studyGroupRef);
    if (studyGroupSnap.exists()) {
      const data = studyGroupSnap.data();
      return {
        id: studyGroupSnap.id,
        ...data,
        members: Array.isArray(data.members) ? data.members : [],
      } as StudyGroup;
    }
    return null;
}

export async function createStudyGroup(studyGroup: Omit<StudyGroup, 'id' | 'members'>) {
    const studyGroupsCol = collection(db, "studygroups");
    await addDoc(studyGroupsCol, {
        ...studyGroup,
        members: [],
    });
}

export async function joinStudyGroup(studyGroupId: string, userId: string) {
    const studyGroupRef = doc(db, "studygroups", studyGroupId);
    await updateDoc(studyGroupRef, {
        members: arrayUnion(userId),
    });
}

export async function leaveStudyGroup(studyGroupId: string, userId: string) {
    const studyGroupRef = doc(db, "studygroups", studyGroupId);
    await updateDoc(studyGroupRef, {
        members: arrayRemove(userId),
    });
}

/** Deletes the study group document and all documents in the `challenges` subcollection. */
export async function deleteStudyGroup(studyGroupId: string): Promise<void> {
  const challengesRef = collection(db, "studygroups", studyGroupId, "challenges");
  const snap = await getDocs(challengesRef);
  for (let i = 0; i < snap.docs.length; i += 500) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, "studygroups", studyGroupId));
}

export async function getStudyGroupMembers(studyGroupId: string): Promise<Member[]> {
    const studyGroup = await getStudyGroup(studyGroupId);
    if (!studyGroup) return [];

    const members: Member[] = [];
    for (const userId of studyGroup.members) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const user = userSnap.data();
            members.push({
              id: userSnap.id,
              name: user.displayName || user.email || "Student",
              avatar: user.photoURL || "",
            });
        } else {
            members.push({
              id: userId,
              name: "Community member",
              avatar: "",
            });
        }
    }
    return members;
}

export async function getStudyGroupChallenges(studyGroupId: string): Promise<Challenge[]> {
    const challengesCol = collection(db, "studygroups", studyGroupId, "challenges");
    const challengeSnapshot = await getDocs(challengesCol);
    const challengeList = challengeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    return challengeList;
}

export async function getPeerReviews(): Promise<PeerReview[]> {
    const peerReviewsCol = collection(db, "peer-reviews");
    const peerReviewSnapshot = await getDocs(peerReviewsCol);
    const peerReviewList = peerReviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerReview));
    return peerReviewList;
}

/** Live list for peer review index (new submissions appear without refresh). */
export function subscribeToPeerReviews(callback: (reviews: PeerReview[]) => void) {
  const peerReviewsCol = collection(db, "peer-reviews");
  return onSnapshot(
    peerReviewsCol,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PeerReview));
      callback(list);
    },
    (err) => {
      console.error("subscribeToPeerReviews:", err);
      callback([]);
    }
  );
}

/** One-shot counts for the community hub cards (topics, groups, peer reviews). */
export async function getCommunityHubCounts(): Promise<{
  topics: number;
  studyGroups: number;
  peerReviews: number;
}> {
  const [topicsSnap, sgSnap, prSnap] = await Promise.all([
    getDocs(collection(db, "topics")),
    getDocs(collection(db, "studygroups")),
    getDocs(collection(db, "peer-reviews")),
  ]);
  return {
    topics: topicsSnap.size,
    studyGroups: sgSnap.size,
    peerReviews: prSnap.size,
  };
}

export async function getPeerReview(id: string): Promise<PeerReview | null> {
    const peerReviewRef = doc(db, "peer-reviews", id);
    const peerReviewSnap = await getDoc(peerReviewRef);
    if (peerReviewSnap.exists()) {
        return { id: peerReviewSnap.id, ...peerReviewSnap.data() } as PeerReview;
    }
    return null;
}

export async function getRubric(peerReviewId: string): Promise<RubricItem[]> {
    const rubricCol = collection(db, "peer-reviews", peerReviewId, "rubric");
    const rubricSnapshot = await getDocs(rubricCol);
    const rubricList = rubricSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RubricItem));
    return rubricList;
}

export async function createPeerReview(
  peerReview: Omit<PeerReview, "id">,
  rubric: Omit<RubricItem, "id">[],
  rubricFiles?: (File | null | undefined)[],
  paperFile?: File | null
): Promise<string> {
  const peerReviewsCol = collection(db, "peer-reviews");
  const newPeerReviewRef = doc(peerReviewsCol);
  const id = newPeerReviewRef.id;

  let paperFields: Partial<PeerReview> = {};
  if (paperFile && paperFile.size > 0) {
    if (paperFile.size > MAX_PEER_REVIEW_INLINE_BYTES) {
      throw new Error(
        `Paper file is too large (${Math.round(paperFile.size / 1024)}KB). Max ${MAX_PEER_REVIEW_INLINE_BYTES / 1024}KB without Firebase Storage, or paste an external link to your file instead.`
      );
    }
    const base64 = await fileToBase64(paperFile);
    paperFields = {
      paperFileName: paperFile.name,
      paperInlineBase64: base64,
      paperContentType: paperFile.type || undefined,
    };
  }

  await setDoc(newPeerReviewRef, { ...peerReview, ...paperFields });

  const rubricCol = collection(db, "peer-reviews", id, "rubric");
  for (let i = 0; i < rubric.length; i++) {
    const item = rubric[i];
    const file = rubricFiles?.[i];
    const hasFile = file instanceof File && file.size > 0;
    const trimmed = item.criterion?.trim() ?? "";
    if (!trimmed && !hasFile) continue;
    const criterion =
      trimmed || (hasFile ? (file!.name.replace(/\.[^.]+$/, "") || "Rubric attachment") : "");
    const maxScore = Number.isFinite(item.maxScore) ? item.maxScore : 0;
    const rubricDocRef = await addDoc(rubricCol, { criterion, maxScore });
    if (hasFile) {
      await attachRubricItemFile(id, rubricDocRef.id, file!);
    }
  }
  return id;
}

/** Remove a peer review, its subcollections, and associated Storage files. Call only after verifying the user is a teacher (see Firestore rules). */
export async function deletePeerReview(peerReviewId: string): Promise<void> {
  const prRef = doc(db, "peer-reviews", peerReviewId);
  const prSnap = await getDoc(prRef);
  if (!prSnap.exists()) return;

  const data = prSnap.data() as PeerReview;
  if (data.paperStoragePath) {
    try {
      await deleteObject(storageRef(storage, data.paperStoragePath));
    } catch (e) {
      console.warn("deletePeerReview paper file:", e);
    }
  }

  const rubricSnap = await getDocs(collection(db, "peer-reviews", peerReviewId, "rubric"));
  for (const rubricDoc of rubricSnap.docs) {
    const r = rubricDoc.data() as RubricItem;
    if (r.attachmentStoragePath) {
      try {
        await deleteObject(storageRef(storage, r.attachmentStoragePath));
      } catch (e) {
        console.warn("deletePeerReview rubric file:", e);
      }
    }
    await deleteDoc(rubricDoc.ref);
  }

  const reviewsSnap = await getDocs(collection(db, "peer-reviews", peerReviewId, "reviews"));
  for (const reviewDoc of reviewsSnap.docs) {
    await deleteDoc(reviewDoc.ref);
  }

  await deleteDoc(prRef);
}

export async function createReview(peerReviewId: string, review: Omit<Review, "id" | "createdAt">) {
  const reviewsCol = collection(db, "peer-reviews", peerReviewId, "reviews");
  await addDoc(reviewsCol, {
    ...review,
    createdAt: serverTimestamp(),
  });
}

export async function getReviews(peerReviewId: string): Promise<Review[]> {
  const reviewsCol = collection(db, "peer-reviews", peerReviewId, "reviews");
  const reviewSnapshot = await getDocs(reviewsCol);
  const reviewList = reviewSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
  return reviewList.sort((a, b) => reviewTimeMs(b) - reviewTimeMs(a));
}

export function subscribeToPeerReviewComments(
  peerReviewId: string,
  callback: (reviews: Review[]) => void
) {
  const reviewsCol = collection(db, "peer-reviews", peerReviewId, "reviews");
  return onSnapshot(
    reviewsCol,
    (snapshot) => {
      const reviewList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
      reviewList.sort((a, b) => reviewTimeMs(b) - reviewTimeMs(a));
      callback(reviewList);
    },
    (err) => {
      console.error("subscribeToPeerReviewComments:", err);
      callback([]);
    }
  );
}
