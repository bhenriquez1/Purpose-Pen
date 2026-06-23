"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

/**
 * Escape hatch so the app can be previewed without Firebase set up.
 * Deliberately works even when NODE_ENV=="production" (Next.js's `next start`
 * always forces that), since this also has to work on Render's production
 * build. Safe only because proxy.ts puts a SITE_PASSWORD Basic Auth wall in
 * front of the whole app for any publicly reachable deployment — never set
 * this flag on a deployment without SITE_PASSWORD also set.
 */
const devBypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

const DEV_BYPASS_USER = {
  id: "dev-user",
  email: "developer@purposepen.local",
  role: "owner" as const,
};

export type AccessStatus =
  | "not_configured"
  | "checking"
  | "unauthenticated"
  | "pending_approval"
  | "allowed";

export type AccessRole = "owner" | "member" | null;

interface AuthContextValue {
  user: User | null;
  uid: string;
  email: string | null;
  status: AccessStatus;
  role: AccessRole;
  isDevBypass: boolean;
  getIdToken: () => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  uid: "",
  email: null,
  status: "not_configured",
  role: null,
  isDevBypass: false,
  getIdToken: async () => null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AccessStatus>(
    devBypassAuth ? "allowed" : isFirebaseConfigured ? "checking" : "not_configured"
  );
  const [role, setRole] = useState<AccessRole>(devBypassAuth ? "owner" : null);

  useEffect(() => {
    if (devBypassAuth || !isFirebaseConfigured || !auth) {
      return;
    }
    const activeAuth = auth;

    const unsubscribe = onAuthStateChanged(activeAuth, async (current) => {
      setUser(current);
      if (!current) {
        setRole(null);
        setStatus("unauthenticated");
        return;
      }

      setStatus("checking");
      try {
        const idToken = await current.getIdToken();
        const response = await fetch("/api/auth/access", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await response.json();
        if (response.ok && data.allowed) {
          setRole(data.role);
          setStatus("allowed");
        } else {
          setRole(null);
          setStatus("pending_approval");
        }
      } catch {
        setRole(null);
        setStatus("pending_approval");
      }
    });

    return () => unsubscribe();
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication is not configured.");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication is not configured.");
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: devBypassAuth ? DEV_BYPASS_USER.id : user?.uid ?? "",
        email: devBypassAuth ? DEV_BYPASS_USER.email : user?.email ?? null,
        status,
        role: devBypassAuth ? DEV_BYPASS_USER.role : role,
        isDevBypass: devBypassAuth,
        getIdToken,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
