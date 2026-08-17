import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import type { Viewport } from "next";

const inter = Inter({
  subsets: ["latin"] as const,
  variable: "--font-inter",
  display: "swap",
});

const baskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-baskerville",
  display: "swap",
});

const dancingScript = Dancing_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cursive",
  display: "swap",
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f12" },
  ],
};

export const metadata: Metadata = {
  title: "Kontacts — Personal Contacts Manager",
  description: "A minimal, high-performance workspace to organize your professional and personal network.",
  keywords: ["contacts", "address book", "network", "manager", "nextjs", "typescript", "kontacts"],
  authors: [{ name: "Swadesh Patel", url: "https://github.com/Swadesh-c0de" }],
  creator: "Swadesh Patel",
  metadataBase: new URL("https://kontacts.vercel.app"),
  openGraph: {
    title: "Kontacts — Personal Contacts Manager",
    description: "A minimal, high-performance workspace to organize your professional and personal network.",
    url: "https://kontacts.vercel.app",
    siteName: "Kontacts",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontacts — Personal Contacts Manager",
    description: "A minimal, high-performance workspace to organize your professional and personal network.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${baskerville.variable} ${dancingScript.variable} font-sans antialiased relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Navbar />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
