"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldGroup, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { saveLetterDraft } from "@/lib/recommendations/repository";
import { logClientEvent } from "@/lib/audit/client";
import {
  LETTER_TYPE_LABELS,
  type ApplicantProfile,
  type LetterType,
  type Recommender,
} from "@/types/recommendation";

const LETTER_TYPES = Object.entries(LETTER_TYPE_LABELS) as [LetterType, string][];

export function LetterDraftPanel({
  uid,
  recommender,
  applicantProfile,
}: {
  uid: string;
  recommender: Recommender;
  applicantProfile: ApplicantProfile;
}) {
  const [letterType, setLetterType] = useState<LetterType>("dental_school");
  const [content, setContent] = useState("");
  const [voiceMatchScore, setVoiceMatchScore] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { getIdToken } = useAuth();

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSavedMessage(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/recommendations/draft-letter", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          recommender,
          letterType,
          applicantProfile,
          applicantName: applicantProfile.applicantName || "the applicant",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate letter draft");
      }
      setContent(data.content);
      setVoiceMatchScore(data.voiceMatchScore ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate letter draft");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveLetterDraft(uid, {
        recommenderId: recommender.id,
        letterType,
        content,
        voiceMatchScore,
      });
      await logClientEvent(getIdToken, "save_letter_draft", { recommenderId: recommender.id });
      setSavedMessage("Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <FieldGroup label="Letter type">
        <Select value={letterType} onChange={(e) => setLetterType(e.target.value as LetterType)}>
          {LETTER_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <Button onClick={handleGenerate} loading={generating}>
        Generate Letter Draft
      </Button>

      {error && <ErrorMessage message={error} />}

      {content && (
        <div className="space-y-3">
          <FieldGroup label="Draft (editable)">
            <Textarea
              className="min-h-64"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FieldGroup>

          {voiceMatchScore !== null && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Voice Match Score: <span className="font-semibold">{voiceMatchScore}/100</span>
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving} variant="secondary">
              Save Draft
            </Button>
            {savedMessage && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                {savedMessage}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
