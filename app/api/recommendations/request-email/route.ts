import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildRequestEmailPrompt } from "@/lib/ai/prompts";
import { AdminNotConfiguredError } from "@/lib/firebase/admin";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";
import { logAuditEvent } from "@/lib/audit/server";
import type { EmailTone, Recommender, RequestEmailType } from "@/types/recommendation";

interface RequestEmailRequest {
  recommender: Recommender;
  type: RequestEmailType;
  tone: EmailTone;
  applicantName: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    const body = (await request.json()) as RequestEmailRequest;

    const { system, prompt } = buildRequestEmailPrompt(
      body.recommender,
      body.type,
      body.tone,
      body.applicantName
    );
    const content = await callClaude({ system, prompt, maxTokens: 600 });

    await logAuditEvent({
      uid: user.uid,
      email: user.email,
      action: "ai_request_email",
      metadata: { recommenderId: body.recommender.id, type: body.type },
    });

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof AINotConfiguredError || error instanceof AdminNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: error instanceof AINotConfiguredError ? 501 : 503 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
