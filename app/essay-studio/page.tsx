"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { usePersonalStatements } from "@/lib/essays/hooks";
import { logClientEvent } from "@/lib/audit/client";
import { downloadMarkdown } from "@/lib/recommendations/documents";

const COMING_SOON = [
  "Essay Brainstorming",
  "Essay Outlining",
  "AI Feedback",
  "Essay Analyzer",
  "Supplemental Essays",
  "School-Specific Essays",
  "Scholarship Essays",
  "Character and Activity Descriptions",
  "Final Export",
];

export default function EssayStudioPage() {
  const { getIdToken } = useAuth();
  const { statements, loading, error, upsert } = usePersonalStatements();

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setSavedMessage(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/essays/draft-statement", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ topic, notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate draft");
      }
      setContent(data.content);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setGenError(null);
    try {
      await upsert({ topic, content });
      await logClientEvent(getIdToken, "save_personal_statement");
      setSavedMessage("Saved.");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    downloadMarkdown(
      "personal-statement.md",
      `# Personal Statement\n\n${topic ? `**Topic:** ${topic}\n\n` : ""}${content}`
    );
    void logClientEvent(getIdToken, "export_personal_statement");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Personal Statement Builder
        </h2>
        <FieldGroup label="Topic or prompt">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Brainstorming notes (experiences, anecdotes, themes)">
          <Textarea className="min-h-32" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldGroup>

        <Button onClick={handleGenerate} loading={generating} disabled={!topic.trim()}>
          Generate Draft
        </Button>

        {genError && <ErrorMessage message={genError} />}

        {content && (
          <div className="space-y-3">
            <FieldGroup label="Draft (editable)">
              <Textarea
                className="min-h-64"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </FieldGroup>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} loading={saving} variant="secondary">
                Save Draft
              </Button>
              <Button onClick={handleExport} variant="ghost">
                Export
              </Button>
              {savedMessage && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  {savedMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Saved Drafts</h2>
        {error && <ErrorMessage message={error} />}
        {loading ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : statements.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No saved drafts yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {statements.map((s) => (
              <li key={s.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">{s.topic || "Untitled"}</span>{" "}
                <span className="text-zinc-400 dark:text-zinc-500">
                  — updated {new Date(s.updatedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Coming Soon</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The rest of the Essay Studio is on the roadmap:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {COMING_SOON.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
