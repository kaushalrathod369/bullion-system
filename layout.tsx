import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold & Silver Bullion System",
  description: "Complete management system for Gold and Silver bullion business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
