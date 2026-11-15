import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentum — Task Manager",
  description: "A clear space to plan work, track progress, and stay on top of deadlines."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
