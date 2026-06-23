"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Select, Textarea } from "@/components/ui/Field";
import {
  VOICE_PROFILE_LABELS,
  type VoiceCapture,
  type VoiceProfileType,
} from "@/types/recommendation";

const VOICE_PROFILES = Object.entries(VOICE_PROFILE_LABELS) as [VoiceProfileType, string][];

const PROMPTS = [
  "How would you naturally describe this applicant?",
  "What stands out most about this person?",
  "Why would you recommend them?",
  "How would you describe them to a colleague?",
];

export function VoiceCaptureForm({
  initialValue,
  onSave,
}: {
  initialValue: VoiceCapture | null;
  onSave: (voice: VoiceCapture) => Promise<void>;
}) {
  const [naturalDescription, setNaturalDescription] = useState(
    initialValue?.naturalDescription ?? ""
  );
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileType>(
    initialValue?.voiceProfile ?? "custom"
  );
  const [writingSample, setWritingSample] = useState(initialValue?.writingSample ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ naturalDescription, voiceProfile, writingSample: writingSample || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save voice capture");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Before generating or improving a letter, capture the recommender&apos;s natural voice.
        Write 2–5 sentences in your own words.
      </p>
      <ul className="list-inside list-disc text-sm text-zinc-500 dark:text-zinc-400">
        {PROMPTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      <FieldGroup label="In your own words">
        <Textarea
          value={naturalDescription}
          onChange={(e) => setNaturalDescription(e.target.value)}
          placeholder="Write 2-5 sentences describing the applicant naturally, the way you'd talk about them..."
        />
      </FieldGroup>

      <FieldGroup label="Voice profile">
        <Select
          value={voiceProfile}
          onChange={(e) => setVoiceProfile(e.target.value as VoiceProfileType)}
        >
          {VOICE_PROFILES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Optional: paste a prior writing sample (email, letter, evaluation)">
        <Textarea
          value={writingSample}
          onChange={(e) => setWritingSample(e.target.value)}
          placeholder="Paste a sample for additional voice reference..."
        />
      </FieldGroup>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSave} loading={saving}>
        Save Voice Capture
      </Button>
    </div>
  );
}
