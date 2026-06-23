"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/firebase/AuthProvider";

const STEPS = [
  { id: "cv", label: "Build CV", href: "/recommendations/applicant-profile" },
  {
    id: "personal_statement",
    label: "Build personal statement",
    href: "/recommendations/committee-packet",
  },
  {
    id: "request_letters",
    label: "Request letters of recommendation",
    href: "/recommendations/recommenders",
  },
  {
    id: "track_letters",
    label: "Track letter status",
    href: "/recommendations/recommenders",
  },
  {
    id: "supplemental_essays",
    label: "Generate supplemental essays",
    href: "/recommendations/analyzer",
  },
  {
    id: "export_packet",
    label: "Export application packet",
    href: "/recommendations/committee-packet",
  },
];

function storageKey(uid: string) {
  return `purpose-pen:recommendations:${uid}:workflow`;
}

export default function DentalWorkflowPage() {
  const { uid } = useAuth();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey(uid));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setCompleted(raw ? JSON.parse(raw) : {});
  }, [uid]);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(storageKey(uid), JSON.stringify(next));
      return next;
    });
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Dental Applicant Workflow
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This workflow also applies to medical, PA, nursing, graduate, and scholarship applicants.
      </p>

      <ol className="mt-6 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(completed[step.id])}
                onChange={() => toggle(step.id)}
                className="h-4 w-4"
              />
              <span
                className={
                  completed[step.id]
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-900 dark:text-zinc-50"
                }
              >
                {index + 1}. {step.label}
              </span>
            </div>
            <Link href={step.href} className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
              Go →
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
