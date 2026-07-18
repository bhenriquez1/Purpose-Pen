import {
  ATTRIBUTE_LABELS,
  LETTER_TYPE_LABELS,
  type ApplicantDraftAnswers,
  type ApplicantProfile,
  type EmailTone,
  type GuidedLetterAnswers,
  type LetterType,
  type RecommenderType,
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

export function buildNotesImprovePrompt(
  recommender: Recommender,
  letterType: LetterType,
  applicantName: string,
  notes: string
) {
  const system = [
    "You are helping a busy recommender turn a few rough sentences into a complete, polished letter of recommendation.",
    "Preserve the recommender's authentic voice, word choice, and tone from their notes — do not flatten it into generic admissions language.",
    "Improve grammar and clarity, and expand the notes into a complete, well-structured letter using only the details given.",
    "Do not invent specific facts, achievements, or examples that were not mentioned in the notes.",
  ].join(" ");

  const prompt = [
    `Write a ${LETTER_TYPE_LABELS[letterType]} for applicant "${applicantName}".`,
    `Recommender: ${recommender.name}, ${recommender.role} at ${recommender.institution}.`,
    `Relationship to applicant: ${recommender.relationshipToApplicant}.`,
    "",
    "=== Recommender's notes, in their own words (2-5 sentences) ===",
    notes,
    "",
    "Expand these notes into a complete, specific, non-generic letter that sounds like it was genuinely written by this recommender. Keep their voice and tone intact.",
  ].join("\n");

  return { system, prompt };
}

export function buildGuidedLetterPrompt(answers: GuidedLetterAnswers, letterType: LetterType) {
  const system = [
    "You are helping a busy recommender who does not want to write a letter from scratch and may not know how to start.",
    "Generate a complete, authentic-sounding letter of recommendation purely from their answers to a short set of guided questions.",
    "Use only the specific details they gave you. Do not invent facts, statistics, or examples not provided.",
    "The letter must sound like it was written by a real person who knows this applicant — specific and warm where appropriate, never generic or robotic.",
  ].join(" ");

  const prompt = [
    `Write a ${LETTER_TYPE_LABELS[letterType]} for applicant "${answers.applicantName}".`,
    `Recommender: ${answers.recommenderNameTitle}.`,
    `Relationship to applicant: ${answers.relationshipToApplicant}.`,
    `How long they've known the applicant: ${answers.howLongKnown}.`,
    `Setting where they know the applicant: ${answers.settingKnown}.`,
    `Applicant's strongest qualities: ${answers.strongestQualities}.`,
    `A real example or memory that illustrates this: ${answers.realExampleOrMemory}.`,
    `Why they recommend the applicant: ${answers.whyRecommend}.`,
    `Program/school type: ${answers.programSchoolType}.`,
    `Desired tone: ${answers.desiredTone}.`,
    "",
    "Write the complete letter now.",
  ].join("\n");

  return { system, prompt };
}

export function buildApplicantDraftPrompt(
  answers: ApplicantDraftAnswers,
  letterType: LetterType,
  recommenderType: RecommenderType
) {
  const system = [
    "You are helping an applicant prepare a draft letter of recommendation that their recommender has explicitly asked them to write.",
    "The recommender will review, edit, and approve the final letter before submitting it.",
    "Write in the recommender's authentic voice using the voice sample provided.",
    "Use ONLY the specific details, examples, and observations provided — do not invent facts, achievements, or experiences not mentioned.",
    "The letter must sound like it was genuinely written by the recommender — specific, credible, and personal, not generic AI writing.",
    "Do not use generic admissions filler phrases. Ground every claim in the specific evidence provided.",
  ].join(" ");

  const evidenceLines = [
    answers.academicExamples ? `Academic examples: ${answers.academicExamples}` : "",
    answers.clinicalExamples ? `Clinical / lab / field examples: ${answers.clinicalExamples}` : "",
    answers.patientInteraction ? `Patient or client interaction: ${answers.patientInteraction}` : "",
    answers.workEthic ? `Work ethic: ${answers.workEthic}` : "",
    answers.leadership ? `Leadership: ${answers.leadership}` : "",
    answers.reliability ? `Reliability: ${answers.reliability}` : "",
    answers.professionalism ? `Professionalism: ${answers.professionalism}` : "",
    answers.growthOverTime ? `Growth over time: ${answers.growthOverTime}` : "",
    answers.realStoriesObservations ? `Real stories or specific observations: ${answers.realStoriesObservations}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const perspectiveLines = Object.entries(answers.perspectiveAnswers)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const prompt = [
    `Write a ${LETTER_TYPE_LABELS[letterType]}.`,
    "",
    "=== APPLICANT INFORMATION ===",
    `Full name: ${answers.applicantFullName || "(not provided)"}`,
    `Program type: ${answers.programType || "(not provided)"}`,
    `Schools or application type: ${answers.schoolsOrApplicationType || "(not provided)"}`,
    `Career goal: ${answers.careerGoal || "(not provided)"}`,
    `Personal qualities: ${answers.personalQualities || "(not provided)"}`,
    `Achievements and experiences: ${answers.achievements || "(not provided)"}`,
    "",
    "=== RECOMMENDER INFORMATION ===",
    `Name and title: ${answers.recommenderFullName}${answers.recommenderTitle ? `, ${answers.recommenderTitle}` : ""}`,
    `Institution / clinic / company: ${answers.recommenderInstitution || "(not provided)"}`,
    `Relationship to applicant: ${answers.relationshipToApplicant || "(not provided)"}`,
    `How long known: ${answers.howLongKnown || "(not provided)"}`,
    `Context / setting: ${answers.contextKnown || "(not provided)"}`,
    evidenceLines ? `\n=== EVIDENCE AND EXAMPLES ===\n${evidenceLines}` : "",
    perspectiveLines ? `\n=== RECOMMENDER PERSPECTIVE (${recommenderType}) ===\n${perspectiveLines}` : "",
    "",
    "=== RECOMMENDER'S VOICE SAMPLE ===",
    answers.voiceSentences
      ? `In the recommender's own words: "${answers.voiceSentences}"`
      : "No voice sample provided — use a professional, warm tone appropriate to this recommender's role.",
    answers.writingSample ? `\nAdditional writing sample for voice reference:\n${answers.writingSample}` : "",
    "",
    "Write the complete letter now. Match the recommender's voice closely. Use every specific detail above — do not leave any piece of evidence out.",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { system, prompt };
}

export type RefineAction = "professional" | "shorten" | "strengthen" | "add_examples";

export function buildRefineLetterPrompt(letterContent: string, action: RefineAction) {
  const instructions: Record<RefineAction, string> = {
    professional:
      "Make this letter sound more professional and polished while keeping every specific detail and the recommender's authentic voice. Do not make it generic.",
    shorten:
      "Shorten this letter while keeping its most specific, credible details and its authentic voice. Cut filler, not substance.",
    strengthen:
      "Strengthen this letter — make the praise more specific and credible, and sharpen any vague language — without inventing new facts and without losing the recommender's authentic voice.",
    add_examples:
      "Find every instance of vague or generic praise in this letter. Rewrite those sections to be more specific and concrete, using only the details and examples already present in the letter. Do not add new facts or fabricate experiences. Sharpen every vague claim into something specific and credible.",
  };

  const system = [
    "You are editing an existing letter of recommendation.",
    "Preserve the recommender's authentic voice and all specific facts and examples already in the letter. Do not invent new facts.",
    instructions[action],
  ].join(" ");

  const prompt = `=== Current letter ===\n${letterContent}\n\nReturn the complete revised letter only, with no extra commentary.`;

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
