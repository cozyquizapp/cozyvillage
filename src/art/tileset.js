/**
 * Setzt ein geliefertes Tileset auf die Texturschlüssel des Spiels.
 *
 * Die Spiellogik kennt nur Schlüssel wie "tree-0" oder "beaver-1". Hier
 * werden die Zellen aus den gelieferten Blättern ausgeschnitten und unter
 * genau diesen Schlüsseln abgelegt – der Rest des Spiels merkt nichts davon.
 *
 * Aufbau der Blätter nach assets/tilesets/fellgrund-batch1/BATCH1-INDEX.md.
 */

export const TILESET_PFAD = "assets/tilesets/fellgrund-batch1";

/** Lädt die Blätter. Wird in BootScene.preload() aufgerufen. */
export function ladeTileset(scene) {
  const p = TILESET_PFAD;
  scene.load.image("blatt-boden", `${p}/boden.png`);
  scene.load.image("blatt-natur", `${p}/natur_32x48.png`);
  scene.load.image("blatt-gebaeude", `${p}/gebaeude_32.png`);
  scene.load.image("blatt-gueter", `${p}/gueter_32x16.png`);
  scene.load.image("blatt-bewegt", `${p}/bewegt.png`);
  scene.load.image("blatt-biber", `${p}/bewohner_biber.png`);
  scene.load.image("blatt-wolf", `${p}/cozywolf.png`);
}

/**
 * Schneidet eine Zelle aus und legt sie als eigene Textur ab.
 * Durchsichtige Ränder werden entfernt, damit der Fußpunkt stimmt –
 * die Tiefensortierung hängt daran.
 */
function zelle(scene, blatt, key, sx, sy, sw, sh, { trimmen = true } = {}) {
  const quelle = scene.textures.get(blatt);
  if (!quelle || quelle.key === "__MISSING") return false;
  const bild = quelle.getSourceImage();

  const mess = document.createElement("canvas");
  mess.width = sw;
  mess.height = sh;
  const mctx = mess.getContext("2d", { willReadFrequently: true });
  mctx.imageSmoothingEnabled = false;
  mctx.drawImage(bild, sx, sy, sw, sh, 0, 0, sw, sh);

  let x0 = 0, y0 = 0, x1 = sw, y1 = sh;
  if (trimmen) {
    const daten = mctx.getImageData(0, 0, sw, sh).data;
    x0 = sw; y0 = sh; x1 = 0; y1 = 0;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        if (daten[(y * sw + x) * 4 + 3] === 0) continue;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x >= x1) x1 = x + 1;
        if (y >= y1) y1 = y + 1;
      }
    }
    if (x1 <= x0 || y1 <= y0) return false;   // Zelle ist leer
  }

  const bw = x1 - x0, bh = y1 - y0;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const ziel = scene.textures.createCanvas(key, bw, bh);
  const zctx = ziel.getContext();
  zctx.imageSmoothingEnabled = false;
  zctx.drawImage(bild, sx + x0, sy + y0, bw, bh, 0, 0, bw, bh);
  ziel.refresh();
  return true;
}

/** Maße eines Blattes, oder null wenn es fehlt. */
function masse(scene, blatt) {
  const t = scene.textures.get(blatt);
  if (!t || t.key === "__MISSING") return null;
  const bild = t.getSourceImage();
  return { w: bild.width, h: bild.height };
}

/**
 * Ersetzt die Platzhaltertexturen durch die gelieferten.
 *
 * Die Zellgrößen werden aus den Blattmaßen abgeleitet, nicht fest verdrahtet –
 * dadurch passt dieselbe Verdrahtung für 32er- und 64er-Figuren.
 */
export function setzeTileset(scene) {
  const ersetzt = [];
  const nimm = (blatt, key, sx, sy, sw, sh, opt) => {
    if (zelle(scene, blatt, key, sx, sy, sw, sh, opt)) ersetzt.push(key);
  };

  // natur – 5 Zellen nebeneinander: heller Baum, dunkler Baum, Busch 1–3
  const natur = masse(scene, "blatt-natur");
  if (natur) {
    const zw = natur.w / 5, zh = natur.h;
    nimm("blatt-natur", "tree-0", 0, 0, zw, zh);
    nimm("blatt-natur", "tree-0-d", zw, 0, zw, zh);
    nimm("blatt-natur", "bush-0", zw * 2, 0, zw, zh);
    nimm("blatt-natur", "bush-1", zw * 3, 0, zw, zh);
    nimm("blatt-natur", "bush-2", zw * 4, 0, zw, zh);
    // Der Waldkranz nutzt drei Varianten; solange nur zwei geliefert sind, doppeln.
    for (const k of ["tree-1", "tree-2"]) nimm("blatt-natur", k, 0, 0, zw, zh);
    for (const k of ["tree-1-d", "tree-2-d"]) nimm("blatt-natur", k, zw, 0, zw, zh);
  }

  // gebaeude – Verladestation Stufe 1 füllt das ganze Blatt
  const geb = masse(scene, "blatt-gebaeude");
  if (geb) nimm("blatt-gebaeude", "station-1", 0, 0, geb.w, geb.h);

  // gueter – 4 Zellen: Kiste, Schiene, Wagen A, Wagen B
  const gue = masse(scene, "blatt-gueter");
  if (gue) {
    const zw = gue.w / 4;
    nimm("blatt-gueter", "crate", 0, 0, zw, gue.h);
    nimm("blatt-gueter", "schiene", zw, 0, zw, gue.h);
    nimm("blatt-gueter", "cart", zw * 2, 0, zw, gue.h);
    nimm("blatt-gueter", "cart-b", zw * 3, 0, zw, gue.h);
  }

  // bewegt – vier Wasserbilder, ohne Trimmen weil Kacheln randlos sind
  const beweg = masse(scene, "blatt-bewegt");
  if (beweg) {
    const zw = beweg.w / 4;
    for (let i = 0; i < 4; i++) {
      nimm("blatt-bewegt", `wasser-${i}`, i * zw, 0, zw, beweg.h, { trimmen: false });
    }
  }

  // boden – 18 Kacheln in einer Reihe
  const boden = masse(scene, "blatt-boden");
  if (boden) {
    const zw = boden.w / 18;
    for (let i = 0; i < 18; i++) {
      nimm("blatt-boden", `boden-${i}`, i * zw, 0, zw, boden.h, { trimmen: false });
    }
  }

  // bewohner_biber – 4×2 Zellen: oben Gehen, unten Tragen
  const biber = masse(scene, "blatt-biber");
  if (biber) {
    const zw = biber.w / 4, zh = biber.h / 2;
    for (let i = 0; i < 4; i++) {
      nimm("blatt-biber", `beaver-${i}`, i * zw, 0, zw, zh);
      nimm("blatt-biber", `beaver-carry-${i}`, i * zw, zh, zw, zh);
    }
  }

  // cozywolf – oben Schlafen, unten Gehen
  const wolf = masse(scene, "blatt-wolf");
  if (wolf) {
    const zw = wolf.w / 4, zh = wolf.h / 2;
    for (let i = 0; i < 4; i++) nimm("blatt-wolf", `wolf-sleep-${i}`, i * zw, 0, zw, zh);
    nimm("blatt-wolf", "wolf-sleep", 0, 0, zw, zh);
    nimm("blatt-wolf", "wolf-stand", 0, zh, zw, zh);
  }

  return ersetzt;
}
