import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
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
  metadataBase: new URL("https://bluenile.dev"),
  title: {
    default: "Blue Nile — Rayhan Ahmed · Full-Stack Engineer & UI/UX Specialist",
    template: "%s · Blue Nile",
  },
  description:
    "Portfolio of Rayhan Ahmed — Blue Nile Studio. Full-stack engineer and interface designer crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
  keywords: [
    "Blue Nile",
    "Rayhan Ahmed",
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
    title: "Blue Nile — Rayhan Ahmed · Full-Stack Engineer & UI/UX Specialist",
    description:
      "Crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
    url: "https://bluenile.dev",
    siteName: "Blue Nile Studio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Nile — Rayhan Ahmed · Full-Stack Engineer & UI/UX Specialist",
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
  themeColor: "#b9210f",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(64, 14, 5, 0.78)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.24)",
              color: "#fff7ee",
              boxShadow: "0 20px 50px -18px rgba(84,12,0,0.55)",
            },
          }}
        />
      </body>
    </html>
  );
}
