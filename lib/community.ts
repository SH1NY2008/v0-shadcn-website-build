import { db } from "./firebase";
import type { PublicProfile } from "./user-profile";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  onSnapshot,
  increment,
  Timestamp,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

/** Avoids Firestore SDK internal assertion noise when tearing down failed listeners. */
function safeUnsubscribe(unsub: () => void) {
  return () => {
    try {
      unsub();
    } catch {
      /* ignore */
    }
  };
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

/** Group chat message (no images in v1). */
export interface GroupMessage {
  id: string;
  text: string;
  authorId: string;
  createdAt: unknown;
}

export const MAX_GROUP_MESSAGE_LENGTH = 500;

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
  return safeUnsubscribe(
    onSnapshot(
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
    )
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

export async function createStudyGroup(
  studyGroup: Omit<StudyGroup, "id" | "members">,
  options?: { creatorId?: string }
) {
  const studyGroupsCol = collection(db, "studygroups");
  const creatorId = options?.creatorId;
  await addDoc(studyGroupsCol, {
    ...studyGroup,
    members: creatorId ? [creatorId] : [],
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

/** Deletes the study group and all `challenges` and `messages` subcollection docs. */
export async function deleteStudyGroup(studyGroupId: string): Promise<void> {
  const deleteSubcollection = async (sub: string) => {
    const ref = collection(db, "studygroups", studyGroupId, sub);
    const snap = await getDocs(ref);
    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };
  await deleteSubcollection("challenges");
  await deleteSubcollection("messages");
  await deleteDoc(doc(db, "studygroups", studyGroupId));
}

export async function getStudyGroupMembers(studyGroupId: string): Promise<Member[]> {
  const studyGroup = await getStudyGroup(studyGroupId);
  if (!studyGroup) return [];

  const members: Member[] = [];
  for (const userId of studyGroup.members) {
    const ppRef = doc(db, "publicProfiles", userId);
    const ppSnap = await getDoc(ppRef);
    if (ppSnap.exists()) {
      const p = ppSnap.data() as Partial<PublicProfile>;
      members.push({
        id: userId,
        name: p.displayName || "Member",
        avatar: p.photoURL || "",
      });
    } else {
      members.push({
        id: userId,
        name: "Member",
        avatar: "",
      });
    }
  }
  return members;
}

/** Directory: discoverable profiles only (no email in documents). */
export function subscribeToDiscoverableProfiles(
  callback: (profiles: PublicProfile[]) => void
) {
  const q = query(
    collection(db, "publicProfiles"),
    where("discoverable", "==", true),
    orderBy("displayName"),
    limit(200)
  );
  return safeUnsubscribe(
    onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            ...data,
          } as PublicProfile;
        });
        callback(list);
      },
      (err) => {
        console.error("subscribeToDiscoverableProfiles:", err);
        callback([]);
      }
    )
  );
}

export async function sendStudyGroupMessage(
  studyGroupId: string,
  authorId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_GROUP_MESSAGE_LENGTH) return;
  await addDoc(collection(db, "studygroups", studyGroupId, "messages"), {
    text: trimmed,
    authorId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToStudyGroupMessages(
  studyGroupId: string,
  callback: (messages: GroupMessage[]) => void
) {
  const q = query(
    collection(db, "studygroups", studyGroupId, "messages"),
    orderBy("createdAt", "desc"),
    limit(80)
  );
  return safeUnsubscribe(
    onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as GroupMessage))
          .reverse();
        callback(list);
      },
      (err) => {
        console.error("subscribeToStudyGroupMessages:", err);
        callback([]);
      }
    )
  );
}

export async function deleteStudyGroupMessage(
  studyGroupId: string,
  messageId: string
): Promise<void> {
  await deleteDoc(doc(db, "studygroups", studyGroupId, "messages", messageId));
}

export async function getStudyGroupChallenges(studyGroupId: string): Promise<Challenge[]> {
    const challengesCol = collection(db, "studygroups", studyGroupId, "challenges");
    const challengeSnapshot = await getDocs(challengesCol);
    const challengeList = challengeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    return challengeList;
}

/** One-shot counts for the community hub cards (topics, study groups). */
export async function getCommunityHubCounts(): Promise<{
  topics: number;
  studyGroups: number;
}> {
  const [topicsSnap, sgSnap] = await Promise.all([
    getDocs(collection(db, "topics")),
    getDocs(collection(db, "studygroups")),
  ]);
  return {
    topics: topicsSnap.size,
    studyGroups: sgSnap.size,
  };
}
