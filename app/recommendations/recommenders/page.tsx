"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  RecommenderForm,
  type RecommenderFormValues,
} from "@/components/recommendations/RecommenderForm";
import { newId } from "@/lib/recommendations/repository";
import { useRecommenders } from "@/lib/recommendations/hooks";

export default function RecommendersPage() {
  const { recommenders, loading, error, upsert, remove } = useRecommenders();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (values: RecommenderFormValues) => {
    await upsert({
      id: newId(),
      ...values,
      lastFollowUpDate: null,
      voiceCapture: null,
      personality: null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recommendation Tracker
        </h2>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "Add Recommender"}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showForm && (
        <Card>
          <RecommenderForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <p className="p-6 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : recommenders.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
            No recommenders yet. Add one to get started.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Follow-Up</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recommenders.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/recommendations/recommenders/${r.id}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.role}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.institution || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.deadline ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.lastFollowUpDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="text-xs text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
