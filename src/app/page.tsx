import { Landscape } from "@/components/landscape";
import { SiteHeader } from "@/components/site-header";
import savedPalette from "@/config/palette.json";

export default async function Home() {
  let editor = null;
  if (process.env.NODE_ENV === "development") {
    const { default: PaletteStudio } = await import("@/components/palette-studio");
    editor = <PaletteStudio initialPalette={savedPalette} />;
  }
  return (
    <div className="scene">
      <SiteHeader />
      <main id="main-content" className="scene-main">
        <h1 className="sr-only">devcat — moja przestrzeń w internecie</h1>
        <Landscape />
      </main>
      {editor}
    </div>
  );
}
