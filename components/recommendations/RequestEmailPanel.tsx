"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldGroup, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { saveRequestEmail } from "@/lib/recommendations/repository";
import { logClientEvent } from "@/lib/audit/client";
import type { EmailTone, Recommender, RequestEmailType } from "@/types/recommendation";

const TYPES: { value: RequestEmailType; label: string }[] = [
  { value: "request", label: "Request" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "thank_you", label: "Thank You" },
];

const TONES: { value: EmailTone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "warm", label: "Warm" },
  { value: "concise", label: "Concise" },
  { value: "grateful", label: "Grateful" },
];

export function RequestEmailPanel({
  uid,
  recommender,
  applicantName,
}: {
  uid: string;
  recommender: Recommender;
  applicantName: string;
}) {
  const [type, setType] = useState<RequestEmailType>("request");
  const [tone, setTone] = useState<EmailTone>("warm");
  const [content, setContent] = useState("");
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
      const response = await fetch("/api/recommendations/request-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          recommender,
          type,
          tone,
          applicantName: applicantName || "the applicant",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate email");
      }
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveRequestEmail(uid, { recommenderId: recommender.id, type, tone, content });
      await logClientEvent(getIdToken, "save_request_email", { recommenderId: recommender.id, type });
      setSavedMessage("Email saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save email");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Email type">
          <Select value={type} onChange={(e) => setType(e.target.value as RequestEmailType)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Tone">
          <Select value={tone} onChange={(e) => setTone(e.target.value as EmailTone)}>
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <Button onClick={handleGenerate} loading={generating}>
        Generate Email
      </Button>

      {error && <ErrorMessage message={error} />}

      {content && (
        <div className="space-y-3">
          <FieldGroup label="Email (editable)">
            <Textarea
              className="min-h-48"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FieldGroup>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving} variant="secondary">
              Save Email
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
