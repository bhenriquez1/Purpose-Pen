export type RecommenderType =
  | "dentist"
  | "professor"
  | "employer"
  | "research_mentor"
  | "other";

export type RecommendationStatus =
  | "not_requested"
  | "requested"
  | "in_progress"
  | "submitted"
  | "received"
  | "missing"
  | "follow_up_needed";

export const RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "not_requested",
  "requested",
  "in_progress",
  "submitted",
  "received",
  "missing",
  "follow_up_needed",
];

export const STATUS_LABELS: Record<RecommendationStatus, string> = {
  not_requested: "Not Requested",
  requested: "Requested",
  in_progress: "In Progress",
  submitted: "Submitted",
  received: "Received",
  missing: "Missing",
  follow_up_needed: "Follow-Up Needed",
};

export type LetterType =
  | "dental_school"
  | "medical_school"
  | "faculty"
  | "dentist"
  | "employer"
  | "research_mentor"
  | "scholarship"
  | "graduate_school";

export const LETTER_TYPE_LABELS: Record<LetterType, string> = {
  dental_school: "Dental School Recommendation",
  medical_school: "Medical School Recommendation",
  faculty: "Faculty Recommendation",
  dentist: "Dentist Recommendation",
  employer: "Employer Recommendation",
  research_mentor: "Research Mentor Recommendation",
  scholarship: "Scholarship Recommendation",
  graduate_school: "Graduate School Recommendation",
};

export type CoreAttribute =
  | "compassion"
  | "reliability"
  | "discipline"
  | "maturity"
  | "work_ethic"
  | "humility"
  | "leadership"
  | "curiosity"
  | "resilience"
  | "integrity"
  | "communication"
  | "teamwork"
  | "empathy"
  | "professionalism"
  | "coachability"
  | "attention_to_detail";

export const CORE_ATTRIBUTES: CoreAttribute[] = [
  "compassion",
  "reliability",
  "discipline",
  "maturity",
  "work_ethic",
  "humility",
  "leadership",
  "curiosity",
  "resilience",
  "integrity",
  "communication",
  "teamwork",
  "empathy",
  "professionalism",
  "coachability",
  "attention_to_detail",
];

export const ATTRIBUTE_LABELS: Record<CoreAttribute, string> = {
  compassion: "Compassion",
  reliability: "Reliability",
  discipline: "Discipline",
  maturity: "Maturity",
  work_ethic: "Work Ethic",
  humility: "Humility",
  leadership: "Leadership",
  curiosity: "Curiosity",
  resilience: "Resilience",
  integrity: "Integrity",
  communication: "Communication",
  teamwork: "Teamwork",
  empathy: "Empathy",
  professionalism: "Professionalism",
  coachability: "Coachability",
  attention_to_detail: "Attention to Detail",
};

export interface AttributeExample {
  attribute: CoreAttribute;
  /** What happened */
  situation: string;
  /** What the applicant did */
  action: string;
  /** What the recommender observed */
  observation: string;
  /** Why it matters */
  significance: string;
}

/** Recommender-type-specific perspective prompts, keyed loosely by question id. */
export interface PerspectiveResponse {
  questionId: string;
  question: string;
  answer: string;
}

export const PERSPECTIVE_QUESTIONS: Record<RecommenderType, { id: string; question: string }[]> = {
  dentist: [
    { id: "chairside_professionalism", question: "Chairside professionalism" },
    { id: "patient_interaction", question: "Patient interaction" },
    { id: "infection_control", question: "Infection control awareness" },
    { id: "manual_dexterity", question: "Manual dexterity" },
    { id: "clinical_curiosity", question: "Clinical curiosity" },
    { id: "respect_for_team", question: "Respect for the dental team" },
    { id: "growth_over_time", question: "Growth over time" },
  ],
  professor: [
    { id: "academic_discipline", question: "Academic discipline" },
    { id: "class_participation", question: "Class participation" },
    { id: "intellectual_curiosity", question: "Intellectual curiosity" },
    { id: "persistence", question: "Persistence with difficult material" },
    { id: "writing_research", question: "Writing or research ability" },
    { id: "professionalism_faculty", question: "Professionalism with faculty" },
    { id: "growth_semester", question: "Growth over the semester" },
  ],
  employer: [
    { id: "reliability", question: "Reliability" },
    { id: "responsibility", question: "Responsibility" },
    { id: "teamwork", question: "Teamwork" },
    { id: "communication", question: "Communication" },
    { id: "leadership", question: "Leadership" },
    { id: "problem_solving", question: "Problem-solving" },
    { id: "consistency_under_pressure", question: "Consistency under pressure" },
  ],
  research_mentor: [
    { id: "intellectual_curiosity", question: "Intellectual curiosity" },
    { id: "persistence", question: "Persistence through setbacks" },
    { id: "writing_research", question: "Research and writing ability" },
    { id: "growth_over_time", question: "Growth over time in the lab" },
  ],
  other: [],
};

export type VoiceProfileType =
  | "formal_professor"
  | "friendly_professor"
  | "clinical_dentist"
  | "practice_owner"
  | "research_mentor"
  | "employer_supervisor"
  | "custom";

export const VOICE_PROFILE_LABELS: Record<VoiceProfileType, string> = {
  formal_professor: "Formal Professor",
  friendly_professor: "Friendly Professor",
  clinical_dentist: "Clinical Dentist",
  practice_owner: "Practice Owner",
  research_mentor: "Research Mentor",
  employer_supervisor: "Employer / Supervisor",
  custom: "Custom Voice",
};

export interface VoiceCapture {
  /** 2-5 sentences in the recommender's own words */
  naturalDescription: string;
  voiceProfile: VoiceProfileType;
  /** Optional pasted prior writing sample (email, letter, evaluation) used as a voice reference */
  writingSample?: string;
}

export interface PersonalityProfile {
  /** How the recommender would describe the applicant, in a clinical/academic/professional setting */
  description: string;
  attributeExamples: AttributeExample[];
  perspectiveResponses: PerspectiveResponse[];
}

export interface Recommender {
  id: string;
  name: string;
  role: string;
  email: string;
  institution: string;
  relationshipToApplicant: string;
  recommenderType: RecommenderType;
  deadline: string | null;
  notes: string;
  status: RecommendationStatus;
  lastFollowUpDate: string | null;
  voiceCapture: VoiceCapture | null;
  personality: PersonalityProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantProfile {
  applicantName: string;
  achievements: string[];
  volunteerExperiences: string[];
  shadowingExperiences: string[];
  workHistory: string[];
  leadership: string[];
  awards: string[];
  updatedAt: string;
}

export interface LetterDraft {
  id: string;
  recommenderId: string;
  letterType: LetterType;
  content: string;
  voiceMatchScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export type RequestEmailType = "request" | "follow_up" | "thank_you";
export type EmailTone = "formal" | "warm" | "concise" | "grateful";

export interface RequestEmail {
  id: string;
  recommenderId: string;
  type: RequestEmailType;
  tone: EmailTone;
  content: string;
  createdAt: string;
}

export interface LetterAnalysis {
  strength: number;
  specificity: number;
  credibility: number;
  tone: string;
  admissionsImpact: string;
  genericPhrases: string[];
  missingExamples: string[];
  suggestions: string[];
}

export interface PersonalStatement {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommitteePacketSelection {
  recommenderIds: string[];
  includeResume: boolean;
  includePersonalStatement: boolean;
  includeAchievementsSummary: boolean;
  includeVolunteerSummary: boolean;
  includeShadowingSummary: boolean;
  includeLeadershipSummary: boolean;
  includeWorkHistorySummary: boolean;
}
