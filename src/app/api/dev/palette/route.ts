import { rename, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { isPalette, COLOR_KEYS, type Palette } from "@/lib/palette";
import { maySavePalette } from "@/lib/studio-access";

export async function POST(request: Request) {
  // The endpoint stays closed in production even if someone knows its URL.
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!maySavePalette(request, process.env.NODE_ENV)) {
    return Response.json({ error: "Zapis jest dostępny tylko z lokalnego edytora." }, { status: 403 });
  }
  const raw = await request.text();
  if (raw.length > 4096) return Response.json({ error: "Paleta jest zbyt duża." }, { status: 413 });
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { return Response.json({ error: "Nieprawidłowy JSON." }, { status: 400 }); }
  if (!isPalette(value)) return Response.json({ error: "Nieprawidłowe kolory lub zakres odcieni." }, { status: 400 });
  const palette = Object.fromEntries([
    ...COLOR_KEYS.map((key) => [key, (value as Palette)[key].toLowerCase()]),
    ["spread", value.spread],
    ["accentHill", value.accentHill],
  ]);
  const destination = path.join(process.cwd(), "src/config/palette.json");
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(palette, null, 2) + "\n", { flag: "wx" });
    await rename(temporary, destination);
    return Response.json({ saved: true });
  } catch {
    await unlink(temporary).catch(() => {});
    return Response.json({ error: "Nie udało się zapisać pliku palety. Spróbuj ponownie." }, { status: 500 });
  }
}
