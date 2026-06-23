import { deleteItem, getItem, listItems, saveItem } from "./storage";
import type {
  ApplicantProfile,
  CommitteePacketSelection,
  LetterDraft,
  PersonalStatement,
  Recommender,
  RequestEmail,
} from "@/types/recommendation";

const COLLECTIONS = {
  recommenders: "recommenders",
  applicantProfile: "applicantProfile",
  letterDrafts: "letterDrafts",
  requestEmails: "requestEmails",
  committeePackets: "committeePackets",
  personalStatements: "personalStatements",
} as const;

const APPLICANT_PROFILE_ID = "profile";

function nowIso() {
  return new Date().toISOString();
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- Recommenders -----------------------------------------------------

export function listRecommenders(uid: string) {
  return listItems<Recommender>(uid, COLLECTIONS.recommenders);
}

export function getRecommender(uid: string, id: string) {
  return getItem<Recommender>(uid, COLLECTIONS.recommenders, id);
}

export function saveRecommender(
  uid: string,
  recommender: Omit<Recommender, "createdAt" | "updatedAt"> & {
    createdAt?: string;
  }
) {
  const timestamp = nowIso();
  const toSave: Recommender = {
    ...recommender,
    createdAt: recommender.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  return saveItem<Recommender>(uid, COLLECTIONS.recommenders, toSave).then(
    () => toSave
  );
}

export function deleteRecommender(uid: string, id: string) {
  return deleteItem(uid, COLLECTIONS.recommenders, id);
}

// --- Applicant profile -------------------------------------------------

const emptyApplicantProfile: ApplicantProfile = {
  applicantName: "",
  achievements: [],
  volunteerExperiences: [],
  shadowingExperiences: [],
  workHistory: [],
  leadership: [],
  awards: [],
  updatedAt: nowIso(),
};

export async function getApplicantProfile(uid: string): Promise<ApplicantProfile> {
  const profile = await getItem<ApplicantProfile & { id: string }>(
    uid,
    COLLECTIONS.applicantProfile,
    APPLICANT_PROFILE_ID
  );
  return profile ?? emptyApplicantProfile;
}

export function saveApplicantProfile(uid: string, profile: ApplicantProfile) {
  return saveItem(uid, COLLECTIONS.applicantProfile, {
    ...profile,
    id: APPLICANT_PROFILE_ID,
    updatedAt: nowIso(),
  });
}

// --- Letter drafts ------------------------------------------------------

export function listLetterDrafts(uid: string) {
  return listItems<LetterDraft>(uid, COLLECTIONS.letterDrafts);
}

export async function saveLetterDraft(
  uid: string,
  draft: Omit<LetterDraft, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
) {
  const timestamp = nowIso();
  const existing = draft.id
    ? await getItem<LetterDraft>(uid, COLLECTIONS.letterDrafts, draft.id)
    : null;
  const toSave: LetterDraft = {
    ...draft,
    id: draft.id ?? newId(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await saveItem(uid, COLLECTIONS.letterDrafts, toSave);
  return toSave;
}

export function deleteLetterDraft(uid: string, id: string) {
  return deleteItem(uid, COLLECTIONS.letterDrafts, id);
}

// --- Request emails -------------------------------------------------------

export function listRequestEmails(uid: string) {
  return listItems<RequestEmail>(uid, COLLECTIONS.requestEmails);
}

export async function saveRequestEmail(
  uid: string,
  email: Omit<RequestEmail, "id" | "createdAt"> & { id?: string }
) {
  const toSave: RequestEmail = {
    ...email,
    id: email.id ?? newId(),
    createdAt: nowIso(),
  };
  await saveItem(uid, COLLECTIONS.requestEmails, toSave);
  return toSave;
}

// --- Committee packets -----------------------------------------------------

interface StoredCommitteePacket extends CommitteePacketSelection {
  id: string;
  createdAt: string;
}

export function listCommitteePackets(uid: string) {
  return listItems<StoredCommitteePacket>(uid, COLLECTIONS.committeePackets);
}

export async function saveCommitteePacket(
  uid: string,
  selection: CommitteePacketSelection
) {
  const toSave: StoredCommitteePacket = {
    ...selection,
    id: newId(),
    createdAt: nowIso(),
  };
  await saveItem(uid, COLLECTIONS.committeePackets, toSave);
  return toSave;
}

// --- Personal statements -------------------------------------------------

export function listPersonalStatements(uid: string) {
  return listItems<PersonalStatement>(uid, COLLECTIONS.personalStatements);
}

export async function savePersonalStatement(
  uid: string,
  statement: Omit<PersonalStatement, "id" | "createdAt" | "updatedAt"> & { id?: string }
) {
  const timestamp = nowIso();
  const existing = statement.id
    ? await getItem<PersonalStatement>(uid, COLLECTIONS.personalStatements, statement.id)
    : null;
  const toSave: PersonalStatement = {
    ...statement,
    id: statement.id ?? newId(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await saveItem(uid, COLLECTIONS.personalStatements, toSave);
  return toSave;
}

export function deletePersonalStatement(uid: string, id: string) {
  return deleteItem(uid, COLLECTIONS.personalStatements, id);
}
