import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/recommendations", label: "Overview" },
  { href: "/recommendations/recommenders", label: "Recommenders" },
  { href: "/recommendations/applicant-profile", label: "Applicant Profile & Packet" },
  { href: "/recommendations/analyzer", label: "Letter Analyzer" },
  { href: "/recommendations/committee-packet", label: "Committee Packet" },
  { href: "/recommendations/workflow", label: "Dental Workflow" },
];

export default function RecommendationsLayout({
  children,
}: {
  children: ReactNode;
}) {
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
            Letter of Recommendation Suite
          </h1>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
