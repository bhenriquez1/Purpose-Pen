"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useRecommenders } from "@/lib/recommendations/hooks";
import { STATUS_LABELS, type RecommendationStatus } from "@/types/recommendation";

const OVERVIEW_LINKS = [
  {
    href: "/recommendations/recommenders",
    title: "Recommender Tracker",
    description: "Manage recommenders, statuses, deadlines, and follow-ups.",
  },
  {
    href: "/recommendations/applicant-profile",
    title: "Applicant Profile & Recommender Packet",
    description:
      "Collect achievements, volunteer work, shadowing, leadership, and generate a recommender packet.",
  },
  {
    href: "/recommendations/analyzer",
    title: "Letter Analyzer",
    description: "Paste a letter to check strength, specificity, and credibility.",
  },
  {
    href: "/recommendations/committee-packet",
    title: "Committee Packet Builder",
    description: "Combine letters, CV, personal statement, and summaries into one packet.",
  },
  {
    href: "/recommendations/workflow",
    title: "Dental Applicant Workflow",
    description: "Step-by-step workflow from CV to exported application packet.",
  },
];

export default function RecommendationsOverview() {
  const { recommenders, loading, error } = useRecommenders();

  const counts = recommenders.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Status at a glance
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : recommenders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            No recommenders yet.{" "}
            <Link href="/recommendations/recommenders" className="underline">
              Add your first recommender
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div
                key={status}
                className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800"
              >
                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {counts[status as RecommendationStatus] ?? 0}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {OVERVIEW_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition hover:border-zinc-400 hover:shadow-md dark:hover:border-zinc-600">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{link.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
