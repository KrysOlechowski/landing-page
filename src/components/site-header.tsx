import Link from "next/link";
import { CatMark } from "./landscape";

export const sections = {
  work: "Work",
  about: "About",
  skills: "Skills",
  notes: "Notes",
  contact: "Contact",
} as const;

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="devcat — strona główna">
        <CatMark /><span>devcat</span>
      </Link>
      <nav aria-label="Nawigacja główna">
        {Object.entries(sections).map(([slug, label]) => (
          <Link key={slug} href={`/${slug}`} aria-current={current === slug ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
