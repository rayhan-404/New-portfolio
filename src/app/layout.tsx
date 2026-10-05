import type { Metadata, Viewport } from "next";
import {
  Bonheur_Royale,
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Nunito,
  Source_Serif_4,
  Syne,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { person } from "@/lib/portfolio-data";
import { ACCENT_BOOT_SCRIPT } from "@/lib/accent-pool";
import BootDefaults from "@/components/boot-defaults";

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

/* Rounded friendly sans — the reference design's body font */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

/* Professional reading serif — the long-form bio text */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Stylish geometric display — secondary name weight */
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

/* High-contrast editorial display serif — the greeting lockup
   ("Hello.." / lead deck): optical-size axis, luxury letterforms */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Signature script — the name mark. Bonheur Royale is a flowing,
   high-contrast calligraphic face; carried at its real 400 weight
   and fattened optically with a hairline stroke at the usage site. */
const bonheurRoyale = Bonheur_Royale({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Admin-configured defaults, read from the DB before paint */}
        <BootDefaults />
        {/* Theme bootstrap — runs before paint. A visitor's own saved
            "mr-theme" choice always wins; otherwise the admin panel's
            default theme applies (dark when unset). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('mr-theme');var d=window.__MR_DEFAULT_THEME==='light'?'light':'dark';var light=s?s==='light':d==='light';if(light){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',document.documentElement.classList.contains('dark')?'#0e0e0e':'#f5f5f5')`,
          }}
        />
        {/* Accent bootstrap — the reference's "Material Colors — Random on
            each refresh": draw one pool hue before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${instrumentSerif.variable} ${sourceSerif.variable} ${syne.variable} ${bonheurRoyale.variable} ${fraunces.variable} antialiased text-foreground min-h-screen flex flex-col`}
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
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              boxShadow: "var(--shadow-neu-lg)",
            },
          }}
        />
      </body>
    </html>
  );
}
