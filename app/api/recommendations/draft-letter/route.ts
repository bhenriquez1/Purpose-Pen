import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import {
  buildApplicantDraftPrompt,
  buildGuidedLetterPrompt,
  buildLetterDraftPrompt,
  buildNotesImprovePrompt,
  buildVoiceMatchPrompt,
} from "@/lib/ai/prompts";
import { AdminNotConfiguredError } from "@/lib/firebase/admin";
import { requireAuthedUser, UnauthorizedError, ForbiddenError } from "@/lib/auth/verifyRequest";
import { logAuditEvent } from "@/lib/audit/server";
import type {
  ApplicantDraftAnswers,
  ApplicantProfile,
  GuidedLetterAnswers,
  LetterType,
  Recommender,
} from "@/types/recommendation";

interface DraftLetterRequest {
  mode?: "profile" | "notes" | "guided" | "applicant_draft";
  recommender: Recommender;
  letterType: LetterType;
  applicantProfile: ApplicantProfile;
  applicantName: string;
  notes?: string;
  guidedAnswers?: GuidedLetterAnswers;
  applicantDraftAnswers?: ApplicantDraftAnswers;
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthedUser(request);
    const body = (await request.json()) as DraftLetterRequest;
    const mode = body.mode ?? "profile";

    let system: string;
    let prompt: string;
    if (mode === "notes") {
      if (!body.notes?.trim()) {
        return NextResponse.json({ error: "Notes are required." }, { status: 400 });
      }
      ({ system, prompt } = buildNotesImprovePrompt(
        body.recommender,
        body.letterType,
        body.applicantName,
        body.notes
      ));
    } else if (mode === "guided") {
      if (!body.guidedAnswers) {
        return NextResponse.json({ error: "Guided answers are required." }, { status: 400 });
      }
      ({ system, prompt } = buildGuidedLetterPrompt(body.guidedAnswers, body.letterType));
    } else if (mode === "applicant_draft") {
      if (!body.applicantDraftAnswers) {
        return NextResponse.json({ error: "Applicant draft answers are required." }, { status: 400 });
      }
      ({ system, prompt } = buildApplicantDraftPrompt(
        body.applicantDraftAnswers,
        body.letterType,
        body.recommender.recommenderType
      ));
    } else {
      ({ system, prompt } = buildLetterDraftPrompt(
        body.recommender,
        body.letterType,
        body.applicantProfile,
        body.applicantName
      ));
    }
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
