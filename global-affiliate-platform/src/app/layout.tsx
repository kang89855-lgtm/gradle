import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Global Travel Deals",
    template: "%s | Global Travel Deals",
  },
  description:
    "Underserved destinations in Vietnam, Malaysia and the Philippines — bookable hotels, tours and transfers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
