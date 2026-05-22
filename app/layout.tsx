import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoxPackerPro — 3D Bin Packing Visualizer",
  description:
    "Optimally arrange boxes inside a container using advanced 3D bin-packing algorithms. Interactive 3D visualization with real-time packing analytics.",
  keywords: ["bin packing", "3D visualization", "box packing", "container loading", "optimization"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg-primary text-zinc-200 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
