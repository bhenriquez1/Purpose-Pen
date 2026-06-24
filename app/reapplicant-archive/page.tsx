"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReapplicantCycleForm } from "@/components/recommendations/ReapplicantCycleForm";
import { useReapplicantCycles } from "@/lib/recommendations/hooks";

export default function ReapplicantArchivePage() {
  const { cycles, loading, error, upsert, remove } = useReapplicantCycles();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Past Application Cycles
        </h2>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "Add Cycle"}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showForm && (
        <Card>
          <ReapplicantCycleForm
            onSubmit={async (values) => {
              await upsert(values);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : cycles.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No past cycles recorded yet. Add a cycle to start building your reapplicant archive.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {cycles.map((cycle) => (
            <Card key={cycle.id}>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {cycle.cycleLabel}
                </h3>
                <button
                  onClick={() => remove(cycle.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>
              {cycle.schoolsApplied.length > 0 && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Schools: {cycle.schoolsApplied.join(", ")}
                </p>
              )}
              {cycle.outcome && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Outcome: {cycle.outcome}
                </p>
              )}
              {cycle.lessonsLearned && (
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">Lessons learned:</span> {cycle.lessonsLearned}
                </p>
              )}
              {cycle.whatToImproveNextCycle && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">Improve next cycle:</span>{" "}
                  {cycle.whatToImproveNextCycle}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
