import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FC } from "react";

import { BackendWarmup } from "@/components/backend-warmup";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

import { Providers } from "./providers";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const siteBaseUrl = ENVIRONMENT_VARIABLES.NEXT_PUBLIC_SITE_BASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: "Tendiflow - Digital Meeting Attendance Tracker",
  applicationName: "Tendiflow",
  authors: {
    name: "Tendiflow",
    url: siteBaseUrl,
  },
  referrer: "origin",
  icons: {
    icon: "/static/favicon.ico",
    shortcut: "/static/favicon.ico",
    apple: "/static/tendiflow-seo.png",
  },
  description:
    "Streamline your meeting attendance with digital sign-in and QR code check-in",
  openGraph: {
    type: "website",
    url: siteBaseUrl,
    title: "Tendiflow - Digital Meeting Attendance Tracker",
    siteName: "Tendiflow",
    description:
      "Replace paper sign-in sheets with a modern digital solution for tracking meeting attendance",
    images: [
      {
        url: `${siteBaseUrl}/static/tendiflow-seo.png`,
        width: 1200,
        height: 630,
        alt: "Tendiflow logo with tagline: Streamline Meeting Attendance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tendiflow - Digital Meeting Attendance Tracker",
    description:
      "Modern solution for tracking meeting attendance with QR code check-in",
    images: [`${siteBaseUrl}/static/tendiflow-seo.png`],
  },
  assets: `${siteBaseUrl}/static/`,
  keywords: [
    "meeting attendance",
    "digital sign-in",
    "QR code check-in",
    "attendance tracker",
    "meeting management",
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <BackendWarmup />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
