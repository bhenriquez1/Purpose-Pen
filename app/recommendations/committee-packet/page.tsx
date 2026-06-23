"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Textarea } from "@/components/ui/Field";
import { useApplicantProfile, useLetterDrafts, useRecommenders } from "@/lib/recommendations/hooks";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { saveCommitteePacket } from "@/lib/recommendations/repository";
import { buildCommitteePacketMarkdown, downloadMarkdown } from "@/lib/recommendations/documents";
import type { CommitteePacketSelection } from "@/types/recommendation";

const TOGGLE_OPTIONS: { key: keyof CommitteePacketSelection; label: string }[] = [
  { key: "includeResume", label: "Resume / CV" },
  { key: "includePersonalStatement", label: "Personal Statement" },
  { key: "includeAchievementsSummary", label: "Achievements Summary" },
  { key: "includeVolunteerSummary", label: "Volunteer Summary" },
  { key: "includeShadowingSummary", label: "Shadowing Summary" },
  { key: "includeLeadershipSummary", label: "Leadership Summary" },
  { key: "includeWorkHistorySummary", label: "Work History Summary" },
];

export default function CommitteePacketPage() {
  const { uid } = useAuth();
  const { recommenders, loading: recommendersLoading } = useRecommenders();
  const { drafts } = useLetterDrafts();
  const { profile } = useApplicantProfile();

  const [selection, setSelection] = useState<CommitteePacketSelection>({
    recommenderIds: [],
    includeResume: true,
    includePersonalStatement: true,
    includeAchievementsSummary: true,
    includeVolunteerSummary: true,
    includeShadowingSummary: true,
    includeLeadershipSummary: true,
    includeWorkHistorySummary: true,
  });
  const [resume, setResume] = useState("");
  const [personalStatement, setPersonalStatement] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRecommender = (id: string) => {
    setSelection((prev) => ({
      ...prev,
      recommenderIds: prev.recommenderIds.includes(id)
        ? prev.recommenderIds.filter((r) => r !== id)
        : [...prev.recommenderIds, id],
    }));
  };

  const toggleOption = (key: keyof CommitteePacketSelection) => {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBuild = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await saveCommitteePacket(uid, selection);

      const selectedRecommenders = recommenders.filter((r) =>
        selection.recommenderIds.includes(r.id)
      );
      const letters = selectedRecommenders.map((r) => {
        const latestDraft = drafts.find((d) => d.recommenderId === r.id);
        return { recommenderName: r.name, content: latestDraft?.content ?? "(no draft saved yet)" };
      });

      const adjustedProfile = {
        ...profile,
        achievements: selection.includeAchievementsSummary ? profile.achievements : [],
        volunteerExperiences: selection.includeVolunteerSummary ? profile.volunteerExperiences : [],
        shadowingExperiences: selection.includeShadowingSummary ? profile.shadowingExperiences : [],
        leadership: selection.includeLeadershipSummary ? profile.leadership : [],
        workHistory: selection.includeWorkHistorySummary ? profile.workHistory : [],
      };

      const markdown = buildCommitteePacketMarkdown({
        applicantProfile: adjustedProfile,
        recommenders: selectedRecommenders,
        letters,
        resume: selection.includeResume ? resume : undefined,
        personalStatement: selection.includePersonalStatement ? personalStatement : undefined,
      });

      downloadMarkdown(`${profile.applicantName || "applicant"}-committee-packet.md`, markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build committee packet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Select Recommenders
        </h2>
        {recommendersLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recommenders.map((r) => (
              <button
                key={r.id}
                onClick={() => toggleRecommender(r.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selection.recommenderIds.includes(r.id)
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Include in Packet
        </h2>
        <div className="flex flex-wrap gap-2">
          {TOGGLE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleOption(opt.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selection[opt.key]
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selection.includeResume && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Resume / CV content
            </label>
            <Textarea
              className="min-h-32"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste resume/CV content..."
            />
          </div>
        )}

        {selection.includePersonalStatement && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Personal statement content
            </label>
            <Textarea
              className="min-h-32"
              value={personalStatement}
              onChange={(e) => setPersonalStatement(e.target.value)}
              placeholder="Paste personal statement content..."
            />
          </div>
        )}
      </Card>

      <Button onClick={handleBuild} loading={saving} disabled={selection.recommenderIds.length === 0}>
        Build Committee Packet
      </Button>
    </div>
  );
}
