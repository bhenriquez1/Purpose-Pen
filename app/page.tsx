import Link from "next/link";
import { Card } from "@/components/ui/Card";

const dashboardCards = [
  {
    href: "/application-center",
    title: "Application Management Center",
    description:
      "Track recommender status and deadlines, manage your applicant profile, and build committee packets and checklists.",
  },
  {
    href: "/essays",
    title: "Personal Statement & Essay Studio",
    description:
      "Draft and refine your personal statement, with brainstorming, outlining, and supplemental essay tools on the way.",
  },
  {
    href: "/recommendations",
    title: "Letter of Recommendation Builder",
    description:
      "Request letters, capture a recommender's authentic voice, draft and analyze letters for dental, medical, and graduate applications.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Purpose Pen
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your application management dashboard.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {dashboardCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition hover:border-zinc-400 hover:shadow-md dark:hover:border-zinc-600">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {card.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
