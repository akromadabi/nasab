import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jejak Nasab — Silsilah Keluarga Digital",
  description:
    "Aplikasi pencatatan silsilah keluarga besar (Bani) yang kolaboratif, modern, dan mudah digunakan.",
  keywords: ["silsilah", "keluarga", "nasab", "bani", "pohon keluarga", "family tree"],
  authors: [{ name: "Jejak Nasab" }],
  openGraph: {
    title: "Jejak Nasab — Silsilah Keluarga Digital",
    description:
      "Aplikasi pencatatan silsilah keluarga besar (Bani) yang kolaboratif, modern, dan mudah digunakan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
