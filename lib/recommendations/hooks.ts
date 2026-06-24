"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import {
  deleteReapplicantCycle,
  deleteRecommender,
  getApplicantProfile,
  listLetterDrafts,
  listReapplicantCycles,
  listRecommenders,
  saveApplicantProfile,
  saveReapplicantCycle,
  saveRecommender,
} from "./repository";
import type {
  ApplicantProfile,
  LetterDraft,
  ReapplicantCycle,
  Recommender,
} from "@/types/recommendation";

export function useRecommenders() {
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const [recommenders, setRecommenders] = useState<Recommender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listRecommenders(uid);
      setRecommenders(
        items.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommenders");
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
    async (recommender: Omit<Recommender, "createdAt" | "updatedAt"> & { createdAt?: string }) => {
      const saved = await saveRecommender(uid, recommender);
      await refresh();
      return saved;
    },
    [uid, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteRecommender(uid, id);
      await refresh();
    },
    [uid, refresh]
  );

  return { recommenders, loading: loading || authLoading, error, refresh, upsert, remove, uid };
}

export function useApplicantProfile() {
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApplicantProfile(uid);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applicant profile");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    refresh();
  }, [authLoading, refresh]);

  const save = useCallback(
    async (next: ApplicantProfile) => {
      await saveApplicantProfile(uid, next);
      setProfile(next);
    },
    [uid]
  );

  return { profile, loading: loading || authLoading, error, save, refresh, uid };
}

export function useLetterDrafts() {
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const [drafts, setDrafts] = useState<LetterDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listLetterDrafts(uid);
      setDrafts(items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load letter drafts");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    refresh();
  }, [authLoading, refresh]);

  return { drafts, loading: loading || authLoading, error, refresh, uid };
}

export function useReapplicantCycles() {
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const [cycles, setCycles] = useState<ReapplicantCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listReapplicantCycles(uid);
      setCycles(items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reapplicant archive");
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
    async (cycle: Omit<ReapplicantCycle, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
      const saved = await saveReapplicantCycle(uid, cycle);
      await refresh();
      return saved;
    },
    [uid, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteReapplicantCycle(uid, id);
      await refresh();
    },
    [uid, refresh]
  );

  return { cycles, loading: loading || authLoading, error, refresh, upsert, remove, uid };
}
