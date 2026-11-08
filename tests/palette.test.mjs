import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { COLOR_KEYS, contrastRatio, hexToOklch, hillTones, isPalette, oklchToHex, paletteVariables, parsePalette, randomizeHillShades, randomizePalette } from "../src/lib/palette.ts";
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

test("old drafts and favorite palettes keep their colors when split into independent groups", () => {
  const old = { paper: "#fff9f3", ink: "#432110", hills: "#dc8521", sun: "#f8aa31", plants: "#789124", wildlife: "#395327", spread: 0.4, accentHill: true };
  const migrated = parsePalette(old);
  assert.equal(isPalette(migrated), true);
  assert.equal(migrated.header, old.ink);
  assert.equal(migrated.cat, old.ink);
  assert.equal(migrated.birds, old.wildlife);
  assert.equal(migrated.butterflies, old.wildlife);
  assert.equal(migrated.trees, old.hills);
  assert.equal(migrated.hillAccent, old.plants);
  for (const key of ["paper", "ink", "hills", "sun", "plants", "spread", "accentHill"]) assert.equal(migrated[key], old[key]);
  assert.deepEqual(parsePalette(palette), palette);
  assert.equal(parsePalette({ ...old, wildlife: "invalid" }), null);
  assert.equal(parsePalette({ ...palette, trees: undefined }), null);
});

test("header, cat, birds, butterflies, sun, hills and trees use independent color tokens", () => {
  const before = paletteVariables(palette);
  for (const key of ["header", "cat", "birds", "butterflies", "sun", "hills", "trees", "plants", "hillAccent"]) {
    const after = paletteVariables({ ...palette, [key]: "#2358a7" });
    const allowed = new Set([`--scene-${key}`]);
    if (key === "hills") for (let i = 0; i < 8; i++) allowed.add(`--hill-${i}`);
    if (key === "trees") allowed.add("--tree-detail");
    if (key === "hillAccent") allowed.add("--hill-accent");
    assert.notEqual(after[`--scene-${key}`], before[`--scene-${key}`]);
    for (const token of Object.keys(before)) if (!allowed.has(token)) assert.equal(after[token], before[token], `${key} changed ${token}`);
  }
});

test("each separated color can be randomized while all other colors stay locked", () => {
  for (const key of COLOR_KEYS) {
    const generated = randomizePalette(palette, COLOR_KEYS.filter((item) => item !== key), () => 0.37);
    assert.notEqual(generated[key], palette[key]);
    for (const other of COLOR_KEYS.filter((item) => item !== key)) assert.equal(generated[other], palette[other]);
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
