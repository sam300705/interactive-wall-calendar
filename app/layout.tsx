import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interactive Wall Calendar",
  description: "A beautiful interactive wall calendar with date range selection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-100 flex items-center justify-center p-4 md:p-8">
        {children}
      </body>
    </html>
  );
}
