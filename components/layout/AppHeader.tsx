"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthProvider";

export function AppHeader() {
  const { status, email, role, signOutUser } = useAuth();

  if (status !== "allowed") return null;

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Purpose Pen
      </Link>
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        {role === "owner" && (
          <Link href="/admin" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
            Owner
          </Link>
        )}
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <span className="hidden sm:inline">{email}</span>
        <button onClick={() => signOutUser()} className="hover:underline">
          Sign Out
        </button>
      </div>
    </header>
  );
}
