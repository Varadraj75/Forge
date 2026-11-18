import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeInitScript } from "@/lib/theme-script";
import { SITE_URL, SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const display = localFont({
  src: "./fonts/bricolage.woff2",
  weight: "500 800",
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/hanken.woff2",
  weight: "400 600",
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains.woff2",
  weight: "400 500",
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    description:
      "Hackathon-driven innovation and skills-based hiring. Post a challenge, see the work, hire the people who built it well.",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-accent selection:text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:font-medium focus:text-paper focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent dark:focus:bg-paper dark:focus:text-ink"
        >
          Skip to main content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
