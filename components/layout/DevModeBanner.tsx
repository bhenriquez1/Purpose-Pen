"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";

export function DevModeBanner() {
  const { isDevBypass } = useAuth();

  if (!isDevBypass) return null;

  return (
    <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-medium text-amber-950">
      Development Mode – Authentication Bypass Enabled
    </div>
  );
}
