
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot, increment } from "firebase/firestore";

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
    submission: string;
}

export interface RubricItem {
    id: string;
    criterion: string;
    maxScore: number;
}

export interface Review {
    id: string;
    reviewerId: string;
    feedback: string;
    scores: { [key: string]: number };
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
  const unsubscribe = onSnapshot(topicsCol, (snapshot) => {
    const topicList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
    callback(topicList);
  });
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
  const unsubscribe = onSnapshot(postsCol, (snapshot) => {
    const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    const sortedPostList = postList.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.createdAt?.seconds - b.createdAt?.seconds;
    });
    callback(sortedPostList);
  });
  return unsubscribe;
}

export async function getPosts(topicId: string): Promise<Post[]> {
  const postsCol = collection(db, "topics", topicId, "posts");
  const postSnapshot = await getDocs(postsCol);
  const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  return postList.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.createdAt?.seconds - b.createdAt?.seconds;
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
    const upvoted = post.upvotedBy.includes(userId);
    const downvoted = post.downvotedBy.includes(userId);

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
      const reply = post.replies[replyIndex];
      const upvoted = reply.upvotedBy.includes(userId);
      const downvoted = reply.downvotedBy.includes(userId);

      if (voteType === 'upvote') {
        if (upvoted) {
          // User is removing their upvote
          reply.upvotes -= 1;
          reply.upvotedBy = reply.upvotedBy.filter(id => id !== userId);
        } else {
          // User is adding an upvote
          reply.upvotes += 1;
          reply.upvotedBy.push(userId);
          if (downvoted) {
            // If user had downvoted, remove the downvote
            reply.downvotes -= 1;
            reply.downvotedBy = reply.downvotedBy.filter(id => id !== userId);
          }
        }
      } else if (voteType === 'downvote') {
        if (downvoted) {
          // User is removing their downvote
          reply.downvotes -= 1;
          reply.downvotedBy = reply.downvotedBy.filter(id => id !== userId);
        } else {
          // User is adding a downvote
          reply.downvotes += 1;
          reply.downvotedBy.push(userId);
          if (upvoted) {
            // If user had upvoted, remove the upvote
            reply.upvotes -= 1;
            reply.upvotedBy = reply.upvotedBy.filter(id => id !== userId);
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
    const studyGroupList = studyGroupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGroup));
    return studyGroupList;
}

export async function getStudyGroup(id: string): Promise<StudyGroup | null> {
    const studyGroupRef = doc(db, "studygroups", id);
    const studyGroupSnap = await getDoc(studyGroupRef);
    if (studyGroupSnap.exists()) {
        return { id: studyGroupSnap.id, ...studyGroupSnap.data() } as StudyGroup;
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

export async function getStudyGroupMembers(studyGroupId: string): Promise<Member[]> {
    const studyGroup = await getStudyGroup(studyGroupId);
    if (!studyGroup) return [];

    const members: Member[] = [];
    for (const userId of studyGroup.members) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const user = userSnap.data();
            members.push({ id: userSnap.id, name: user.displayName, avatar: user.photoURL });
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

export async function createPeerReview(peerReview: Omit<PeerReview, 'id'>, rubric: Omit<RubricItem, 'id'>[]) {
    const peerReviewsCol = collection(db, "peer-reviews");
    const newPeerReviewRef = await addDoc(peerReviewsCol, peerReview);
    const rubricCol = collection(db, "peer-reviews", newPeerReviewRef.id, "rubric");
    for (const item of rubric) {
        await addDoc(rubricCol, item);
    }
}

export async function createReview(peerReviewId: string, review: Omit<Review, 'id'>) {
    const reviewsCol = collection(db, "peer-reviews", peerReviewId, "reviews");
    await addDoc(reviewsCol, review);
}

export async function getReviews(peerReviewId: string): Promise<Review[]> {
    const reviewsCol = collection(db, "peer-reviews", peerReviewId, "reviews");
    const reviewSnapshot = await getDocs(reviewsCol);
    const reviewList = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    return reviewList;
}
