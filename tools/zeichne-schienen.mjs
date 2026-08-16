#!/usr/bin/env node
/**
 * Zeichnet den Gleissatz für Fellgrunds Schienennetz.
 *
 *   node tools/zeichne-schienen.mjs
 *
 * Warum als Code und nicht von Hand: Ein Gleisnetz besteht aus Teilen, die
 * exakt aneinanderpassen müssen. Eine Kurve, deren Schienen zwei Pixel neben
 * der Geraden enden, ist als Bild kaum zu bemerken und im Spiel sofort
 * sichtbar. Hier liegt das Querschnittsprofil an genau einer Stelle, und
 * jedes Teil wird daraus erzeugt – gerade wie gebogen. Die Enden können
 * deshalb nicht auseinanderlaufen.
 *
 * Das Profil ist aus dem gelieferten Schienenstück in `gueter_64x32.png`
 * abgemessen, nicht erfunden: zwei Schienen im Abstand von vier Pixeln, je
 * eine Schattenzeile darunter, Schwellen dazwischen, Schotter außen.
 * Alle Farben stammen aus der Palette in Abschnitt 3 des Auftrags.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import { join } from "node:path";

const ZELLE = 32;
const ZIEL = "assets/tilesets/fellgrund-batch1";

/* Farben, gemessen am gelieferten Schienenstück ------------------------- */
const F = {
  schotterRand: [0x45, 0x30, 0x17],
  schotter:     [0x5e, 0x42, 0x27],
  schwelle:     [0x6b, 0x4f, 0x33],
  schwelleHell: [0x96, 0x69, 0x3c],
  schiene:      [0x66, 0x70, 0x5a],
  schieneHell:  [0x9a, 0x88, 0x62],
  schatten:     [0x16, 0x1e, 0x38],
  holz:         [0x8a, 0x69, 0x42]
};

/* Querschnitt, in Pixeln vom Mittelstrich aus ---------------------------- */
const SCHOTTER_HALB = 4.3;   // Außenkante des Schotterbetts
const BETT_HALB     = 3.6;   // Innenkante, ab hier liegen die Schwellen
const SCHIENE_INNEN = 1.5;   // Schienen sitzen zwischen 1,5 und 2,5
const SCHIENE_AUSSEN = 2.5;
const SCHWELLE_ABSTAND = 4;  // alle vier Pixel Bogenlänge eine Schwelle
const SCHWELLE_BREITE  = 2;

/* --------------------------------------------------------------------- *
 * Wege: eine Zelle ist eine Liste von Mittelpunkten samt Bogenlänge.
 * --------------------------------------------------------------------- */

/** Gerade von a nach b, über die Zellgrenze hinaus, damit nichts abreißt. */
function gerade(ax, ay, bx, by) {
  const punkte = [];
  const laenge = Math.hypot(bx - ax, by - ay);
  const schritte = Math.ceil(laenge * 4);
  for (let i = 0; i <= schritte; i++) {
    const q = i / schritte;
    punkte.push({ x: ax + (bx - ax) * q, y: ay + (by - ay) * q, s: q * laenge });
  }
  return punkte;
}

/**
 * Viertelkreis. Mittelpunkt und Radius sind so gewählt, dass der Bogen die
 * Zelle genau in den Kantenmitten verlässt – dort, wo auch eine Gerade
 * ankommt. Das ist die ganze Kunst an einem Gleissatz.
 */
function bogen(cx, cy, r, vonWinkel, bisWinkel) {
  const punkte = [];
  const spanne = bisWinkel - vonWinkel;
  const laenge = Math.abs(spanne) * r;
  const schritte = Math.ceil(laenge * 4);
  for (let i = 0; i <= schritte; i++) {
    const q = i / schritte;
    const a = vonWinkel + spanne * q;
    punkte.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, s: q * laenge });
  }
  return punkte;
}

const H = ZELLE / 2;   // 16 – die Kantenmitte
const R = ZELLE / 2;   // Kurvenradius: von Kantenmitte zu Kantenmitte

const WEGE = {
  waagerecht: [gerade(-2, H, ZELLE + 2, H)],
  senkrecht:  [gerade(H, -2, H, ZELLE + 2)],
  // Viertelkreise. Der Mittelpunkt liegt jeweils in einer Zellecke.
  kurveLinksOben:   [bogen(0, 0, R, Math.PI / 2, 0)],
  kurveRechtsOben:  [bogen(ZELLE, 0, R, Math.PI, Math.PI / 2)],
  kurveLinksUnten:  [bogen(0, ZELLE, R, -Math.PI / 2, 0)],
  kurveRechtsUnten: [bogen(ZELLE, ZELLE, R, Math.PI, Math.PI * 1.5)],
  kreuzung: [gerade(-2, H, ZELLE + 2, H), gerade(H, -2, H, ZELLE + 2)],
  weiche:   [gerade(-2, H, ZELLE + 2, H), bogen(0, ZELLE, R, -Math.PI / 2, 0)]
};

/* --------------------------------------------------------------------- *
 * Malen
 * --------------------------------------------------------------------- */

function setz(png, x, y, farbe) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (y * png.width + x) * 4;
  png.data[i] = farbe[0];
  png.data[i + 1] = farbe[1];
  png.data[i + 2] = farbe[2];
  png.data[i + 3] = 255;   // niemals halbtransparent
}

function farbeAn(png, x, y) {
  const i = (y * png.width + x) * 4;
  return png.data[i + 3] === 0 ? null : [png.data[i], png.data[i + 1], png.data[i + 2]];
}

function gleich(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/** Nächster Wegpunkt zu einem Pixelmittelpunkt. */
function naechster(wege, px, py) {
  let best = null, bestD = Infinity;
  for (const weg of wege) {
    for (const p of weg) {
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < bestD) { bestD = d; best = p; }
    }
  }
  return { d: bestD, s: best ? best.s : 0 };
}

function zeichneZelle(png, ox, wege) {
  // Schotter, Schwellen und Schienen
  for (let y = 0; y < ZELLE; y++) {
    for (let x = 0; x < ZELLE; x++) {
      const { d, s } = naechster(wege, x + 0.5, y + 0.5);
      if (d > SCHOTTER_HALB) continue;

      let farbe = F.schotterRand;
      if (d <= BETT_HALB) {
        farbe = F.schotter;
        // Schwellen liegen quer zum Weg, in gleichmäßigem Abstand
        if (s % SCHWELLE_ABSTAND < SCHWELLE_BREITE) {
          farbe = (s % (SCHWELLE_ABSTAND * 2)) < SCHWELLE_BREITE
            ? F.schwelleHell : F.schwelle;
        }
      }
      if (d >= SCHIENE_INNEN && d < SCHIENE_AUSSEN) {
        // Auf der Schiene liegt ein feiner Glanz, aber nicht durchgehend
        farbe = (s % 7) < 3 ? F.schieneHell : F.schiene;
      }
      setz(png, ox + x, y, farbe);
    }
  }

  // Schattenzeile unter jeder Schiene. Das Licht kommt in Fellgrund immer
  // von oben, deshalb liegt der Schatten in Bildkoordinaten unten – nicht
  // entlang der Wegnormalen, sonst wandert er in Kurven mit.
  for (let y = ZELLE - 1; y >= 1; y--) {
    for (let x = 0; x < ZELLE; x++) {
      const oben = farbeAn(png, ox + x, y - 1);
      const hier = farbeAn(png, ox + x, y);
      if (!hier) continue;
      const istSchiene = gleich(oben, F.schiene) || gleich(oben, F.schieneHell);
      const istUntergrund = gleich(hier, F.schotter) || gleich(hier, F.schwelle)
        || gleich(hier, F.schwelleHell) || gleich(hier, F.schotterRand);
      if (istSchiene && istUntergrund) setz(png, ox + x, y, F.schatten);
    }
  }
}

/* --------------------------------------------------------------------- *
 * Prellbock: ein Streckenende, das man als Ende erkennt
 * --------------------------------------------------------------------- */

function zeichnePrellbock(png, ox, richtung) {
  // `richtung` ist die Fahrtrichtung auf den Bock zu: +1 heißt, die Strecke
  // kommt von links und endet rechts.
  // Das Gleis läuft nur bis zum Bock, nicht darüber hinaus.
  const bis = richtung > 0 ? ZELLE - 8 : 8;
  zeichneZelle(png, ox, [
    richtung > 0 ? gerade(-2, H, bis, H) : gerade(bis, H, ZELLE + 2, H)
  ]);

  const balken = richtung > 0 ? ZELLE - 8 : 5;   // linke Kante des Balkens

  // Schräge Strebe vom Fuß des Balkens zurück ins Gleisbett – zuerst,
  // damit der Balken sie überdeckt.
  for (let i = 0; i < 7; i++) {
    const x = balken + (richtung > 0 ? 1 - i : 2 + i);
    setz(png, ox + x, H + 4 + Math.floor(i * 0.7), F.schotterRand);
    setz(png, ox + x, H + 3 + Math.floor(i * 0.7), F.holz);
  }

  // Der Balken selbst: drei Pixel breit, mit heller Lichtkante
  for (let y = H - 7; y <= H + 7; y++) {
    setz(png, ox + balken, y, F.schotterRand);
    setz(png, ox + balken + 1, y, F.holz);
    setz(png, ox + balken + 2, y, F.schwelle);
  }
  // Kopf- und Fußkante etwas heller, damit er räumlich wirkt
  for (let x = balken; x <= balken + 2; x++) {
    setz(png, ox + x, H - 7, F.schwelleHell);
  }

  // Zwei Puffer auf Schienenhöhe, der Strecke entgegen
  for (const o of [-2, 2]) {
    for (let i = 1; i <= 3; i++) {
      const x = balken + (richtung > 0 ? -i : 2 + i);
      setz(png, ox + x, H + o, i === 3 ? F.schieneHell : F.schwelleHell);
    }
    setz(png, ox + balken + (richtung > 0 ? -3 : 5), H + o + 1, F.schatten);
  }
}

/* --------------------------------------------------------------------- *
 * Blätter schreiben
 * --------------------------------------------------------------------- */

const REIHENFOLGE = [
  "waagerecht", "senkrecht",
  "kurveLinksOben", "kurveRechtsOben", "kurveLinksUnten", "kurveRechtsUnten",
  "kreuzung", "weiche"
];

mkdirSync(ZIEL, { recursive: true });

const netz = new PNG({ width: ZELLE * REIHENFOLGE.length, height: ZELLE });
netz.data.fill(0);
REIHENFOLGE.forEach((name, i) => zeichneZelle(netz, i * ZELLE, WEGE[name]));
writeFileSync(join(ZIEL, "schienen_32.png"), PNG.sync.write(netz));

const bock = new PNG({ width: ZELLE * 2, height: ZELLE });
bock.data.fill(0);
zeichnePrellbock(bock, 0, -1);
zeichnePrellbock(bock, ZELLE, 1);
writeFileSync(join(ZIEL, "prellbock_32.png"), PNG.sync.write(bock));

console.log(`schienen_32.png   ${netz.width}×${netz.height}  – ${REIHENFOLGE.join(", ")}`);
console.log(`prellbock_32.png  ${bock.width}×${bock.height}  – Ende links, Ende rechts`);
