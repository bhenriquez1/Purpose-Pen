import { NextResponse } from "next/server";
import { adminDb, AdminNotConfiguredError } from "@/lib/firebase/admin";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";

export async function GET(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    if (user.role !== "owner") {
      return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    }
    if (!adminDb) {
      throw new AdminNotConfiguredError();
    }

    const snapshot = await adminDb
      .collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ events });
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
