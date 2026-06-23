import { adminDb } from "@/lib/firebase/admin";

export interface AuditEvent {
  uid: string;
  email: string | null;
  action: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes through the Admin SDK only, so a signed-in user cannot tamper with
 * or delete their own audit trail via client-side Firestore access.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  if (!adminDb) return;
  await adminDb.collection("auditLogs").add({
    uid: event.uid,
    email: event.email,
    action: event.action,
    metadata: event.metadata ?? {},
    createdAt: new Date().toISOString(),
  });
}
