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

/**
 * Ersetzt die Platzhaltertexturen durch die gelieferten.
 * Gibt zurück, welche Schlüssel tatsächlich ersetzt wurden.
 */
export function setzeTileset(scene) {
  const ersetzt = [];
  const nimm = (key, ...args) => { if (zelle(scene, ...args, key ? {} : {})) ersetzt.push(key); };

  // natur_32x48.png – 5 Zellen à 32×48
  const natur = [
    ["tree-0", 0], ["tree-0-d", 1],
    ["bush-0", 2], ["bush-1", 3], ["bush-2", 4]
  ];
  for (const [key, i] of natur) {
    if (zelle(scene, "blatt-natur", key, i * 32, 0, 32, 48)) ersetzt.push(key);
  }
  // Der Waldkranz nutzt drei Varianten – hier gibt es zwei, also doppeln.
  for (const key of ["tree-1", "tree-2"]) {
    if (zelle(scene, "blatt-natur", key, 0, 0, 32, 48)) ersetzt.push(key);
  }
  for (const key of ["tree-1-d", "tree-2-d"]) {
    if (zelle(scene, "blatt-natur", key, 32, 0, 32, 48)) ersetzt.push(key);
  }

  // gebaeude_32.png – Verladestation Stufe 1
  if (zelle(scene, "blatt-gebaeude", "station-1", 0, 0, 32, 32)) ersetzt.push("station-1");

  // gueter_32x16.png – 4 Zellen à 32×16: Kiste, Schiene, Wagen A, Wagen B
  if (zelle(scene, "blatt-gueter", "crate", 0, 0, 32, 16)) ersetzt.push("crate");
  if (zelle(scene, "blatt-gueter", "schiene", 32, 0, 32, 16)) ersetzt.push("schiene");
  if (zelle(scene, "blatt-gueter", "cart", 64, 0, 32, 16)) ersetzt.push("cart");
  if (zelle(scene, "blatt-gueter", "cart-b", 96, 0, 32, 16)) ersetzt.push("cart-b");

  // bewegt.png – vier Wasserbilder à 16×16
  for (let i = 0; i < 4; i++) {
    if (zelle(scene, "blatt-bewegt", `wasser-${i}`, i * 16, 0, 16, 16, { trimmen: false })) {
      ersetzt.push(`wasser-${i}`);
    }
  }

  // boden.png – 18 Zellen à 16×16: 3×3 Gras, 3×3 Erdweg
  for (let i = 0; i < 18; i++) {
    if (zelle(scene, "blatt-boden", `boden-${i}`, i * 16, 0, 16, 16, { trimmen: false })) {
      ersetzt.push(`boden-${i}`);
    }
  }

  // bewohner_biber.png – 4×2 Zellen à 32×32, oben Gehen, unten Tragen
  for (let i = 0; i < 4; i++) {
    if (zelle(scene, "blatt-biber", `beaver-${i}`, i * 32, 0, 32, 32)) ersetzt.push(`beaver-${i}`);
    if (zelle(scene, "blatt-biber", `beaver-carry-${i}`, i * 32, 32, 32, 32)) {
      ersetzt.push(`beaver-carry-${i}`);
    }
  }

  // cozywolf.png – oben Schlafen, unten Gehen
  for (let i = 0; i < 4; i++) {
    if (zelle(scene, "blatt-wolf", `wolf-sleep-${i}`, i * 32, 0, 32, 32)) ersetzt.push(`wolf-sleep-${i}`);
  }
  if (zelle(scene, "blatt-wolf", "wolf-sleep", 0, 0, 32, 32)) ersetzt.push("wolf-sleep");
  if (zelle(scene, "blatt-wolf", "wolf-stand", 0, 32, 32, 32)) ersetzt.push("wolf-stand");

  return ersetzt;
}
