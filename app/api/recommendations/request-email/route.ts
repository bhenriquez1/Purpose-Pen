import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildRequestEmailPrompt } from "@/lib/ai/prompts";
import type { EmailTone, Recommender, RequestEmailType } from "@/types/recommendation";

interface RequestEmailRequest {
  recommender: Recommender;
  type: RequestEmailType;
  tone: EmailTone;
  applicantName: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestEmailRequest;

  try {
    const { system, prompt } = buildRequestEmailPrompt(
      body.recommender,
      body.type,
      body.tone,
      body.applicantName
    );
    const content = await callClaude({ system, prompt, maxTokens: 600 });
    return NextResponse.json({ content });
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
