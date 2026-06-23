import { NextResponse } from "next/server";
import { AdminNotConfiguredError, verifyIdToken } from "@/lib/firebase/admin";
import { resolveRole } from "@/lib/auth/access";
import { logAuditEvent } from "@/lib/audit/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";

interface AccessRequest {
  idToken: string;
}

export async function POST(request: Request) {
  let body: AccessRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const decoded = await verifyIdToken(body.idToken);
    const email = decoded.email ?? null;
    const role = email ? resolveRole(email) : null;

    await logAuditEvent({
      uid: decoded.uid,
      email,
      action: "login",
      metadata: { allowed: Boolean(role) },
    });

    if (!role || !email) {
      const response = NextResponse.json({ allowed: false, role: null, email });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const response = NextResponse.json({ allowed: true, role, email });
    try {
      const sessionToken = await createSessionToken({ uid: decoded.uid, email, role });
      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
    } catch {
      // SESSION_SECRET not configured — middleware will fail closed on
      // protected routes until it's set; the Firebase-only check above still
      // governs the client-side AuthGate.
    }
    return response;
  } catch (error) {
    if (error instanceof AdminNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Invalid or expired authentication token." }, { status: 401 });
  }
}
