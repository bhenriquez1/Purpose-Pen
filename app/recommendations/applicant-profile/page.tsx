"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldGroup, Input } from "@/components/ui/Field";
import { ListField } from "@/components/ui/ListField";
import { useApplicantProfile } from "@/lib/recommendations/hooks";
import { buildRecommenderPacketMarkdown, downloadMarkdown } from "@/lib/recommendations/documents";
import type { ApplicantProfile } from "@/types/recommendation";

export default function ApplicantProfilePage() {
  const { profile, loading, error, save } = useApplicantProfile();
  const [draft, setDraft] = useState<ApplicantProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local draft once profile loads
    if (profile) setDraft(profile);
  }, [profile]);

  if (loading || !draft) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  const update = <K extends keyof ApplicantProfile>(key: K, value: ApplicantProfile[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      setSavedMessage("Saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePacket = () => {
    downloadMarkdown(
      `${draft.applicantName || "applicant"}-recommender-packet.md`,
      buildRecommenderPacketMarkdown(draft)
    );
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <Card className="space-y-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Applicant Profile
        </h2>

        <FieldGroup label="Applicant name">
          <Input
            value={draft.applicantName}
            onChange={(e) => update("applicantName", e.target.value)}
          />
        </FieldGroup>

        <ListField
          label="Achievements"
          items={draft.achievements}
          onChange={(items) => update("achievements", items)}
        />
        <ListField
          label="Volunteer Experiences"
          items={draft.volunteerExperiences}
          onChange={(items) => update("volunteerExperiences", items)}
        />
        <ListField
          label="Shadowing Experiences"
          items={draft.shadowingExperiences}
          onChange={(items) => update("shadowingExperiences", items)}
        />
        <ListField
          label="Work History"
          items={draft.workHistory}
          onChange={(items) => update("workHistory", items)}
        />
        <ListField
          label="Leadership Experience"
          items={draft.leadership}
          onChange={(items) => update("leadership", items)}
        />
        <ListField
          label="Awards and Honors"
          items={draft.awards}
          onChange={(items) => update("awards", items)}
        />

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving}>
            Save Profile
          </Button>
          {savedMessage && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              {savedMessage}
            </span>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recommender Packet Generator
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Generate a clean packet from the profile above to send to professors, dentists,
          employers, or mentors.
        </p>
        <Button className="mt-4" variant="secondary" onClick={handleGeneratePacket}>
          Generate Recommender Packet
        </Button>
      </Card>
    </div>
  );
}
