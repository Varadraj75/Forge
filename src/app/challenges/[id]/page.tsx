import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getChallenge, getAllChallenges } from "@/lib/challenges";
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
    title: `${challenge.title} | Forge Live Challenge`,
    description: challenge.subtitle,
    openGraph: {
      title: `${challenge.title} | Forge`,
      description: challenge.subtitle,
    },
  };
}

export default function ChallengePage({ params }: PageProps) {
  const challenge = getChallenge(params.id);

  if (!challenge) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink text-paper">
      {/* Top ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[70%] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-ink-line pb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-paper/70 transition-colors hover:text-accent"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Forge
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-dark">ID:</span>
            <span className="rounded bg-ink-soft px-2 py-0.5 font-mono text-xs text-paper/80">
              {challenge.id}
            </span>
          </div>
        </div>

        {/* Client Interactive Viewer */}
        <ChallengeClientView challenge={challenge} />
      </div>
    </main>
  );
}
