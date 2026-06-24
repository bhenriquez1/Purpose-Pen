"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  RecommenderForm,
  type RecommenderFormValues,
} from "@/components/recommendations/RecommenderForm";
import { PersonalityForm } from "@/components/recommendations/PersonalityForm";
import { VoiceCaptureForm } from "@/components/recommendations/VoiceCaptureForm";
import { LetterDraftPanel } from "@/components/recommendations/LetterDraftPanel";
import { RequestEmailPanel } from "@/components/recommendations/RequestEmailPanel";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useApplicantProfile } from "@/lib/recommendations/hooks";
import { getRecommender, saveRecommender } from "@/lib/recommendations/repository";
import type {
  PersonalityProfile,
  Recommender,
  VoiceCapture,
} from "@/types/recommendation";

const TABS = ["Details", "Personality & Attributes", "Voice Capture", "Letter Draft", "Request Emails"] as const;

export default function RecommenderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { uid, status } = useAuth();
  const authLoading = status !== "allowed";
  const { profile: applicantProfile } = useApplicantProfile();

  const [recommender, setRecommender] = useState<Recommender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Details");

  const load = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      const result = await getRecommender(uid, params.id);
      if (!result) {
        setError("Recommender not found.");
      } else {
        setRecommender(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommender");
    } finally {
      setLoading(false);
    }
  }, [uid, params.id, authLoading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    load();
  }, [load]);

  const handleDetailsSave = async (values: RecommenderFormValues) => {
    if (!recommender) return;
    const updated = await saveRecommender(uid, { ...recommender, ...values });
    setRecommender(updated);
  };

  const handlePersonalitySave = async (personality: PersonalityProfile) => {
    if (!recommender) return;
    const updated = await saveRecommender(uid, { ...recommender, personality });
    setRecommender(updated);
  };

  const handleVoiceSave = async (voiceCapture: VoiceCapture) => {
    if (!recommender) return;
    const updated = await saveRecommender(uid, { ...recommender, voiceCapture });
    setRecommender(updated);
  };

  if (loading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  if (error || !recommender) {
    return <ErrorMessage message={error ?? "Recommender not found."} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/letter-builder/recommenders")}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← Back to tracker
          </button>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {recommender.name}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {recommender.role} · {recommender.institution}
          </p>
        </div>
        <StatusBadge status={recommender.status} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        {activeTab === "Details" && (
          <RecommenderForm
            initialValues={recommender}
            onSubmit={handleDetailsSave}
            submitLabel="Update Recommender"
          />
        )}
        {activeTab === "Personality & Attributes" && (
          <PersonalityForm
            recommenderType={recommender.recommenderType}
            initialValue={recommender.personality}
            onSave={handlePersonalitySave}
          />
        )}
        {activeTab === "Voice Capture" && (
          <VoiceCaptureForm initialValue={recommender.voiceCapture} onSave={handleVoiceSave} />
        )}
        {activeTab === "Letter Draft" && applicantProfile && (
          <LetterDraftPanel uid={uid} recommender={recommender} applicantProfile={applicantProfile} />
        )}
        {activeTab === "Request Emails" && (
          <RequestEmailPanel
            uid={uid}
            recommender={recommender}
            applicantName={applicantProfile?.applicantName ?? ""}
          />
        )}
      </Card>
    </div>
  );
}
