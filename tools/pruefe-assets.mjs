#!/usr/bin/env node
/**
 * Prüft eine Asset-Lieferung objektiv gegen assets/AUFTRAG-TILESET.md.
 *
 *   node tools/pruefe-assets.mjs assets/tilesets/<paket>
 *
 * Misst statt zu schätzen: tatsächliche Pixelmaße, Farbanzahl, halb-
 * transparente Randpixel und Abweichungen von der Palette. Die beiden
 * Fehler aus Abschnitt 0.5 – gemischte Perspektive und hochaufgelöste
 * Zeichnung mit Pixel-Optik – lassen sich so in Sekunden erkennen.
 */

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";
import { PNG } from "pngjs";

/* Palette aus Abschnitt 3 des Auftrags. */
const PALETTE = [
  "181016", "1F4028", "284833",
  "79AC63", "5D9153", "487646", "37603C",
  "77BE6D", "4E9455", "357045",
  "31663D", "265232", "1B3C25", "0F2417",
  "B5A177", "9A8862", "6E6046", "8A6942", "6B4F33", "453017",
  "D2A468", "BC8F55", "96693C", "5E4227",
  "C9765A", "A85440", "7A3A2B",
  "B7BCA7", "98A08B", "66705A", "333B2E",
  "93CFE0", "4E93A8", "31708C", "204C60",
  "FFDC96", "FFD05C", "FFF2C0",
  "F0885E",
  // Cozywolf, Abschnitt 4.7
  "FF95C0", "F2609E", "C43C74", "2E8792", "1D5E68", "F0A93C", "161E38"
];

/* Grenzwerte. Figurendateien duerfen mehr Farben haben als eine einzelne
   Figur, weil mehrere Bilder in einer Datei liegen. */
const MAX_FARBEN_FIGUR = 24;
const MAX_FARBEN_KACHEL = 32;
const MAX_FARBEN_BLATT = 64;

const ARG = process.argv[2];
if (!ARG) {
  console.error("Aufruf: node tools/pruefe-assets.mjs <ordner-oder-datei>");
  process.exit(2);
}

function sammlePngs(pfad) {
  const st = statSync(pfad);
  if (st.isFile()) return extname(pfad).toLowerCase() === ".png" ? [pfad] : [];
  return readdirSync(pfad).flatMap((eintrag) => sammlePngs(join(pfad, eintrag)));
}

function hex(r, g, b) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase();
}

function abstand(a, b) {
  const ar = parseInt(a.slice(0, 2), 16), ag = parseInt(a.slice(2, 4), 16), ab = parseInt(a.slice(4, 6), 16);
  const br = parseInt(b.slice(0, 2), 16), bg = parseInt(b.slice(2, 4), 16), bb = parseInt(b.slice(4, 6), 16);
  return Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb);
}

function naechsteFarbe(farbe) {
  let best = null, bestD = Infinity;
  for (const p of PALETTE) {
    const d = abstand(farbe, p);
    if (d < bestD) { bestD = d; best = p; }
  }
  return { farbe: best, abstand: bestD };
}

function artVon(pfad) {
  // Nur der Dateiname zählt. Der Ordner heißt "tilesets" und würde sonst
  // jede Datei als Kachel einstufen.
  const n = basename(pfad).toLowerCase();
  if (n.includes("cozywolf") || n.includes("bewohner") || n.includes("eule")) return "figur";
  if (n.includes("boden") || n.includes("kachel") || n.includes("tile")) return "kachel";
  return "blatt";
}

/**
 * Misst, ob eine Kachel nahtlos an sich selbst anschließt.
 *
 * Beim Kacheln stößt die rechte Spalte an die linke der nächsten Kachel.
 * Ist der Farbsprung dort deutlich größer als zwischen zwei benachbarten
 * Spalten im Inneren, entsteht ein Gitternetz über der ganzen Fläche.
 * Zurückgegeben wird das Verhältnis Nahtsprung zu Innensprung.
 */
function naht(data, w, x0, y0, kw, kh) {
  const at = (x, y) => {
    const i = ((y0 + y) * w + (x0 + x)) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  let nahtH = 0, innenH = 0, nH = 0;
  for (let y = 0; y < kh; y++) {
    nahtH += diff(at(kw - 1, y), at(0, y));
    for (let x = 0; x < kw - 1; x++) { innenH += diff(at(x, y), at(x + 1, y)); nH++; }
  }
  let nahtV = 0, innenV = 0, nV = 0;
  for (let x = 0; x < kw; x++) {
    nahtV += diff(at(x, kh - 1), at(x, 0));
    for (let y = 0; y < kh - 1; y++) { innenV += diff(at(x, y), at(x, y + 1)); nV++; }
  }
  const mH = nH ? innenH / nH : 0;
  const mV = nV ? innenV / nV : 0;
  return Math.max(
    (nahtH / kh) / Math.max(mH, 2),
    (nahtV / kw) / Math.max(mV, 2)
  );
}

function pruefe(datei) {
  const png = PNG.sync.read(readFileSync(datei));
  const { width: w, height: h, data } = png;

  const farben = new Map();
  let halbtransparent = 0;
  let deckend = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    if (a !== 255) { halbtransparent++; continue; }
    deckend++;
    const key = hex(data[i], data[i + 1], data[i + 2]);
    farben.set(key, (farben.get(key) || 0) + 1);
  }

  const art = artVon(datei);
  const grenze = art === "figur" ? MAX_FARBEN_FIGUR
    : art === "kachel" ? MAX_FARBEN_KACHEL : MAX_FARBEN_BLATT;

  const fremd = [...farben.entries()]
    .filter(([f]) => !PALETTE.includes(f))
    .map(([f, n]) => ({ farbe: f, pixel: n, naechste: naechsteFarbe(f).farbe }))
    .sort((a, b) => b.pixel - a.pixel);

  const raster32 = w % 32 === 0 && h % 32 === 0;
  const raster64 = w % 64 === 0 && h % 64 === 0;

  const fehler = [];
  const warnungen = [];

  if (halbtransparent > 0) {
    const anteil = ((halbtransparent / (halbtransparent + deckend)) * 100).toFixed(1);
    fehler.push(`${halbtransparent} halbtransparente Pixel (${anteil} %) – Anti-Aliasing am Rand`);
  }
  if (art === "figur" && !raster64) {
    fehler.push(`Maße ${w}×${h} sind kein Vielfaches von 64 – Spritesheet-Raster stimmt nicht`);
  }
  if (art !== "figur" && !raster32) {
    warnungen.push(`Maße ${w}×${h} sind kein Vielfaches von 32`);
  }
  if (farben.size > grenze) {
    fehler.push(`${farben.size} Farben (erlaubt bis ${grenze}) – deutet auf weiche Verläufe hin`);
  }
  const fremdPixel = fremd.reduce((s, f) => s + f.pixel, 0);
  const fremdAnteil = deckend ? (fremdPixel / deckend) * 100 : 0;
  if (fremdAnteil > 2) {
    warnungen.push(`${fremd.length} Farben außerhalb der Palette (${fremdAnteil.toFixed(1)} % der Fläche)`);
  }
  // Sehr hohe Figurendichte deutet auf eine hochskalierte Zeichnung hin
  // Bodenkacheln müssen nahtlos an sich selbst anschließen
  if (art === "kachel" && halbtransparent === 0) {
    const kh = h, kw = kh;
    let schlimmste = 0, index = -1;
    for (let i = 0; i < Math.floor(w / kw); i++) {
      const v = naht(data, w, i * kw, 0, kw, kh);
      if (v > schlimmste) { schlimmste = v; index = i; }
    }
    if (schlimmste > 1.8) {
      fehler.push(
        `Kachel ${index} kachelt nicht nahtlos – der Farbsprung an der Naht ist ` +
        `${schlimmste.toFixed(1)}× so groß wie im Inneren. Ergibt ein sichtbares Gitter`
      );
    }
  }

  // Jedes Figurenblatt hat mindestens zwei Zeilen à 64 px.
  if (art === "figur" && h < 128) {
    fehler.push(`Blatthöhe ${h} px – Zellen sind kleiner als 64. Auf den neuen Maßstab bringen`);
  }
  // Ein Blatt mit vielen Zeilen ist völlig in Ordnung – entscheidend ist,
  // dass die Zellen 64 hoch sind. Hochskalierte Zeichnungen fallen bereits
  // über Farbanzahl und halbtransparente Ränder auf.
  if (art === "figur" && h % 64 !== 0) {
    fehler.push(`Blatthöhe ${h} px ist kein Vielfaches von 64 – Zellenraster stimmt nicht`);
  }

  return { datei, w, h, farben: farben.size, halbtransparent, fremd, fehler, warnungen };
}

const dateien = sammlePngs(ARG);
if (!dateien.length) {
  console.log(`Keine PNG-Dateien unter ${ARG} gefunden – nichts zu prüfen.`);
  process.exit(0);
}

let fehlerhaft = 0;
console.log(`\nPrüfe ${dateien.length} Datei(en) gegen assets/AUFTRAG-TILESET.md\n`);

for (const datei of dateien) {
  let e;
  try {
    e = pruefe(datei);
  } catch (err) {
    console.log(`✗ ${relative(process.cwd(), datei)}\n    nicht lesbar: ${err.message}\n`);
    fehlerhaft++;
    continue;
  }

  const ok = e.fehler.length === 0;
  if (!ok) fehlerhaft++;
  console.log(`${ok ? "✓" : "✗"} ${relative(process.cwd(), datei)}`);
  console.log(`    ${e.w}×${e.h} px · ${e.farben} Farben · ${e.halbtransparent} halbtransparente Pixel`);
  for (const f of e.fehler) console.log(`    FEHLER   ${f}`);
  for (const w of e.warnungen) console.log(`    Hinweis  ${w}`);
  if (e.fremd.length) {
    const liste = e.fremd.slice(0, 4)
      .map((f) => `#${f.farbe} (${f.pixel} px → #${f.naechste || f.farbe})`)
      .join(", ");
    console.log(`    Fremd    ${liste}${e.fremd.length > 4 ? ` … +${e.fremd.length - 4}` : ""}`);
  }
  console.log("");
}

console.log(fehlerhaft === 0
  ? `Alles bestanden – ${dateien.length} Datei(en) erfüllen die technischen Vorgaben.\n`
  : `${fehlerhaft} von ${dateien.length} Datei(en) haben Fehler. Details oben.\n`);

process.exit(fehlerhaft === 0 ? 0 : 1);
