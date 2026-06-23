import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card className="space-y-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Terms of Use
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Purpose Pen, including its Letter of Recommendation Suite, Thought Unit concepts,
            recommendation scoring logic, and admissions analysis methodologies, is proprietary
            software owned and operated by its developers.
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>This software, its source code, and underlying workflows are proprietary.</li>
            <li>
              The educational methodologies, prompts, and analysis frameworks used within this
              platform are proprietary and confidential.
            </li>
            <li>
              Unauthorized copying, reverse engineering, redistribution, or commercial use of this
              software or its methodologies is strictly prohibited.
            </li>
            <li>
              Access is limited to approved beta users. Accounts and access credentials may not be
              shared or transferred.
            </li>
            <li>
              Content you generate or store using this platform remains associated with your
              account and may be reviewed for security and abuse prevention purposes.
            </li>
          </ul>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Continued use of this platform constitutes acceptance of these terms.
          </p>
        </Card>
      </div>
    </main>
  );
}
