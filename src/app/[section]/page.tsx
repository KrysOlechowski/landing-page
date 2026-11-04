import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteHeader, sections } from "@/components/site-header";
import { Landscape } from "@/components/landscape";

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

type SectionParams = PageProps<"/[section]">["params"];

async function getSection(params: SectionParams) {
  const { section } = await params;
  const title = Object.hasOwn(sections, section) ? sections[section as keyof typeof sections] : undefined;
  if (!title) notFound();
  return { section, title };
}

export async function generateMetadata({ params }: PageProps<"/[section]">) {
  const { title } = await getSection(params);
  return { title: `${title} — devcat` };
}

async function SectionHeader({ params }: { params: SectionParams }) {
  const { section } = await getSection(params);
  return <SiteHeader current={section} />;
}

async function SectionContent({ params }: { params: SectionParams }) {
  const { section, title } = await getSection(params);
  return (
    <>
      <p className="section-eyebrow">devcat / {section}</p>
      <h1>{title}</h1>
      <p>Ta część mojej strony dopiero powstaje.</p>
      <Link href="/" className="back-link">← Wróć do krajobrazu</Link>
    </>
  );
}

export default function SectionPage({ params }: PageProps<"/[section]">) {
  return (
    <div className="scene">
      <Suspense fallback={<SiteHeader />}>
        <SectionHeader params={params} />
      </Suspense>
      <main id="main-content" className="section-content">
        <Suspense fallback={<p className="section-eyebrow" role="status">Ładowanie sekcji…</p>}>
          <SectionContent params={params} />
        </Suspense>
      </main>
      <div className="section-landscape"><Landscape /></div>
    </div>
  );
}
