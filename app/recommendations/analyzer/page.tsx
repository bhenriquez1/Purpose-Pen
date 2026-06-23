"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Textarea } from "@/components/ui/Field";
import type { LetterAnalysis } from "@/types/recommendation";

export default function LetterAnalyzerPage() {
  const [letterText, setLetterText] = useState("");
  const [analysis, setAnalysis] = useState<LetterAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    try {
      const response = await fetch("/api/recommendations/analyze-letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ letterText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze letter");
      }
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze letter");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Letter Analyzer</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Paste a recommendation letter to check strength, specificity, credibility, tone, and
          admissions impact. Letters are analyzed on demand and are not shared beyond what is
          needed to generate this analysis.
        </p>
        <Textarea
          className="min-h-56"
          value={letterText}
          onChange={(e) => setLetterText(e.target.value)}
          placeholder="Paste the recommendation letter here..."
        />
        <Button onClick={handleAnalyze} loading={analyzing} disabled={!letterText.trim()}>
          Analyze Letter
        </Button>
        {error && <ErrorMessage message={error} />}
      </Card>

      {analysis && (
        <Card className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(["strength", "specificity", "credibility"] as const).map((key) => (
              <div
                key={key}
                className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800"
              >
                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {analysis[key]}
                </div>
                <div className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{key}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tone</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{analysis.tone}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Admissions Impact
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{analysis.admissionsImpact}</p>
          </div>

          {analysis.genericPhrases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Generic Language Detected
              </h3>
              <ul className="list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                {analysis.genericPhrases.map((phrase, i) => (
                  <li key={i}>{phrase}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.missingExamples.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Missing or Weak Examples
              </h3>
              <ul className="list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                {analysis.missingExamples.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Suggested Improvements
              </h3>
              <ul className="list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                {analysis.suggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
