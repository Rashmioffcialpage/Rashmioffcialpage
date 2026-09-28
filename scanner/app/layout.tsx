import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BinexaHealth Scanner — Free Metabolic Report",
  description:
    "Get your BMI, body composition estimate, and personalized calorie targets in under 2 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
