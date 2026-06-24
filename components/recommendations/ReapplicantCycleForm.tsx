"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import type { ReapplicantCycle } from "@/types/recommendation";

export type ReapplicantCycleFormValues = Pick<
  ReapplicantCycle,
  | "cycleLabel"
  | "schoolsApplied"
  | "outcome"
  | "feedbackReceived"
  | "lessonsLearned"
  | "whatToImproveNextCycle"
  | "notes"
>;

const emptyValues: ReapplicantCycleFormValues = {
  cycleLabel: "",
  schoolsApplied: [],
  outcome: "",
  feedbackReceived: "",
  lessonsLearned: "",
  whatToImproveNextCycle: "",
  notes: "",
};

export function ReapplicantCycleForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Cycle",
}: {
  initialValues?: Partial<ReapplicantCycleFormValues>;
  onSubmit: (values: ReapplicantCycleFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ReapplicantCycleFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [schoolsText, setSchoolsText] = useState(
    (initialValues?.schoolsApplied ?? []).join(", ")
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ReapplicantCycleFormValues>(
    key: K,
    value: ReapplicantCycleFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...values,
        schoolsApplied: schoolsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save cycle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup label="Cycle (e.g. 2023-2024 Cycle)">
        <Input
          required
          value={values.cycleLabel}
          onChange={(e) => update("cycleLabel", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Schools applied (comma-separated)">
        <Input value={schoolsText} onChange={(e) => setSchoolsText(e.target.value)} />
      </FieldGroup>
      <FieldGroup label="Outcome">
        <Input
          value={values.outcome}
          onChange={(e) => update("outcome", e.target.value)}
          placeholder="e.g. Rejected from all, waitlisted at 2, accepted at 0"
        />
      </FieldGroup>
      <FieldGroup label="Feedback received (interviewer notes, admissions feedback, etc.)">
        <Textarea
          value={values.feedbackReceived}
          onChange={(e) => update("feedbackReceived", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Lessons learned">
        <Textarea
          value={values.lessonsLearned}
          onChange={(e) => update("lessonsLearned", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="What to improve next cycle">
        <Textarea
          value={values.whatToImproveNextCycle}
          onChange={(e) => update("whatToImproveNextCycle", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Additional notes">
        <Textarea value={values.notes} onChange={(e) => update("notes", e.target.value)} />
      </FieldGroup>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
