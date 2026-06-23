import { NextResponse } from "next/server";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";
import { AdminNotConfiguredError } from "@/lib/firebase/admin";
import { logAuditEvent } from "@/lib/audit/server";

interface AuditLogRequest {
  action: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    const body = (await request.json()) as AuditLogRequest;

    if (!body.action) {
      return NextResponse.json({ error: "Missing action." }, { status: 400 });
    }

    await logAuditEvent({
      uid: user.uid,
      email: user.email,
      action: body.action,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof AdminNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
