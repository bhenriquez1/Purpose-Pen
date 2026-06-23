import { NextResponse } from "next/server";
import { AINotConfiguredError, callClaude } from "@/lib/ai/anthropic";
import { buildLetterAnalysisPrompt } from "@/lib/ai/prompts";
import type { LetterAnalysis } from "@/types/recommendation";

interface AnalyzeLetterRequest {
  letterText: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as AnalyzeLetterRequest;

  try {
    const { system, prompt } = buildLetterAnalysisPrompt(body.letterText);
    const raw = await callClaude({ system, prompt, maxTokens: 1000 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    const analysis = JSON.parse(jsonMatch[0]) as LetterAnalysis;
    return NextResponse.json(analysis);
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
