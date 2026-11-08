"use client";

import { useEffect, useRef, useState } from "react";
import {
  COLOR_KEYS, contrastRatio, hillTones, parsePalette, paletteVariables,
  randomizeHillShades, randomizePalette, type ColorKey, type Palette,
} from "@/lib/palette";
import "./palette-studio.css";

const STORAGE_KEY = "devcat-palette-studio-v1";
const labels: Record<ColorKey, string> = {
  paper: "Tło strony", header: "Tekst headera", cat: "Ikonka kota",
  birds: "Ptaki", butterflies: "Motyle", sun: "Słońce", hills: "Pagórki",
  hillAccent: "Akcent pagórka", trees: "Drzewa", plants: "Rośliny i trawy",
  ink: "Tekst podstron",
};
type Favorite = { name: string; palette: Palette };
type IconName = "palette" | "close" | "lock" | "unlock" | "undo" | "redo" | "shuffle" | "save" | "download";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7c-1-.6-1-2.3.3-2.3H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="11" r=".7" /><circle cx="10" cy="7" r=".7" /><circle cx="15" cy="7.5" r=".7" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    lock: <><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
    unlock: <><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 7-2M12 14v2" /></>,
    undo: <path d="M8 4 3 9l5 5M3 9h11a6 6 0 0 1 0 12" />,
    redo: <path d="m16 4 5 5-5 5M21 9H10a6 6 0 0 0 0 12" />,
    shuffle: <><path d="M3 6h3c5 0 7 12 12 12h3M17 14l4 4-4 4M3 18h3c2 0 4-3 5-6M14 8c1-1 2-2 4-2h3M17 2l4 4-4 4" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z" /><path d="M7 3v6h10V3M7 21v-8h10v8" /></>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function applyPalette(palette: Palette) {
  for (const [key, value] of Object.entries(paletteVariables(palette))) {
    document.documentElement.style.setProperty(key, value);
  }
}

function persist(palette: Palette, favorites: Favorite[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, favorites })); }
  catch { /* File saving and preview still work if browser storage is unavailable. */ }
}

export default function PaletteStudio({ initialPalette }: { initialPalette: Palette }) {
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(initialPalette);
  const [baseline, setBaseline] = useState(initialPalette);
  const [locked, setLocked] = useState<ColorKey[]>([]);
  const [past, setPast] = useState<Palette[]>([]);
  const [future, setFuture] = useState<Palette[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Zmiany widzisz tylko Ty. Zapisz paletę, gdy będzie gotowa.");
  const [saving, setSaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dirty = JSON.stringify(palette) !== JSON.stringify(baseline);
  const contrast = contrastRatio(palette.ink, palette.paper);
  const headerContrast = contrastRatio(palette.header, palette.paper);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); launcherRef.current?.focus(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  function openEditor() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      const restored = stored && parsePalette(stored.palette);
      if (restored) {
        setPalette(restored);
        applyPalette(restored);
      }
      if (stored && Array.isArray(stored.favorites)) {
        setFavorites(stored.favorites.flatMap((item: unknown) => {
          if (!item || typeof item !== "object") return [];
          const candidate = item as Record<string, unknown>;
          const palette = parsePalette(candidate.palette);
          return typeof candidate.name === "string" && palette ? [{ name: candidate.name, palette }] : [];
        }).slice(0, 24));
      }
    } catch { /* Start with the project's palette when a saved draft is invalid. */ }
    setOpen(true);
  }

  function change(next: Palette, status?: string) {
    if (JSON.stringify(next) === JSON.stringify(palette)) return;
    setPast([...past, palette].slice(-40));
    setFuture([]);
    setPalette(next);
    applyPalette(next);
    persist(next, favorites);
    setMessage(status ?? "Podgląd zmieniony. Paleta w projekcie pozostaje bez zmian do zapisu.");
  }

  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    setPast(past.slice(0, -1)); setFuture([palette, ...future]); setPalette(previous);
    applyPalette(previous); persist(previous, favorites); setMessage("Cofnięto zmianę.");
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setPast([...past, palette]); setFuture(future.slice(1)); setPalette(next);
    applyPalette(next); persist(next, favorites); setMessage("Przywrócono zmianę.");
  }

  function toggleLock(key: ColorKey) {
    setLocked(locked.includes(key) ? locked.filter((item) => item !== key) : [...locked, key]);
  }

  async function save() {
    const snapshot = { ...palette };
    setSaving(true);
    setMessage("Zapisywanie palety w projekcie…");
    try {
      const response = await fetch("/api/dev/palette", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(snapshot),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Zapis wymaga lokalnego serwera npm run dev.");
      }
      setBaseline(snapshot);
      setMessage("Zapisano w projekcie. Ta paleta trafi do kolejnego buildu strony.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Zapis się nie udał. Możesz pobrać plik JSON.");
    } finally { setSaving(false); }
  }

  function addFavorite() {
    const title = name.trim() || `Wariant ${favorites.length + 1}`;
    const next = [...favorites, { name: title.slice(0, 40), palette: { ...palette } }].slice(-24);
    setFavorites(next); setName(""); persist(palette, next);
    setMessage(`Zachowano „${title}” w tej przeglądarce.`);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(palette, null, 2) + "\n"], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "palette.json"; anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Pobrano palette.json. Możesz użyć go jako src/config/palette.json.");
  }

  const presets: Favorite[] = [
    { name: "Poranek", palette: { paper: "#fff9f3", header: "#46200f", cat: "#46200f", birds: "#58331d", butterflies: "#58331d", sun: "#ff8b26", hills: "#e98a24", hillAccent: "#898233", trees: "#e98a24", plants: "#898233", ink: "#46200f", spread: 0.65, accentHill: true } },
    { name: "Szałwia", palette: { paper: "#f6f8f0", header: "#293d32", cat: "#293d32", birds: "#394b38", butterflies: "#394b38", sun: "#d6a14b", hills: "#7e9b77", hillAccent: "#557c64", trees: "#7e9b77", plants: "#557c64", ink: "#293d32", spread: 0.75, accentHill: true } },
    { name: "Lawenda", palette: { paper: "#faf6fc", header: "#403045", cat: "#403045", birds: "#5f496b", butterflies: "#5f496b", sun: "#dc9d79", hills: "#9b7cbd", hillAccent: "#8b936c", trees: "#9b7cbd", plants: "#8b936c", ink: "#403045", spread: 0.65, accentHill: true } },
    { name: "Terakota", palette: { paper: "#fff7ef", header: "#4e2c26", cat: "#4e2c26", birds: "#634239", butterflies: "#634239", sun: "#dc9f51", hills: "#b9684b", hillAccent: "#8e8852", trees: "#b9684b", plants: "#8e8852", ink: "#4e2c26", spread: 0.8, accentHill: true } },
  ];

  return (
    <div className="studio-root">
      <button ref={launcherRef} className="studio-launcher" onClick={() => open ? setOpen(false) : openEditor()} aria-expanded={open} aria-controls="palette-studio">
        <Icon name="palette" /><span>Paleta</span><span className="studio-local-dot" /><span className="studio-local-label">lokalnie</span>
      </button>
      {open && (
        <aside id="palette-studio" className="studio-panel" aria-labelledby="studio-title">
          <header className="studio-header">
            <div><p className="studio-kicker">DEVCAT / PRACOWNIA</p><h2 id="studio-title">Kolory krajobrazu</h2></div>
            <button ref={closeRef} className="studio-icon-button" onClick={() => { setOpen(false); launcherRef.current?.focus(); }} aria-label="Zamknij edytor"><Icon name="close" /></button>
          </header>
          <div className="studio-scroll">
            <p className="studio-intro">Jeden kolor. Cała rodzina odcieni.<br />Zobacz, jaki nastrój ma dziś Twoja strona.</p>
            <div className="studio-presets" aria-label="Gotowe palety">
              {presets.map((preset) => <button key={preset.name} onClick={() => {
                const next = { ...preset.palette };
                for (const key of locked) next[key] = palette[key];
                if (locked.includes("hills")) next.spread = palette.spread;
                change(next, `Paleta „${preset.name}”. Zablokowane kolory zostały zachowane.`);
              }}><span className="studio-mini-swatches">{[preset.palette.paper, preset.palette.hills, preset.palette.plants].map((color, i) => <i key={i} style={{ background: color }} />)}</span>{preset.name}</button>)}
            </div>
            <div className="studio-random-actions studio-random-top">
              <button className="studio-button studio-primary" disabled={locked.length === COLOR_KEYS.length} onClick={() => change(randomizePalette(palette, locked), "Wylosowano spójną paletę. Zablokowane kolory zostały zachowane.")}><Icon name="shuffle" />Losuj paletę</button>
              <button className="studio-button" disabled={locked.includes("hills")} onClick={() => change(randomizeHillShades(palette), "Nowe odcienie pagórków — zachowano bazowy ton koloru.")}>Losuj odcienie pagórków</button>
            </div>
            <div className="studio-history">
              <button className="studio-icon-button" onClick={undo} disabled={!past.length} aria-label="Cofnij zmianę"><Icon name="undo" /></button>
              <button className="studio-icon-button" onClick={redo} disabled={!future.length} aria-label="Ponów zmianę"><Icon name="redo" /></button>
              <button className="studio-text-button" onClick={() => change(baseline, "Przywrócono paletę zapisaną w projekcie.")}>Przywróć zapisaną</button>
            </div>
            <div className="studio-rule" />
            <div className="studio-row-heading"><h3>Kolory bazowe</h3><span>blokada = zachowaj</span></div>
            <div className="studio-colors">
              {COLOR_KEYS.map((key) => (
                <div className="studio-color-row" key={key}>
                  <label className="studio-color-picker" style={{ background: palette[key] }}>
                    <input type="color" value={palette[key]} onChange={(event) => change({ ...palette, [key]: event.target.value })} aria-label={`Kolor: ${labels[key]}`} />
                  </label>
                  <label className="studio-color-name">{labels[key]}
                    <input key={palette[key]} aria-label={`HEX: ${labels[key]}`} defaultValue={palette[key]} maxLength={7} spellCheck={false} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} onBlur={(event) => {
                      const value = event.target.value.trim();
                      if (/^#[0-9a-f]{6}$/i.test(value)) change({ ...palette, [key]: value.toLowerCase() });
                      else { event.target.value = palette[key]; setMessage("Użyj koloru w formacie #rrggbb."); }
                    }} />
                  </label>
                  <button className={`studio-icon-button ${locked.includes(key) ? "is-locked" : ""}`} aria-label={`${locked.includes(key) ? "Odblokuj" : "Zablokuj"}: ${labels[key]}`} aria-pressed={locked.includes(key)} onClick={() => toggleLock(key)}><Icon name={locked.includes(key) ? "lock" : "unlock"} /></button>
                </div>
              ))}
            </div>
            <div className="studio-shades">
              <div className="studio-row-heading"><label htmlFor="shade-spread">Zróżnicowanie odcieni</label><output htmlFor="shade-spread">{Math.round(palette.spread * 100)}%</output></div>
              <input id="shade-spread" type="range" min="0" max="100" value={Math.round(palette.spread * 100)} onChange={(event) => change({ ...palette, spread: Number(event.target.value) / 100 })} />
              <div className="studio-tone-strip" aria-label="Odcienie pagórków">{hillTones(palette).map((tone, i) => <span key={i} style={{ background: tone }} title={tone} />)}</div>
              <p>Wspólny ton, różna jasność i intensywność.</p>
              <label className="studio-accent-option"><input type="checkbox" checked={palette.accentHill} onChange={(event) => change({ ...palette, accentHill: event.target.checked })} />Osobny akcent środkowego pagórka</label>
            </div>
            <p className={`studio-contrast ${headerContrast < 4.5 ? "studio-contrast-low" : ""}`}>Kontrast headera: <strong>{headerContrast.toFixed(1)}:1</strong><span>{headerContrast >= 4.5 ? "Czytelny tekst" : "Warto zwiększyć kontrast"}</span></p>
            <p className={`studio-contrast ${contrast < 4.5 ? "studio-contrast-low" : ""}`}>Kontrast podstron: <strong>{contrast.toFixed(1)}:1</strong><span>{contrast >= 4.5 ? "Czytelny tekst" : "Warto zwiększyć kontrast"}</span></p>
            <div className="studio-rule" />
            <h3>Twoje warianty</h3>
            <div className="studio-favorite-form"><input aria-label="Nazwa wariantu" placeholder="np. Morelowy poranek" maxLength={40} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addFavorite(); }} /><button className="studio-button" onClick={addFavorite}>Zachowaj</button></div>
            {favorites.length > 0 ? <ul className="studio-favorites">{favorites.map((favorite, index) => <li key={`${favorite.name}-${index}`}><button className="studio-favorite" onClick={() => change(favorite.palette, `Wczytano wariant „${favorite.name}”.`)}><span className="studio-mini-swatches">{[favorite.palette.paper, favorite.palette.hills, favorite.palette.plants].map((color, i) => <i key={i} style={{ background: color }} />)}</span><span>{favorite.name}</span></button><button className="studio-icon-button" aria-label={`Usuń wariant: ${favorite.name}`} onClick={() => { const next = favorites.filter((_, i) => i !== index); setFavorites(next); persist(palette, next); }}><Icon name="close" /></button></li>)}</ul> : <p className="studio-caption">Warianty zostają w tej przeglądarce.</p>}
          </div>
          <footer className="studio-footer">
            <p className="studio-status" role="status">{message}</p>
            <div className="studio-save-actions"><button className="studio-button studio-primary" onClick={save} disabled={saving || !dirty}><Icon name="save" />{saving ? "Zapisywanie…" : "Zapisz w projekcie"}</button><button className="studio-icon-button studio-export" onClick={download} aria-label="Pobierz paletę JSON" title="Pobierz JSON"><Icon name="download" /></button></div>
            <p className="studio-caption">Edytor działa tylko przy npm run dev.</p>
          </footer>
        </aside>
      )}
    </div>
  );
}
