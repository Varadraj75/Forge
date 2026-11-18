import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LivePlatformStats from "@/components/LivePlatformStats";
import LivePlatformStatsSkeleton from "@/components/LivePlatformStatsSkeleton";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

// Force dynamic per-request rendering so live telemetry updates continuously
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-paper outline-none transition-colors duration-300 dark:bg-ink"
    >
      <Navbar />
      <Hero />
      <Suspense fallback={<LivePlatformStatsSkeleton />}>
        <LivePlatformStats />
      </Suspense>
      <Manifesto />
      <Features />
      <HowItWorks />
      <Faq />
      <Waitlist />
      <Footer />
    </main>
  );
}
