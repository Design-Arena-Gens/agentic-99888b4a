import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Watchlist Organizer",
  description: "Glass morphism watchlist manager for movies and TV shows"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-black via-neutral-900 to-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
