export async function logClientEvent(
  getIdToken: () => Promise<string | null>,
  action: string,
  metadata?: Record<string, unknown>
) {
  const idToken = await getIdToken();
  if (!idToken) return;
  try {
    await fetch("/api/audit/log", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ action, metadata }),
    });
  } catch {
    // Audit logging failures should never block the user's action.
  }
}
