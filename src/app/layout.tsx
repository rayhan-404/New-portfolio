import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { person } from "@/lib/portfolio-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rayhan.dev"),
  title: {
    default: "Rayhan — Full-Stack Engineer & UI/UX Specialist",
    template: "%s · Rayhan",
  },
  description:
    "Portfolio of Rayhan, a full-stack engineer and interface designer crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
  keywords: [
    "Rayhan",
    "Full-Stack Engineer",
    "UI/UX Designer",
    "Next.js Developer",
    "TypeScript",
    "React",
    "Design Systems",
    "Portfolio",
  ],
  authors: [{ name: person.name }],
  creator: person.name,
  openGraph: {
    title: "Rayhan — Full-Stack Engineer & UI/UX Specialist",
    description:
      "Crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
    url: "https://rayhan.dev",
    siteName: "Rayhan Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rayhan — Full-Stack Engineer & UI/UX Specialist",
    description:
      "Crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  email: `mailto:${person.email}`,
  jobTitle: person.role,
  description: person.bio,
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "UI/UX Design",
    "Design Systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
