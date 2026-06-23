import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildLetterDraftPrompt, buildVoiceMatchPrompt } from "@/lib/ai/prompts";
import { AdminNotConfiguredError } from "@/lib/firebase/admin";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";
import { logAuditEvent } from "@/lib/audit/server";
import type { ApplicantProfile, LetterType, Recommender } from "@/types/recommendation";

interface DraftLetterRequest {
  recommender: Recommender;
  letterType: LetterType;
  applicantProfile: ApplicantProfile;
  applicantName: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    const body = (await request.json()) as DraftLetterRequest;

    const { system, prompt } = buildLetterDraftPrompt(
      body.recommender,
      body.letterType,
      body.applicantProfile,
      body.applicantName
    );
    const content = await callClaude({ system, prompt, maxTokens: 2000 });

    let voiceMatchScore: number | null = null;
    if (body.recommender.voiceCapture) {
      const voicePrompt = buildVoiceMatchPrompt(body.recommender, content);
      const scoreText = await callClaude({ ...voicePrompt, maxTokens: 10 });
      const parsed = Number.parseInt(scoreText.trim(), 10);
      voiceMatchScore = Number.isFinite(parsed) ? parsed : null;
    }

    await logAuditEvent({
      uid: user.uid,
      email: user.email,
      action: "ai_draft_letter",
      metadata: { recommenderId: body.recommender.id, letterType: body.letterType },
    });

    return NextResponse.json({ content, voiceMatchScore });
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
