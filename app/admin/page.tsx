"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/lib/firebase/AuthProvider";

interface AuditEvent {
  id: string;
  uid: string;
  email: string | null;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function AdminPage() {
  const { role, getIdToken } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "owner") {
      return;
    }
    (async () => {
      try {
        const idToken = await getIdToken();
        const response = await fetch("/api/audit/list", {
          headers: { authorization: `Bearer ${idToken}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load audit log");
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit log");
      } finally {
        setLoading(false);
      }
    })();
  }, [role, getIdToken]);

  if (role !== "owner") {
    return <ErrorMessage message="Owner access required." />;
  }

  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Owner Dashboard — Audit Log
        </h1>

        {error && <ErrorMessage message={error} />}

        <Card className="mt-6">
          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No audit events recorded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{event.email ?? event.uid}</td>
                    <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                      {event.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </main>
  );
}
