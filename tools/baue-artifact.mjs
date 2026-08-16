#!/usr/bin/env node
/**
 * Baut Fellgrund zu einer einzigen HTML-Datei zusammen.
 *
 *   npm run build && node tools/baue-artifact.mjs
 *
 * Das Ergebnis braucht keinen Server und keine Nachbardateien: Das Bündel
 * steht inline, und alle Tileset-Blätter liegen als eingebettete Bilder unter
 * `FELLGRUND_ASSETS`, das `ladeTileset` bevorzugt. Damit lässt sich der
 * aktuelle Stand überall öffnen und wirklich spielen, statt nur anzusehen.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const WURZEL = process.cwd();
const DIST = join(WURZEL, "dist");
const TILES = join(WURZEL, "assets", "tilesets", "fellgrund-batch1");
const ZIEL = join(WURZEL, "fellgrund-spiel.html");

/* Bündel finden und einlesen ------------------------------------------- */

const js = readdirSync(join(DIST, "assets")).filter((n) => n.endsWith(".js"));
if (js.length !== 1) {
  console.error(`Erwarte genau ein JS-Bündel in dist/assets, gefunden: ${js.length}`);
  process.exit(1);
}
const buendel = readFileSync(join(DIST, "assets", js[0]), "utf8");

/* Blätter einbetten ---------------------------------------------------- */

const blaetter = {};
let roh = 0;
for (const datei of readdirSync(TILES).filter((n) => n.endsWith(".png"))) {
  // Die Vorschaubilder sind Dokumentation, kein Laufzeitmaterial.
  if (datei.includes("vorschau")) continue;
  const pfad = join(TILES, datei);
  roh += statSync(pfad).size;
  blaetter[datei] = "data:image/png;base64," + readFileSync(pfad).toString("base64");
}

/* Seite schreiben ------------------------------------------------------ */

// Ein `</script>` in den Daten würde das Skript vorzeitig schließen.
const sicher = (s) => s.replace(/<\/script/gi, "<\\/script");

const seite = `<title>Fellgrund</title>
<style>
  /* Fellgrunds eigene Nachtfarben – die Seite ist der Rahmen um ein festes
     Pixelbild, deshalb bewusst nur ein Erscheinungsbild statt hell und dunkel. */
  html, body { margin: 0; height: 100%; background: #0E1712; }
  #spiel {
    position: fixed; inset: 0;
    display: grid; place-items: center;
    background: #0E1712;
  }
  #spiel canvas { image-rendering: pixelated; }
</style>

<div id="spiel"></div>

<script>window.FELLGRUND_ASSETS = ${sicher(JSON.stringify(blaetter))};</script>
<script type="module">${sicher(buendel)}</script>
`;

writeFileSync(ZIEL, seite);

const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";
console.log(`fellgrund-spiel.html geschrieben`);
console.log(`  Bündel      ${mb(buendel.length)}`);
console.log(`  ${String(Object.keys(blaetter).length).padStart(2)} Blätter   ${mb(roh)} → ${mb(seite.length - buendel.length)} eingebettet`);
console.log(`  gesamt      ${mb(seite.length)} (Grenze für Artifacts: 16 MB)`);
