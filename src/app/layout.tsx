import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
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

/* Elegant editorial serif — used for display accents ("Hello..") */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mrayhan.dev"),
  title: {
    default: "M Rayhan — CSE Student & Curious Builder",
    template: "%s · M Rayhan",
  },
  description:
    "Portfolio of M Rayhan — CSE student at North Western University, Khulna, from Shyamnagar, Satkhira. Curious about AI, robotics, electronics and new technologies; building things just to see what happens.",
  keywords: [
    "M Rayhan",
    "CSE Student",
    "North Western University",
    "Artificial Intelligence",
    "Robotics",
    "Electronics",
    "Portfolio",
    "Bangladesh",
  ],
  authors: [{ name: person.name }],
  creator: person.name,
  openGraph: {
    title: "M Rayhan — CSE Student & Curious Builder",
    description:
      "Curious about almost everything — AI, robotics, electronics — and building things just to see what happens.",
    url: "https://mrayhan.dev",
    siteName: "M Rayhan",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "M Rayhan — CSE Student & Curious Builder",
    description:
      "Curious about almost everything — AI, robotics, electronics — and building things just to see what happens.",
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
    "Artificial Intelligence",
    "Robotics",
    "Electronics",
    "Web Development",
    "Problem Solving",
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased text-foreground min-h-screen flex flex-col`}
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
