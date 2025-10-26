import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CUDA Thread Mapper",
  description:
    "Static playground that maps CUDA thread indices to 1D array positions and 2D coordinates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
