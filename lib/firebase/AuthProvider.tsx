"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

/**
 * Purpose Pen does not yet have a real authentication system in this repo.
 * This provider signs the user in anonymously so Firestore data can be
 * scoped per-user. Swap this out for real sign-in (email/password, Google,
 * etc.) once Purpose Pen's actual auth flow exists.
 */
const LOCAL_UID = "local-user";

interface AuthContextValue {
  user: User | null;
  uid: string;
  loading: boolean;
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  uid: LOCAL_UID,
  loading: true,
  configured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    const activeAuth = auth;

    const unsubscribe = onAuthStateChanged(activeAuth, async (current) => {
      if (current) {
        setUser(current);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(activeAuth);
        } catch {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user?.uid ?? LOCAL_UID,
        loading,
        configured: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
