"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import {
  deletePersonalStatement,
  listPersonalStatements,
  savePersonalStatement,
} from "@/lib/recommendations/repository";
import type { PersonalStatement } from "@/types/recommendation";

export function usePersonalStatements() {
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const [statements, setStatements] = useState<PersonalStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listPersonalStatements(uid);
      setStatements(items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load personal statements");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    refresh();
  }, [authLoading, refresh]);

  const upsert = useCallback(
    async (statement: Omit<PersonalStatement, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
      const saved = await savePersonalStatement(uid, statement);
      await refresh();
      return saved;
    },
    [uid, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deletePersonalStatement(uid, id);
      await refresh();
    },
    [uid, refresh]
  );

  return { statements, loading: loading || authLoading, error, refresh, upsert, remove };
}
