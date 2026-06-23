import type { ApplicantProfile, Recommender } from "@/types/recommendation";

function section(title: string, items: string[]): string {
  if (items.length === 0 || items.every((i) => !i.trim())) return "";
  return `## ${title}\n\n${items
    .filter((i) => i.trim())
    .map((i) => `- ${i}`)
    .join("\n")}\n`;
}

export function buildRecommenderPacketMarkdown(profile: ApplicantProfile): string {
  const name = profile.applicantName || "Applicant";
  return [
    `# Recommender Packet — ${name}`,
    "",
    "This packet summarizes the applicant's background to support writing a strong, specific letter of recommendation.",
    "",
    section("Achievements", profile.achievements),
    section("Volunteer Experiences", profile.volunteerExperiences),
    section("Shadowing Experiences", profile.shadowingExperiences),
    section("Work History", profile.workHistory),
    section("Leadership Experience", profile.leadership),
    section("Awards and Honors", profile.awards),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCommitteePacketMarkdown(params: {
  applicantProfile: ApplicantProfile;
  recommenders: Recommender[];
  letters: { recommenderName: string; content: string }[];
  resume?: string;
  personalStatement?: string;
}): string {
  const { applicantProfile, letters, resume, personalStatement } = params;
  const name = applicantProfile.applicantName || "Applicant";

  const lettersSection = letters.length
    ? letters
        .map((l) => `### Letter from ${l.recommenderName}\n\n${l.content}`)
        .join("\n\n")
    : "";

  return [
    `# Committee Packet — ${name}`,
    "",
    resume ? `## Resume / CV\n\n${resume}` : "",
    personalStatement ? `## Personal Statement\n\n${personalStatement}` : "",
    section("Achievements Summary", applicantProfile.achievements),
    section("Volunteer Summary", applicantProfile.volunteerExperiences),
    section("Shadowing Summary", applicantProfile.shadowingExperiences),
    section("Leadership Summary", applicantProfile.leadership),
    section("Work History Summary", applicantProfile.workHistory),
    lettersSection ? `## Recommendation Letters\n\n${lettersSection}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
