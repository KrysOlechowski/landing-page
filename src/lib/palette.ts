// A small, dependency-free OKLCH palette engine shared by the server and studio.
export const COLOR_KEYS = ["paper", "ink", "hills", "sun", "plants", "wildlife"] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];
export type Palette = Record<ColorKey, string> & { spread: number; accentHill: boolean };
export type Oklch = { l: number; c: number; h: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function isPalette(value: unknown): value is Palette {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Object.keys(candidate).length === COLOR_KEYS.length + 2 &&
    COLOR_KEYS.every((key) => typeof candidate[key] === "string" && /^#[0-9a-f]{6}$/i.test(candidate[key])) &&
    typeof candidate.spread === "number" &&
    Number.isFinite(candidate.spread) && candidate.spread >= 0 && candidate.spread <= 1 &&
    typeof candidate.accentHill === "boolean"
  );
}

export function hexToOklch(hex: string): Oklch {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error("Expected a six-digit hex color");
  const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = rgb.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: lightness, c: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
}

function linearRgb({ l, c, h }: Oklch): number[] {
  const a = c * Math.cos(h * Math.PI / 180);
  const b = c * Math.sin(h * Math.PI / 180);
  const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const ss = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
  ];
}

export function oklchToHex(color: Oklch): string {
  const l = clamp(color.l);
  let low = 0;
  let high = Math.max(0, color.c);
  const inGamut = (c: number) => linearRgb({ l, c, h: color.h }).every((v) => v >= -0.0000001 && v <= 1.0000001);
  // Check the requested color first: the sRGB blue cusp isn't radially convex.
  if (inGamut(high)) low = high;
  // Reduce chroma outside sRGB rather than independently clipping RGB channels.
  for (let i = 0; i < 24 && low !== high; i++) {
    const c = (low + high) / 2;
    if (inGamut(c)) low = c;
    else high = c;
  }
  return "#" + linearRgb({ l, c: low, h: color.h }).map((v) => {
    const channel = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055;
    return Math.round(clamp(channel) * 255).toString(16).padStart(2, "0");
  }).join("");
}

export function hillTones(palette: Palette): string[] {
  const base = hexToOklch(palette.hills);
  return Array.from({ length: 8 }, (_, index) => {
    const depth = index / 7;
    return oklchToHex({
      h: base.h,
      l: clamp(base.l + (0.18 - depth * 0.29) * palette.spread, 0.2, 0.96),
      c: base.c * (1 - palette.spread * 0.55 * (1 - depth)),
    });
  });
}

export function paletteVariables(palette: Palette): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of COLOR_KEYS) vars[`--scene-${key}`] = palette[key];
  hillTones(palette).forEach((tone, index) => { vars[`--hill-${index}`] = tone; });
  vars["--hill-accent"] = palette.accentHill ? palette.plants : vars["--hill-7"];
  return vars;
}

export function randomizePalette(palette: Palette, locked: readonly ColorKey[], random = Math.random): Palette {
  const next = { ...palette };
  const baseHue = random() * 360;
  const settings: Record<ColorKey, Oklch> = {
    paper: { l: 0.965 + random() * 0.025, c: 0.008 + random() * 0.014, h: baseHue },
    ink: { l: 0.22 + random() * 0.09, c: 0.025 + random() * 0.035, h: baseHue },
    hills: { l: 0.57 + random() * 0.14, c: 0.085 + random() * 0.065, h: baseHue },
    sun: { l: 0.72 + random() * 0.08, c: 0.12 + random() * 0.055, h: baseHue + 25 },
    plants: { l: 0.48 + random() * 0.12, c: 0.075 + random() * 0.055, h: baseHue + 65 },
    wildlife: { l: 0.3 + random() * 0.1, c: 0.035 + random() * 0.035, h: baseHue + 10 },
  };
  for (const key of COLOR_KEYS) if (!locked.includes(key)) next[key] = oklchToHex(settings[key]);
  return next;
}

export function randomizeHillShades(palette: Palette, random = Math.random): Palette {
  const base = hexToOklch(palette.hills);
  return {
    ...palette,
    hills: oklchToHex({ h: base.h, l: 0.54 + random() * 0.22, c: Math.max(0.025, base.c * (0.7 + random() * 0.55)) }),
    spread: 0.25 + random() * 0.75,
  };
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
      .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
