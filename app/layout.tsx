import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File Portal",
  description: "A modern file management portal powered by blogapiservice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
