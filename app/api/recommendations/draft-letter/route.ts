import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildLetterDraftPrompt, buildVoiceMatchPrompt } from "@/lib/ai/prompts";
import type { ApplicantProfile, LetterType, Recommender } from "@/types/recommendation";

interface DraftLetterRequest {
  recommender: Recommender;
  letterType: LetterType;
  applicantProfile: ApplicantProfile;
  applicantName: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as DraftLetterRequest;

  try {
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

    return NextResponse.json({ content, voiceMatchScore });
  } catch (error) {
    if (error instanceof AINotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
