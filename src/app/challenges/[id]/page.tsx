import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getChallenge, getAllChallenges } from "@/lib/challenges";
import { SITE_URL } from "@/lib/constants";
import ChallengeClientView from "./ChallengeClientView";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllChallenges().map((c) => ({
    id: c.slug,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const challenge = getChallenge(params.id);
  if (!challenge) {
    return {
      title: "Challenge Not Found | Forge",
    };
  }

  return {
    title: `${challenge.title} | Forge Challenges`,
    description: challenge.subtitle,
    alternates: {
      canonical: `${SITE_URL}/challenges/${challenge.slug}`,
    },
    openGraph: {
      title: `${challenge.title} | Forge Challenges`,
      description: challenge.subtitle,
      url: `${SITE_URL}/challenges/${challenge.slug}`,
      type: "website",
    },
  };
}

export default function ChallengeDetailPage({ params }: PageProps) {
  const challenge = getChallenge(params.id);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-150 dark:bg-ink dark:text-paper">
      {/* Header breadcrumb bar */}
      <header className="border-b border-ink/10 bg-paper-deep px-4 py-4 dark:border-ink-line dark:bg-ink-soft">
        <div className="shell flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-ink hover:text-accent dark:text-paper dark:hover:text-accent transition-colors"
            >
              FORGE
            </Link>
            <span className="text-muted dark:text-muted-dark">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
              Challenges
            </span>
            <span className="text-muted dark:text-muted-dark">/</span>
            <span className="font-mono text-xs text-ink/80 dark:text-paper/80 font-medium">
              {challenge.slug}
            </span>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-ink/10 bg-paper px-3 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent dark:border-ink-line dark:bg-ink dark:text-paper dark:hover:border-accent"
          >
            ← Back to Platform
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="shell py-10 sm:py-14 outline-none">
        {/* Challenge title & metadata hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-ink dark:text-accent">
              {challenge.category}
            </span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-xs text-ink/70 dark:border-ink-line dark:text-paper/70">
              Difficulty: {challenge.difficulty}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tightest text-ink sm:text-4xl dark:text-paper">
            {challenge.title}
          </h1>
          <p className="mt-2 text-lg text-ink/70 dark:text-paper/70 max-w-3xl">
            {challenge.subtitle}
          </p>
        </div>

        {/* Client tabbed interactive workspace */}
        <ChallengeClientView challenge={challenge} />
      </main>
    </div>
  );
}
