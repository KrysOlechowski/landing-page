import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { COLOR_KEYS, contrastRatio, hexToOklch, hillTones, isPalette, oklchToHex, paletteVariables, randomizeHillShades, randomizePalette } from "../src/lib/palette.ts";
import { maySavePalette } from "../src/lib/studio-access.ts";

const palette = JSON.parse(readFileSync(new URL("../src/config/palette.json", import.meta.url), "utf8"));

test("saved palette validates; malformed or unsafe values are rejected", () => {
  assert.equal(isPalette(palette), true);
  for (const value of [null, [], {}, { ...palette, spread: NaN }, { ...palette, spread: 2 }, { ...palette, hills: "red; background:url(x)" }, { ...palette, target: "../file" }]) {
    assert.equal(isPalette(value), false);
  }
});

test("sRGB colors survive OKLCH round trips, including gamut boundaries", () => {
  for (const hex of ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#e98a24", "#898233", "#7655aa"]) {
    assert.equal(oklchToHex(hexToOklch(hex)), hex);
  }
});

test("hill tones keep one hue and get darker towards the foreground", () => {
  const base = hexToOklch(palette.hills);
  const tones = hillTones(palette).map(hexToOklch);
  assert.equal(tones.length, 8);
  tones.forEach((tone, index) => {
    assert.ok(Math.abs(tone.h - base.h) < 2);
    if (index) assert.ok(tone.l < tones[index - 1].l);
  });
  assert.equal(new Set(hillTones({ ...palette, spread: 0 })).size, 1);
});

test("random palettes preserve locks and hill variations preserve the hue", () => {
  const generated = randomizePalette(palette, ["paper", "sun"], () => 0.4);
  assert.equal(generated.paper, palette.paper);
  assert.equal(generated.sun, palette.sun);
  assert.equal(isPalette(generated), true);
  assert.deepEqual(randomizePalette(palette, COLOR_KEYS, () => 0.8), palette);
  const shades = randomizeHillShades(palette, () => 0.5);
  assert.ok(Math.abs(hexToOklch(shades.hills).h - hexToOklch(palette.hills).h) < 2);
  for (const key of COLOR_KEYS.filter((key) => key !== "hills")) assert.equal(shades[key], palette[key]);
  assert.deepEqual(paletteVariables(palette), paletteVariables(palette));
});

test("contrast calculation matches black and white reference", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#ffffff", "#ffffff"), 1);
  assert.ok(contrastRatio(palette.ink, palette.paper) > 4.5);
});

test("file writes are allowed only for same-origin, loopback development requests", () => {
  const local = new Request("http://localhost:3000/api/dev/palette", { headers: { origin: "http://localhost:3000", host: "localhost:3000" } });
  assert.equal(maySavePalette(local, "development"), true);
  assert.equal(maySavePalette(local, "production"), false);
  for (const headers of [
    { origin: "https://elsewhere.example", host: "localhost:3000" },
    { host: "localhost:3000" },
    { origin: "http://localhost:3000", host: "elsewhere.example" },
    { origin: "null", host: "localhost:3000" },
  ]) assert.equal(maySavePalette(new Request(local.url, { headers }), "development"), false);
  const remote = new Request("https://devcat.example/api/dev/palette", { headers: { origin: "https://devcat.example", host: "devcat.example" } });
  assert.equal(maySavePalette(remote, "development"), false);
});
