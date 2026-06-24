"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { saveLetterDraft } from "@/lib/recommendations/repository";
import { logClientEvent } from "@/lib/audit/client";
import {
  LETTER_TYPE_LABELS,
  type ApplicantProfile,
  type GuidedLetterAnswers,
  type LetterType,
  type Recommender,
} from "@/types/recommendation";

const LETTER_TYPES = Object.entries(LETTER_TYPE_LABELS) as [LetterType, string][];

type Mode = "choose" | "notes" | "guided";

const TONE_OPTIONS = ["formal", "warm", "clinical", "academic", "strong", "concise"];

const GUIDED_QUESTIONS: { key: keyof GuidedLetterAnswers; label: string; multiline?: boolean }[] = [
  { key: "applicantName", label: "Applicant's full name" },
  { key: "recommenderNameTitle", label: "Your name and title" },
  { key: "relationshipToApplicant", label: "Your relationship to the applicant" },
  { key: "howLongKnown", label: "How long have you known the applicant?" },
  { key: "settingKnown", label: "In what setting do you know them? (class, clinic, work, lab...)" },
  { key: "strongestQualities", label: "What are the applicant's strongest qualities?", multiline: true },
  {
    key: "realExampleOrMemory",
    label: "Share a real example or specific memory that shows this",
    multiline: true,
  },
  { key: "whyRecommend", label: "Why do you recommend this applicant?", multiline: true },
  { key: "programSchoolType", label: "What program or school type is this for?" },
];

const emptyGuidedAnswers: GuidedLetterAnswers = {
  applicantName: "",
  recommenderNameTitle: "",
  relationshipToApplicant: "",
  howLongKnown: "",
  settingKnown: "",
  strongestQualities: "",
  realExampleOrMemory: "",
  whyRecommend: "",
  programSchoolType: "",
  desiredTone: "formal",
};

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
  const [refining, setRefining] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { getIdToken } = useAuth();

  const [mode, setMode] = useState<Mode>("choose");
  const [notes, setNotes] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<GuidedLetterAnswers>({
    ...emptyGuidedAnswers,
    applicantName: applicantProfile.applicantName || "",
    recommenderNameTitle: recommender.name ? `${recommender.name}, ${recommender.role}` : "",
    relationshipToApplicant: recommender.relationshipToApplicant || "",
  });

  const updateGuided = <K extends keyof GuidedLetterAnswers>(key: K, value: GuidedLetterAnswers[K]) =>
    setGuidedAnswers((prev) => ({ ...prev, [key]: value }));

  const generateDraft = async (body: Record<string, unknown>) => {
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
        body: JSON.stringify(body),
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

  const handleGenerateFromProfile = () =>
    generateDraft({
      mode: "profile",
      recommender,
      letterType,
      applicantProfile,
      applicantName: applicantProfile.applicantName || "the applicant",
    });

  const handleImproveNotes = () =>
    generateDraft({
      mode: "notes",
      recommender,
      letterType,
      applicantProfile,
      applicantName: applicantProfile.applicantName || "the applicant",
      notes,
    });

  const handleGenerateFromGuided = () =>
    generateDraft({
      mode: "guided",
      recommender,
      letterType,
      applicantProfile,
      applicantName: guidedAnswers.applicantName || applicantProfile.applicantName || "the applicant",
      guidedAnswers,
    });

  const handleRefine = async (action: "professional" | "shorten" | "strengthen", label: string) => {
    setRefining(label);
    setError(null);
    setSavedMessage(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/recommendations/refine-letter", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ content, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to refine letter");
      }
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refine letter");
    } finally {
      setRefining(null);
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

      {error && <ErrorMessage message={error} />}

      {mode === "choose" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Already have voice and personality details filled in for this recommender? Generate a
            draft straight from that. Otherwise, pick one of the options below — built for
            recommenders who are busy, don&apos;t like writing, or don&apos;t know how to start.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerateFromProfile} loading={generating} variant="secondary">
              Generate Letter Draft (from voice &amp; personality)
            </Button>
            <Button onClick={() => setMode("notes")}>Improve Grammar but Keep My Voice</Button>
            <Button onClick={() => setMode("guided")}>Help Me Write This Letter</Button>
          </div>
        </div>
      )}

      {mode === "notes" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Write 2-5 sentences in your own words — we&apos;ll improve the grammar, keep your
              voice, and expand it into a complete letter.
            </h3>
            <button
              onClick={() => setMode("choose")}
              className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            >
              ← Back
            </button>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Jordan was one of the most reliable students I've worked with in clinic. They picked up procedures quickly and always showed up prepared..."
          />
          <Button onClick={handleImproveNotes} loading={generating} disabled={!notes.trim()}>
            Improve Grammar but Keep My Voice
          </Button>
        </div>
      )}

      {mode === "guided" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Answer a few simple questions — you don&apos;t need to write a draft. We&apos;ll
              generate the full letter from your answers.
            </h3>
            <button
              onClick={() => setMode("choose")}
              className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
            >
              ← Back
            </button>
          </div>

          {GUIDED_QUESTIONS.map((q) => (
            <FieldGroup key={q.key} label={q.label}>
              {q.multiline ? (
                <Textarea
                  value={guidedAnswers[q.key]}
                  onChange={(e) => updateGuided(q.key, e.target.value)}
                />
              ) : (
                <Input
                  value={guidedAnswers[q.key]}
                  onChange={(e) => updateGuided(q.key, e.target.value)}
                />
              )}
            </FieldGroup>
          ))}

          <FieldGroup label="Desired tone">
            <Select
              value={guidedAnswers.desiredTone}
              onChange={(e) => updateGuided("desiredTone", e.target.value)}
            >
              {TONE_OPTIONS.map((tone) => (
                <option key={tone} value={tone}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <Button onClick={handleGenerateFromGuided} loading={generating}>
            Generate Full Letter From My Answers
          </Button>
        </div>
      )}

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

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleRefine("professional", "professional")}
              loading={refining === "professional"}
              variant="secondary"
            >
              Make It More Professional
            </Button>
            <Button
              onClick={() => handleRefine("shorten", "shorten")}
              loading={refining === "shorten"}
              variant="secondary"
            >
              Shorten Letter
            </Button>
            <Button
              onClick={() => handleRefine("strengthen", "strengthen")}
              loading={refining === "strengthen"}
              variant="secondary"
            >
              Strengthen Letter
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving}>
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
