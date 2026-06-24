import Link from "next/link";
import type { ReactNode } from "react";

export default function ReapplicantArchiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reapplicant Archive
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Keep a record of past application cycles, feedback, and lessons learned so each
            reapplication is stronger than the last.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
