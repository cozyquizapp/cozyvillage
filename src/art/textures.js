/**
 * Erzeugt alle Platzhaltertexturen beim Start.
 *
 * ────────────────────────────────────────────────────────────────
 *  AUSTAUSCHPUNKT FÜR EIN FERTIGES TILESET
 *  Der Rest des Spiels kennt nur die Texturschlüssel unten. Wer ein
 *  gekauftes oder freies Set einsetzen will, lädt es in der BootScene
 *  und liefert dieselben Schlüssel – Spiellogik und Szenen bleiben
 *  unverändert. Siehe assets/README.md.
 * ────────────────────────────────────────────────────────────────
 */

import { PAL, rect, ellipse, shadow, drawChars, makeRandom } from "./pixels.js";
import {
  WOLF_HALF, WOLF_LIGHT, WOLF_TAIL, WOLF_PAL,
  WOLF_SLEEP, WOLF_SLEEP_PAL, BEAVER, BEAVER_PAL, CRITTERS
} from "./sprites.js";
import { VIEW, GLADE, gladeHalf, insideGlade, PATH, RAIL, PLACES, K } from "../game/config.js";

/** Legt eine Leinwandtextur an und ruft die Zeichenfunktion darauf auf. */
function tex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  // Die Zeichenbefehle bleiben im Entwurfsmaßstab; die Leinwand ist K-fach
  // größer. Platzhalter werden dadurch klotzig, aber maßhaltig – die feinen
  // Fassungen liefert das Tileset.
  const canvas = scene.textures.createCanvas(key, w * K, h * K);
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(K, 0, 0, K, 0, 0);
  draw(ctx);
  canvas.refresh();
  return canvas;
}

/* --------------------------------------------------------------- *
 * Einzelteile
 * --------------------------------------------------------------- */

export function drawCrate(ctx, x, y) {
  rect(ctx, PAL.ink, x, y, 8, 8);
  rect(ctx, "#A87A48", x + 1, y + 1, 6, 6);
  rect(ctx, "#C99A5E", x + 1, y + 1, 6, 1);
  rect(ctx, "#7A5530", x + 1, y + 6, 6, 1);
  rect(ctx, "#7A5530", x + 1, y + 3, 6, 1);
  rect(ctx, "#7A5530", x + 3, y + 1, 1, 6);
  rect(ctx, PAL.berry, x + 4, y + 2, 2, 1);
  rect(ctx, PAL.berryHi, x + 4, y + 2, 1, 1);
}

function drawTree(ctx, cx, baseY, size, variant, dark) {
  const r = size + 3;
  const out = dark ? "#0F2417" : PAL.leafOut;
  const dk = dark ? "#1B3C25" : PAL.leafDk;
  const mid = dark ? "#265232" : PAL.leaf;
  const hi = dark ? "#31663D" : PAL.leafHi;

  shadow(ctx, cx + 4, baseY, r + 3, Math.max(2, size * 0.6));
  rect(ctx, "#160E05", cx - 3, baseY - r - 5, 6, r + 5);
  rect(ctx, dark ? "#1E1408" : PAL.trunkDk, cx - 2, baseY - r - 5, 4, r + 5);
  rect(ctx, dark ? "#2E2011" : PAL.trunk, cx - 2, baseY - r - 5, 2, r + 5);

  const cy = baseY - r - 9;
  const variants = [
    [[0, 1, r], [-r + 2, 3, r - 3], [r - 2, 3, r - 3], [-3, -r + 4, r - 3], [4, -r + 5, r - 4]],
    [[1, 2, r - 1], [-r + 1, 1, r - 2], [r - 3, 4, r - 4], [-1, -r + 3, r - 2], [5, -r + 2, r - 5]],
    [[-1, 0, r - 1], [-r + 3, 4, r - 3], [r - 1, 1, r - 3], [2, -r + 5, r - 2], [-5, -r + 3, r - 4]]
  ];
  const blobs = variants[(variant || 0) % 3];
  for (const b of blobs) ellipse(ctx, out, cx + b[0], cy + b[1], b[2] + 1, b[2] * 0.85 + 1);
  for (const b of blobs) ellipse(ctx, dk, cx + b[0], cy + b[1], b[2], b[2] * 0.85);
  for (const b of blobs) ellipse(ctx, mid, cx + b[0] - 1, cy + b[1] - 1, b[2] - 1, b[2] * 0.85 - 1);
  ellipse(ctx, hi, cx - 3, cy - Math.round(r * 0.55), Math.round(r * 0.55), Math.round(r * 0.4));
}

function drawShrub(ctx, cx, baseY, w, dark) {
  const out = dark ? "#0F2417" : PAL.leafOut;
  const dk = dark ? "#1B3C25" : PAL.leafDk;
  const mid = dark ? "#265232" : PAL.leaf;
  const hi = dark ? "#31663D" : PAL.leafHi;
  shadow(ctx, cx + 2, baseY, w + 1, Math.max(2, w * 0.5), 0.26);
  ellipse(ctx, out, cx, baseY - w * 0.7, w + 1, w * 0.8 + 1);
  ellipse(ctx, dk, cx, baseY - w * 0.7, w, w * 0.8);
  ellipse(ctx, mid, cx - 1, baseY - w * 0.8 - 1, w - 2, w * 0.6);
  ellipse(ctx, hi, cx - 2, baseY - w - 1, w * 0.4, w * 0.3);
}

function drawRock(ctx, cx, baseY, w) {
  shadow(ctx, cx + 2, baseY, w, Math.max(2, w * 0.5), 0.28);
  ellipse(ctx, "#3B4038", cx, baseY - w * 0.5, w, w * 0.6);
  ellipse(ctx, "#5E6459", cx, baseY - w * 0.5 - 1, w - 1, w * 0.6 - 1);
  ellipse(ctx, "#7C8377", cx - 1, baseY - w * 0.6 - 2, w * 0.5, w * 0.3);
}

/* --------------------------------------------------------------- *
 * Hintergrund: Wald, Lichtung, Teich, Weg, Schienen
 * --------------------------------------------------------------- */
/**
 * Kachelt die Lichtung mit den gelieferten Bodenkacheln.
 * Ohne Lieferung bleibt die einfarbige Fläche stehen – der Hintergrund
 * entsteht immer zur Laufzeit, damit Wege und Parzellen veränderbar bleiben.
 */
function kacheleBoden(ctx, scene, s) {
  const t = scene && scene.textures.get("blatt-boden");
  if (!t || t.key === "__MISSING") return false;
  const bild = t.getSourceImage();
  const kh = bild.height;
  const anzahl = Math.floor(bild.width / kh);
  const zeichen = kh / K;
  const rnd = makeRandom(53);

  const W = VIEW.width / K;
  for (let y = s(GLADE.top) - zeichen * 2; y <= s(GLADE.bottom) + zeichen * 2; y += zeichen) {
    for (let x = -zeichen; x < W + zeichen; x += zeichen) {
      const wahl = Math.floor(rnd() * anzahl);
      ctx.drawImage(bild, wahl * kh, 0, kh, kh, x, y, zeichen, zeichen);
    }
  }
  return true;
}

/** Stempelt die Wegflecken entlang der tatsächlichen Route. */
function stempleWeg(ctx, scene, s) {
  const t = scene && scene.textures.get("blatt-wege");
  if (!t || t.key === "__MISSING") return false;
  const bild = t.getSourceImage();
  const h = bild.height;
  // Blattaufbau: 4 runde à 32, 3 längliche à 64, 3 Trittsteine à 16
  const flecken = [];
  let x = 0;
  for (const [anzahl, br] of [[4, 32], [3, 64], [3, 16]]) {
    for (let n = 0; n < anzahl; n++) { flecken.push({ x, br }); x += br; }
  }
  const rnd = makeRandom(71);
  const schritte = 34;
  for (let i = 0; i <= schritte; i++) {
    const q = i / schritte;
    const px_ = s(PATH.from.x + (PATH.to.x - PATH.from.x) * q);
    const py_ = s(PATH.from.y + (PATH.to.y - PATH.from.y) * q);
    const f = flecken[Math.floor(rnd() * 7)];        // nur runde und längliche
    ctx.drawImage(bild, f.x, 0, f.br, h,
      px_ - f.br / (2 * K), py_ - h / (2 * K), f.br / K, h / K);
  }
  // ein paar Trittsteine obenauf
  for (let i = 2; i < schritte; i += 7) {
    const q = i / schritte;
    const px_ = s(PATH.from.x + (PATH.to.x - PATH.from.x) * q);
    const py_ = s(PATH.from.y + (PATH.to.y - PATH.from.y) * q);
    const f = flecken[7 + Math.floor(rnd() * 3)];
    ctx.drawImage(bild, f.x, 0, f.br, h, px_ - 8 / K, py_ - 8 / K, f.br / K, h / K);
  }
  return true;
}

function drawBackground(ctx, scene) {
  const s = (v) => v / K;
  const rnd = makeRandom(31);
  const W = VIEW.width / K, H = VIEW.height / K;

  // Grundfläche. Der Waldrahmen liegt später als eigene Ebene darüber.
  rect(ctx, PAL.grass, 0, 0, W, H);
  const gekachelt = kacheleBoden(ctx, scene, s);

  if (!gekachelt) {
    for (let i = 0; i < 620; i++) {
      const x = Math.floor(rnd() * W);
      const y = Math.floor(rnd() * H);
      const v = rnd();
      const c = v > 0.78 ? PAL.grassHi : v > 0.42 ? PAL.grassDk : PAL.grassLt;
      rect(ctx, c, x, y, 2, 1);
      rect(ctx, c, x + 1, y - 1, 1, 1);
    }
  }

  // Teich
  const pond = { x: s(PLACES.pond.x), y: s(PLACES.pond.y) };
  const wasser = scene && scene.textures.get("wasser-0");
  if (wasser && wasser.key !== "__MISSING") {
    const wb = wasser.getSourceImage();
    const kachel = wb.height / K;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pond.x, pond.y, 27, 14, 0, 0, Math.PI * 2);
    ctx.clip();
    for (let y = pond.y - 16; y < pond.y + 16; y += kachel) {
      for (let x = pond.x - 30; x < pond.x + 30; x += kachel) {
        ctx.drawImage(wb, 0, 0, wb.height, wb.height, x, y, kachel, kachel);
      }
    }
    ctx.restore();
    ellipse(ctx, PAL.grassSh, pond.x, pond.y, 28, 15, -15, -13);
  } else {
    ellipse(ctx, PAL.grassSh, pond.x, pond.y, 27, 14);
    ellipse(ctx, PAL.waterDk, pond.x, pond.y, 24, 12);
    ellipse(ctx, PAL.water, pond.x, pond.y - 1, 22, 11);
    ellipse(ctx, PAL.waterLt, pond.x - 4, pond.y - 4, 13, 5);
  }

  // Weg
  if (!stempleWeg(ctx, scene, s)) {
    for (let i = 0; i <= 26; i++) {
      const q = i / 26;
      const x = s(PATH.from.x + (PATH.to.x - PATH.from.x) * q);
      const y = s(PATH.from.y + (PATH.to.y - PATH.from.y) * q);
      const r = 3 + Math.round(rnd());
      ellipse(ctx, PAL.pathDk, x, y, r + 1, r * 0.7 + 1);
      ellipse(ctx, PAL.path, x, y, r, r * 0.7);
    }
  }

  // Schienenstrecke
  const rf = s(RAIL.from), rt = s(RAIL.to), rY = s(RAIL.y);
  const schiene = scene && scene.textures.get("schiene");
  if (schiene && schiene.key !== "__MISSING") {
    const sb = schiene.getSourceImage();
    const br = sb.width / K, ho = sb.height / K;
    for (let x = rf; x < rt; x += br) {
      ctx.drawImage(sb, 0, 0, sb.width, sb.height, x, rY - ho / 2, br, ho);
    }
  } else {
    rect(ctx, PAL.ballast, rf - 4, rY - 6, rt - rf + 8, 13);
    for (let x = rf; x < rt; x += 6) rect(ctx, PAL.tie, x, rY - 5, 4, 9);
    rect(ctx, PAL.rail, rf - 4, rY - 5, rt - rf + 8, 1);
    rect(ctx, PAL.rail, rf - 4, rY + 4, rt - rf + 8, 1);
  }
}

/* --------------------------------------------------------------- *
 * Alle Texturen anlegen
 * --------------------------------------------------------------- */
export function makeTextures(scene) {
  tex(scene, "bg", VIEW.width / K, VIEW.height / K, (ctx) => drawBackground(ctx, scene));

  // Beerenbusch, drei Leuchtstufen
  for (let g = 0; g < 3; g++) {
    tex(scene, `bush-${g}`, 18, 18, (ctx) => {
      shadow(ctx, 10, 16, 6, 2, 0.28);
      ellipse(ctx, PAL.leafOut, 9, 10, 7, 6);
      ellipse(ctx, PAL.leafDk, 9, 10, 6, 5);
      ellipse(ctx, PAL.leaf, 8, 9, 5, 4);
      ellipse(ctx, PAL.leafHi, 7, 7, 2, 1);
      const lit = [PAL.berry, PAL.berryHi, "#D9A93C"][g];
      rect(ctx, lit, 5, 9, 1, 1);
      rect(ctx, g === 1 ? PAL.berryHi : PAL.berry, 10, 6, 1, 1);
      rect(ctx, g === 2 ? PAL.berryHi : PAL.berry, 12, 11, 1, 1);
    });
  }

  // Verladestation: Grundstufe und Ausbau mit Vordach
  const stationDraw = (roof) => (ctx) => {
    const slots = roof ? 4 : 2;
    const w = 8 + slots * 10;
    const baseY = roof ? 40 : 30;
    const x = 2;
    shadow(ctx, x + w / 2 + 3, baseY, w / 2 + 3, 5);
    if (roof) {
      rect(ctx, PAL.ink, x + 2, baseY - 26, 3, 16);
      rect(ctx, PAL.wood, x + 2, baseY - 26, 2, 16);
      rect(ctx, PAL.ink, x + w - 5, baseY - 26, 3, 16);
      rect(ctx, PAL.wood, x + w - 5, baseY - 26, 2, 16);
      for (let r = 0; r < 7; r++) {
        const rw = w + 6 - r * 2;
        rect(ctx, "#48211A", x - 3 + r, baseY - 34 + r, rw, 1);
        rect(ctx, r === 0 ? PAL.roofHi : r % 3 === 2 ? PAL.roofDk : PAL.roof, x - 3 + r, baseY - 34 + r, rw - 1, 1);
      }
      rect(ctx, "#48211A", x - 3, baseY - 27, w + 6, 1);
      rect(ctx, PAL.lamp, x + Math.floor(w / 2) - 1, baseY - 26, 2, 2);
    } else {
      rect(ctx, PAL.ink, x + 1, baseY - 21, w - 2, 3);
      rect(ctx, PAL.woodLt, x + 2, baseY - 21, w - 4, 1);
      rect(ctx, PAL.ink, x + 2, baseY - 21, 3, 10);
      rect(ctx, PAL.wood, x + 2, baseY - 21, 2, 10);
      rect(ctx, PAL.ink, x + w - 5, baseY - 21, 3, 10);
      rect(ctx, PAL.wood, x + w - 5, baseY - 21, 2, 10);
    }
    rect(ctx, PAL.ink, x - 1, baseY - 13, w + 2, 8);
    rect(ctx, PAL.woodLt, x, baseY - 12, w, 6);
    rect(ctx, PAL.woodHi, x, baseY - 12, w, 1);
    for (let g = 4; g < w; g += 5) rect(ctx, PAL.wood, x + g, baseY - 11, 1, 5);
    rect(ctx, PAL.woodDk, x, baseY - 6, w, 1);
    rect(ctx, PAL.ink, x - 1, baseY - 6, w + 2, 7);
    rect(ctx, PAL.wood, x, baseY - 5, w, 5);
    for (let p = 3; p < w; p += 6) rect(ctx, PAL.woodDk, x + p, baseY - 5, 1, 5);
    rect(ctx, PAL.woodDk, x, baseY - 1, w, 1);
    for (let f = 0; f < slots; f++) {
      rect(ctx, PAL.woodDk, x + 4 + f * 10, baseY - 12, 8, 1);
      rect(ctx, PAL.woodHi, x + 4 + f * 10, baseY - 13, 8, 1);
    }
  };
  tex(scene, "station-1", 32, 32, stationDraw(false));
  tex(scene, "station-2", 52, 42, stationDraw(true));

  // Vorratsstand: offener Unterstand. Der Bestand steht sichtbar im Regal.
  tex(scene, "store", 66, 54, (ctx) => {
    const x = 6, baseY = 52, w = 52;
    shadow(ctx, x + w / 2 + 4, baseY, w / 2 + 3, 6);
    for (let i = 0; i < 9; i++) {
      const rw = w + 10 - i * 2;
      rect(ctx, "#48211A", x - 5 + i, baseY - 46 + i, rw, 1);
      rect(ctx, i === 0 ? PAL.roofHi : i % 3 === 2 ? PAL.roofDk : PAL.roof, x - 5 + i, baseY - 46 + i, rw - 1, 1);
    }
    rect(ctx, "#48211A", x - 6, baseY - 38, w + 12, 2);
    rect(ctx, PAL.roofHi, x - 5, baseY - 39, w + 10, 1);
    rect(ctx, PAL.ink, x + 3, baseY - 37, w - 6, 6);
    rect(ctx, PAL.woodDk, x + 4, baseY - 36, w - 8, 4);
    for (let b = 8; b < w - 8; b += 7) rect(ctx, "#3C2A1A", x + b, baseY - 36, 1, 4);
    rect(ctx, PAL.ink, x + 1, baseY - 38, 4, 38);
    rect(ctx, PAL.wood, x + 2, baseY - 37, 2, 37);
    rect(ctx, PAL.ink, x + w - 5, baseY - 38, 4, 38);
    rect(ctx, PAL.wood, x + w - 4, baseY - 37, 2, 37);
    for (let r = 0; r < 3; r++) {
      const by = baseY - 28 + r * 10;
      rect(ctx, PAL.ink, x + 4, by, w - 8, 3);
      rect(ctx, PAL.wood, x + 4, by, w - 8, 2);
      rect(ctx, PAL.woodLt, x + 4, by, w - 8, 1);
    }
    rect(ctx, PAL.ink, x + w - 9, baseY - 34, 5, 5);
    rect(ctx, PAL.lamp, x + w - 8, baseY - 33, 3, 3);
    rect(ctx, "#FFF3CE", x + w - 8, baseY - 33, 3, 1);
  });

  tex(scene, "crate", 8, 8, (ctx) => drawCrate(ctx, 0, 0));

  tex(scene, "cart", 22, 16, (ctx) => {
    const x = 1, baseY = 15;
    shadow(ctx, x + 9, baseY, 10, 2, 0.3);
    rect(ctx, PAL.ink, x - 1, baseY - 12, 20, 13);
    rect(ctx, PAL.wood, x, baseY - 11, 18, 8);
    rect(ctx, PAL.woodLt, x, baseY - 11, 18, 1);
    rect(ctx, PAL.woodDk, x, baseY - 5, 18, 2);
    for (const gx of [4, 9, 14]) rect(ctx, "#5C4326", x + gx, baseY - 10, 1, 5);
    rect(ctx, PAL.ink, x + 2, baseY - 4, 5, 5);
    rect(ctx, "#6E5232", x + 3, baseY - 3, 3, 3);
    rect(ctx, PAL.ink, x + 12, baseY - 4, 5, 5);
    rect(ctx, "#6E5232", x + 13, baseY - 3, 3, 3);
  });

  // Bramble, zwei Laufbilder
  BEAVER.forEach((rows, i) => {
    tex(scene, `beaver-${i}`, 12, 14, (ctx) => {
      shadow(ctx, 6, 13, 5, 2, 0.32);
      drawChars(ctx, rows, BEAVER_PAL, 1, 1);
    });
  });

  // Cozywolf schlafend, plus Nest
  tex(scene, "wolf-sleep", 28, 20, (ctx) => drawChars(ctx, WOLF_SLEEP, WOLF_SLEEP_PAL, 1, 1));
  tex(scene, "nest", 40, 26, (ctx) => {
    shadow(ctx, 22, 24, 18, 5, 0.26);
    ellipse(ctx, "#20361F", 20, 14, 19, 11);
    ellipse(ctx, "#33512F", 20, 14, 18, 10);
    ellipse(ctx, "#4B7444", 19, 13, 16, 8);
    for (let w = 0; w < 6; w++) rect(ctx, "#8A7448", 8 + w * 5, 9 + (w % 3) * 5, 3, 1);
  });
  tex(scene, "nest-rim", 40, 10, (ctx) => {
    ellipse(ctx, "#20361F", 20, -2, 19, 11, 8, 11);
    ellipse(ctx, "#33512F", 20, -2, 18, 10, 7, 10);
    ellipse(ctx, "#4B7444", 19, -3, 16, 8, 6, 8);
  });

  // Cozywolf stehend – für Dorfbuch und spätere Szenen
  tex(scene, "wolf-stand", 26, 32, (ctx) => {
    drawChars(ctx, WOLF_TAIL, WOLF_PAL, 18, 17);
    drawChars(ctx, WOLF_HALF, WOLF_PAL, 1, 0, 22);
    drawChars(ctx, WOLF_LIGHT, WOLF_PAL, 1, 0, 22);
  });

  // Bewohner-Bildchen für das Dorfbuch
  for (const [key, def] of Object.entries(CRITTERS)) {
    tex(scene, `critter-${key}`, def.w + 2, def.h + 3, (ctx) => {
      shadow(ctx, def.w / 2 + 1, def.h + 1, def.w / 2, 2, 0.3);
      drawChars(ctx, def.rows, def.pal, 1, 0);
    });
  }

  // Bäume in drei Kronenvarianten, hell für die Lichtung, dunkel für den Waldrand
  for (let v = 0; v < 3; v++) {
    for (const dark of [false, true]) {
      const size = 6;
      const w = (size + 3) * 2 + 12;
      const h = (size + 3) * 2 + size + 18;
      tex(scene, `tree-${v}${dark ? "-d" : ""}`, w, h, (ctx) => {
        drawTree(ctx, Math.floor(w / 2), h - 2, size, v, dark);
      });
    }
  }
  tex(scene, "shrub", 16, 16, (ctx) => drawShrub(ctx, 8, 14, 5, false));
  tex(scene, "shrub-d", 16, 16, (ctx) => drawShrub(ctx, 8, 14, 5, true));
  tex(scene, "rock", 16, 12, (ctx) => drawRock(ctx, 8, 10, 4));

  // Laterne
  tex(scene, "lamp", 10, 26, (ctx) => {
    shadow(ctx, 6, 24, 4, 2, 0.3);
    rect(ctx, PAL.ink, 3, 6, 4, 18);
    rect(ctx, PAL.woodDk, 3, 6, 3, 18);
    rect(ctx, PAL.wood, 3, 6, 1, 18);
    rect(ctx, PAL.ink, 1, 0, 8, 7);
    rect(ctx, PAL.lamp, 2, 1, 6, 5);
    rect(ctx, "#FFF3CE", 2, 1, 6, 2);
  });

  // Herzknospe am Nest
  tex(scene, "blossom", 8, 12, (ctx) => {
    rect(ctx, "#3E6440", 3, 4, 1, 8);
    rect(ctx, PAL.ink, 1, 0, 6, 6);
    rect(ctx, "#D9C88A", 3, 1, 2, 1);
    rect(ctx, "#F5E9C0", 2, 2, 4, 2);
    rect(ctx, "#D9C88A", 3, 4, 2, 1);
    rect(ctx, PAL.berryHi, 3, 2, 2, 1);
  });

  // Umriss einer künftigen Parzelle: Potential, kein steriler Platzhalter
  tex(scene, "parcel", 40, 24, (ctx) => {
    ellipse(ctx, "#3C6440", 20, 13, 17, 9);
    ellipse(ctx, "#4C7C4E", 20, 12, 15, 7);
    for (let m = 0; m < 8; m++) {
      const a = (m / 8) * Math.PI * 2;
      rect(ctx, "#6E7A62", 20 + Math.round(Math.cos(a) * 17), 13 + Math.round(Math.sin(a) * 9), 2, 1);
    }
    rect(ctx, PAL.leaf, 16, 6, 1, 4);
    rect(ctx, PAL.leafHi, 16, 5, 1, 1);
    rect(ctx, PAL.leaf, 24, 8, 1, 3);
  });

  // Einzelne Funkenpixel für Quittungen
  tex(scene, "spark", 2, 2, (ctx) => rect(ctx, "#FFF6D0", 0, 0, 2, 2));
}
