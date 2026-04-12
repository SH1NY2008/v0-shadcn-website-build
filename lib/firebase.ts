"use client"

import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)

/**
 * Firestore persistence must run at most once per tab. Next.js Fast Refresh re-executes
 * this module and would call enableIndexedDbPersistence again on the same `db`, which
 * can trigger SDK internal errors (e.g. WatchChangeAggregator "Unexpected state").
 */
if (typeof window !== "undefined") {
  const w = window as Window & { __numeriaFirestorePersistence?: boolean }
  if (!w.__numeriaFirestorePersistence) {
    w.__numeriaFirestorePersistence = true
    enableIndexedDbPersistence(db).catch((err: { code?: string }) => {
      w.__numeriaFirestorePersistence = false
      if (err.code === "failed-precondition") {
        console.warn("Firebase persistence failed: Multiple tabs open")
      } else if (err.code === "unimplemented") {
        console.warn("Firebase persistence not supported by browser")
      }
    })
  }
}

export let analytics: ReturnType<typeof getAnalytics> | null = null
;(async () => {
  if (typeof window !== "undefined") {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app)
      }
    } catch {
      analytics = null
    }
  }
})()
