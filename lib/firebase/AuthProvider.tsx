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
 * Local-only escape hatch so the app can be previewed without Firebase set up.
 * Requires NODE_ENV !== "production" so it can never take effect in a real deployment,
 * even if the env var is accidentally left set.
 */
const devBypassAuth =
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true" && process.env.NODE_ENV !== "production";

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
        uid: devBypassAuth ? "dev-bypass-user" : user?.uid ?? "",
        email: devBypassAuth ? "dev@local" : user?.email ?? null,
        status,
        role,
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
