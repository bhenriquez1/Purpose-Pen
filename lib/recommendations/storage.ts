import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/config";

/**
 * Persistence layer for the Letter of Recommendation Suite.
 *
 * Uses Firestore (users/{uid}/{collectionName}/{id}) when Firebase env vars
 * are configured. Otherwise falls back to localStorage, namespaced by uid,
 * so the feature works out of the box without any backend setup. Swap this
 * out entirely once Purpose Pen's real persistence layer exists.
 */

const LOCAL_PREFIX = "purpose-pen:recommendations";

function localKey(uid: string, collectionName: string) {
  return `${LOCAL_PREFIX}:${uid}:${collectionName}`;
}

function readLocalList<T>(uid: string, collectionName: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(localKey(uid, collectionName));
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function writeLocalList<T>(uid: string, collectionName: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localKey(uid, collectionName), JSON.stringify(items));
}

export async function listItems<T extends { id: string }>(
  uid: string,
  collectionName: string
): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    const snapshot = await getDocs(collection(db, "users", uid, collectionName));
    return snapshot.docs.map((d) => d.data() as T);
  }
  return readLocalList<T>(uid, collectionName);
}

export async function getItem<T extends { id: string }>(
  uid: string,
  collectionName: string,
  id: string
): Promise<T | null> {
  if (isFirebaseConfigured && db) {
    const snap = await getDoc(doc(db, "users", uid, collectionName, id));
    return snap.exists() ? (snap.data() as T) : null;
  }
  const items = readLocalList<T>(uid, collectionName);
  return items.find((item) => item.id === id) ?? null;
}

export async function saveItem<T extends { id: string }>(
  uid: string,
  collectionName: string,
  item: T
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, "users", uid, collectionName, item.id), item);
    return;
  }
  const items = readLocalList<T>(uid, collectionName);
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  writeLocalList(uid, collectionName, items);
}

export async function deleteItem(
  uid: string,
  collectionName: string,
  id: string
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "users", uid, collectionName, id));
    return;
  }
  const items = readLocalList<{ id: string }>(uid, collectionName);
  writeLocalList(uid, collectionName, items.filter((item) => item.id !== id));
}
