import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildRefineLetterPrompt, type RefineAction } from "@/lib/ai/prompts";
import { AdminNotConfiguredError } from "@/lib/firebase/admin";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";
import { logAuditEvent } from "@/lib/audit/server";

const REFINE_ACTIONS: RefineAction[] = ["professional", "shorten", "strengthen"];

interface RefineLetterRequest {
  content: string;
  action: RefineAction;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    const body = (await request.json()) as RefineLetterRequest;

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Letter content is required." }, { status: 400 });
    }
    if (!REFINE_ACTIONS.includes(body.action)) {
      return NextResponse.json({ error: "Invalid refine action." }, { status: 400 });
    }

    const { system, prompt } = buildRefineLetterPrompt(body.content, body.action);
    const content = await callClaude({ system, prompt, maxTokens: 2000 });

    await logAuditEvent({
      uid: user.uid,
      email: user.email,
      action: "ai_refine_letter",
      metadata: { refineAction: body.action },
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
