import type { Metadata } from "next";
import "./globals.css";
import { VenueProvider } from "@/lib/venueContext";

export const metadata: Metadata = {
  title: "StadiumFlow — AI Crowd Routing for Live Events",
  description:
    "Real-time crowd management and AI-powered routing for 50,000-seat sporting venues. Reduce wait times, optimize gate flow, and enhance the fan experience.",
  keywords: ["stadium", "crowd management", "AI", "routing", "live events", "Gemini", "Firebase"],
  authors: [{ name: "StadiumFlow Team" }],
  openGraph: {
    title: "StadiumFlow — AI Crowd Routing",
    description: "Smart venue assistant for live sporting events",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0c0c0e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0c0c0e] text-white selection:bg-[#ccff00] selection:text-black" role="document">
        <VenueProvider>
          {children}
        </VenueProvider>
      </body>
    </html>
  );
}
