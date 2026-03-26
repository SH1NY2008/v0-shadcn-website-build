
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { ClassData } from "./teacher";

export interface StudentData {
  uid: string;
  role: "student";
  classes: string[]; // Array of class IDs
}

export async function joinClassWithCode(studentId: string, classCode: string): Promise<any | null> {
  const classesRef = collection(db, "classes");
  const q = query(classesRef, where("classCode", "==", classCode));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const classDoc = querySnapshot.docs[0];
  const classId = classDoc.id;

  // Add student to class
  const classRef = doc(db, "classes", classId);
  await updateDoc(classRef, {
    students: arrayUnion(studentId),
  });

  // Add class to student
  const studentRef = doc(db, "users", studentId);
  await updateDoc(studentRef, {
    classes: arrayUnion(classId),
  });

  return { id: classId, ...classDoc.data() };
}

export function subscribeToStudentClasses(studentId: string, callback: (classes: ClassData[]) => void) {
  const studentRef = doc(db, "users", studentId);

  const unsub = onSnapshot(studentRef, async (snap) => {
    const userData = snap.data();
    if (userData && userData.classes && userData.classes.length > 0) {
      const classPromises = userData.classes.map((classId: string) => {
        return getDoc(doc(db, "classes", classId));
      });
      const classDocs = await Promise.all(classPromises);
      const classesData = classDocs.filter(d => d.exists()).map(d => d.data() as ClassData);
      callback(classesData);
    } else {
      callback([]);
    }
  });

  return unsub;
}
