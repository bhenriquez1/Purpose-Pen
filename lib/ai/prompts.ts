import {
  ATTRIBUTE_LABELS,
  LETTER_TYPE_LABELS,
  type ApplicantProfile,
  type EmailTone,
  type LetterType,
  type Recommender,
  type RequestEmailType,
} from "@/types/recommendation";

function formatPersonality(recommender: Recommender): string {
  const personality = recommender.personality;
  if (!personality) {
    return "No personality or character details have been provided yet.";
  }

  const attributeLines = personality.attributeExamples
    .map((entry) => {
      return [
        `- ${ATTRIBUTE_LABELS[entry.attribute]}:`,
        `  Situation: ${entry.situation}`,
        `  Action: ${entry.action}`,
        `  Observation: ${entry.observation}`,
        `  Why it matters: ${entry.significance}`,
      ].join("\n");
    })
    .join("\n");

  const perspectiveLines = personality.perspectiveResponses
    .map((response) => `- ${response.question}: ${response.answer}`)
    .join("\n");

  return [
    `Recommender's description of the applicant: ${personality.description || "(not provided)"}`,
    attributeLines ? `Attribute examples:\n${attributeLines}` : "",
    perspectiveLines ? `Role-specific observations:\n${perspectiveLines}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatVoice(recommender: Recommender): string {
  const voice = recommender.voiceCapture;
  if (!voice) {
    return "No voice sample has been captured. Use a neutral, professional tone.";
  }
  return [
    `Voice profile: ${voice.voiceProfile}`,
    `In the recommender's own words: "${voice.naturalDescription}"`,
    voice.writingSample
      ? `Additional writing sample for voice reference:\n${voice.writingSample}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatApplicantProfile(profile: ApplicantProfile): string {
  const section = (label: string, items: string[]) =>
    items.length ? `${label}:\n${items.map((i) => `- ${i}`).join("\n")}` : "";

  return [
    section("Achievements", profile.achievements),
    section("Volunteer experiences", profile.volunteerExperiences),
    section("Shadowing experiences", profile.shadowingExperiences),
    section("Work history", profile.workHistory),
    section("Leadership experience", profile.leadership),
    section("Awards and honors", profile.awards),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLetterDraftPrompt(
  recommender: Recommender,
  letterType: LetterType,
  applicantProfile: ApplicantProfile,
  applicantName: string
) {
  const system = [
    "You are helping a recommender write a letter of recommendation.",
    "You must preserve the recommender's authentic voice and tone rather than producing generic admissions language.",
    "Use specific, credible examples from the provided information. Do not invent facts that were not given to you.",
    "Improve grammar, clarity, and structure, but keep the recommender's natural vocabulary and level of formality.",
  ].join(" ");

  const prompt = [
    `Write a ${LETTER_TYPE_LABELS[letterType]} for applicant "${applicantName}".`,
    `Recommender: ${recommender.name}, ${recommender.role} at ${recommender.institution}.`,
    `Relationship to applicant: ${recommender.relationshipToApplicant}.`,
    "",
    "=== Recommender's voice and tone reference ===",
    formatVoice(recommender),
    "",
    "=== Personality and character information ===",
    formatPersonality(recommender),
    "",
    "=== Applicant background ===",
    formatApplicantProfile(applicantProfile),
    "",
    "Write a complete, specific, non-generic letter that sounds like it was genuinely written by this recommender.",
  ].join("\n");

  return { system, prompt };
}

export function buildVoiceMatchPrompt(recommender: Recommender, letterContent: string) {
  const system =
    "You score how closely a drafted letter matches a recommender's authentic voice and tone. Respond with only a number from 0 to 100, nothing else.";

  const prompt = [
    "=== Recommender's original voice sample ===",
    formatVoice(recommender),
    "",
    "=== Drafted letter ===",
    letterContent,
    "",
    "How closely does the drafted letter match the recommender's natural voice, vocabulary, and tone? Respond with only a number 0-100.",
  ].join("\n");

  return { system, prompt };
}

export function buildRequestEmailPrompt(
  recommender: Recommender,
  type: RequestEmailType,
  tone: EmailTone,
  applicantName: string
) {
  const system =
    "You write professional, well-structured emails for an applicant to send to their recommenders. Match the requested tone precisely.";

  const purpose: Record<RequestEmailType, string> = {
    request: "requesting that they write a letter of recommendation",
    follow_up: "politely following up on a previously requested letter of recommendation",
    thank_you: "thanking them after they submitted a letter of recommendation",
  };

  const prompt = [
    `Write an email from applicant "${applicantName}" to ${recommender.name} (${recommender.role}, ${recommender.institution}), ${purpose[type]}.`,
    `Tone: ${tone}.`,
    recommender.deadline ? `Deadline: ${recommender.deadline}.` : "",
    `Relationship: ${recommender.relationshipToApplicant}.`,
    "Keep it concise, respectful, and professional. Include a subject line.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, prompt };
}

export function buildPersonalStatementPrompt(topic: string, notes: string) {
  const system = [
    "You are an admissions essay coach helping an applicant draft a personal statement.",
    "Write in the applicant's likely voice: genuine, specific, and reflective rather than generic or cliché.",
    "Use concrete details and anecdotes from the notes provided. Do not invent facts not given to you.",
  ].join(" ");

  const prompt = [
    `Topic or prompt: ${topic}`,
    "",
    "=== Applicant notes / brainstorming ===",
    notes || "(no notes provided)",
    "",
    "Write a complete, specific personal statement draft based on this.",
  ].join("\n");

  return { system, prompt };
}

export function buildLetterAnalysisPrompt(letterText: string) {
  const system = [
    "You are an admissions consultant analyzing a letter of recommendation.",
    'Respond with strict JSON only, matching this shape: {"strength": number 0-100, "specificity": number 0-100, "credibility": number 0-100, "tone": string, "admissionsImpact": string, "genericPhrases": string[], "missingExamples": string[], "suggestions": string[]}.',
    "Do not include any text outside the JSON object.",
  ].join(" ");

  const prompt = `Analyze this recommendation letter:\n\n${letterText}`;

  return { system, prompt };
}
