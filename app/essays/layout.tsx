import Link from "next/link";
import type { ReactNode } from "react";

export default function EssaysLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Personal Statement &amp; Essay Studio
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
