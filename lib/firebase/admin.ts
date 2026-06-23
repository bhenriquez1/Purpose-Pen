import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-only Firebase Admin SDK. Used to verify ID tokens and write audit
 * logs that must not be tamperable from the client. Configure via a
 * service account: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 * FIREBASE_ADMIN_PRIVATE_KEY.
 */

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let app: App | null = null;
if (isAdminConfigured) {
  app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
}

export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;

export class AdminNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }
}

export async function verifyIdToken(idToken: string) {
  if (!adminAuth) {
    throw new AdminNotConfiguredError();
  }
  return adminAuth.verifyIdToken(idToken);
}
