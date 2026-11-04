import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, sections } from "@/components/site-header";
import { Landscape } from "@/components/landscape";

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const title = Object.hasOwn(sections, section) ? sections[section as keyof typeof sections] : undefined;
  if (!title) notFound();
  return { title: `${title} — devcat` };
}

export default async function SectionPage({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const title = Object.hasOwn(sections, section) ? sections[section as keyof typeof sections] : undefined;
  if (!title) notFound();
  return (
    <div className="scene">
      <SiteHeader current={section} />
      <main id="main-content" className="section-content">
        <p className="section-eyebrow">devcat / {section}</p>
        <h1>{title}</h1>
        <p>Ta część mojej strony dopiero powstaje.</p>
        <Link href="/" className="back-link">← Wróć do krajobrazu</Link>
      </main>
      <div className="section-landscape"><Landscape /></div>
    </div>
  );
}
