import type { Metadata } from "next";
import type { CSSProperties } from "react";
import savedPalette from "@/config/palette.json";
import { paletteVariables } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "devcat",
  description: "Osobista strona devcat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" style={paletteVariables(savedPalette) as CSSProperties}>
      <body>
        <a href="#main-content" className="skip-link">Przejdź do treści</a>
        {children}
      </body>
    </html>
  );
}
