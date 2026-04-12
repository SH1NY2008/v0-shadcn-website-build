import { db } from "./firebase";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

export const MAX_DISPLAY_NAME_LENGTH = 100;

export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  role: "student" | "teacher";
  discoverable: boolean;
  updatedAt?: unknown;
}

/**
 * Keeps `publicProfiles/{uid}` in sync with `users/{uid}` for directory + member cards.
 * Omits email from the public document. Call after login/signup and when profile changes.
 */
export async function syncPublicProfileFromAuthUser(
  user: User,
  extra?: { role?: "student" | "teacher" }
) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};
  const discoverable = data.discoverable !== false;
  const displayName =
    (typeof data.displayName === "string" && data.displayName.trim()) ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Student";
  const role = (data.role as "student" | "teacher") || extra?.role || "student";
  const photoURL = (typeof data.photoURL === "string" && data.photoURL) || user.photoURL || "";

  if (!discoverable) {
    await deleteDoc(doc(db, "publicProfiles", user.uid)).catch(() => undefined);
    return;
  }

  await setDoc(
    doc(db, "publicProfiles", user.uid),
    {
      uid: user.uid,
      displayName: displayName.slice(0, MAX_DISPLAY_NAME_LENGTH),
      photoURL,
      role,
      discoverable: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function writeNewUserDocuments(opts: {
  uid: string;
  email: string | null;
  displayName: string;
  role: "student" | "teacher";
  photoURL?: string | null;
}) {
  const { uid, email, displayName, role, photoURL } = opts;
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    displayName: displayName.slice(0, MAX_DISPLAY_NAME_LENGTH),
    role,
    discoverable: true,
    createdAt: new Date().toISOString(),
    ...(photoURL ? { photoURL } : {}),
  });
  await setDoc(doc(db, "publicProfiles", uid), {
    uid,
    displayName: displayName.slice(0, MAX_DISPLAY_NAME_LENGTH),
    photoURL: photoURL || "",
    role,
    discoverable: true,
    updatedAt: serverTimestamp(),
  });
}
