/**
 * Weltaufbau von Fellgrund.
 *
 * Alle Orte sind von Hand gesetzt, nicht generiert. Fellgrund ist eine
 * feste Bühne: Die Lichtung füllt sich, bevor sie wächst.
 */

/**
 * Maßstab. Fellgrund lief zuerst auf 320 × 180 mit 32er-Figuren. Bei dieser
 * Größe reichen die Pixel nicht für Fell, Rinde oder Kistenlatten – die
 * Grafik wird zwangsläufig schlicht. Mit K = 2 bleibt die Komposition exakt
 * gleich (eine Figur nimmt weiterhin 17,8 % der Bildhöhe ein), es stehen
 * aber viermal so viele Pixel zum Zeichnen zur Verfügung.
 */
export const K = 2;

export const VIEW = { width: 320 * K, height: 180 * K };

/** Die Lichtung – klare Kante, rundum von Wald geschlossen. */
export const GLADE = {
  cx: 160 * K, top: 26 * K, bottom: 176 * K, corner: 34 * K, halfWidth: 152 * K
};

/** Halbe Breite der Lichtung auf Höhe y, mit organischer Welle. */
export function gladeHalf(y) {
  if (y < GLADE.top || y > GLADE.bottom) return 0;
  let inset = 0;
  if (y < GLADE.top + GLADE.corner) {
    const d = (GLADE.top + GLADE.corner - y) / GLADE.corner;
    inset = GLADE.corner * (1 - Math.sqrt(Math.max(0, 1 - d * d)));
  } else if (y > GLADE.bottom - GLADE.corner) {
    const d = (y - (GLADE.bottom - GLADE.corner)) / GLADE.corner;
    inset = GLADE.corner * (1 - Math.sqrt(Math.max(0, 1 - d * d)));
  }
  return GLADE.halfWidth - inset + Math.sin(y * 0.5 / K) * 4 * K + Math.sin(y * 0.17 / K) * 3 * K;
}

export function insideGlade(x, y) {
  const hw = gladeHalf(y);
  return hw > 0 && Math.abs(x - GLADE.cx) < hw;
}

/** Bauplätze. Jeder Ort ist eine Parzelle, die über Stufen ausgebaut wird. */
export const PLACES = {
  beet:    { x: 68 * K,  y: 78 * K,  label: "Glühbeerenbeet" },
  station: { x: 132 * K, y: 108 * K, label: "Verladestation" },
  store:   { x: 244 * K, y: 118 * K, label: "Vorratsstand" },
  nest:    { x: 148 * K, y: 164 * K, label: "Cozywolfs Nest" },
  pond:    { x: 56 * K,  y: 150 * K, label: "Wasserbecken" }
};

/** Brambles Weg – Tiere laufen ausschließlich auf echten Wegen. */
export const PATH = {
  from: { x: 82 * K, y: 86 * K }, to: { x: 124 * K, y: 112 * K }
};

/** Die Schienenstrecke des Wurzelwagens. */
export const RAIL = {
  y: 124 * K, from: 150 * K, to: 262 * K, home: 152 * K, dock: 224 * K
};

/** Die Bäume auf der Lichtungskante werden aus dieser Vorschrift gesetzt. */
export const TREE_RING = { stepY: 10 * K, stepX: 15 * K, margin: 5 * K };

/** Kleine Streuobjekte, damit der Boden nicht überall gleich aussieht. */
export const PROPS = [
  { kind: "rock", x: 118 * K, y: 60 * K, size: 4 * K },
  { kind: "rock", x: 86 * K, y: 138 * K, size: 3 * K },
  { kind: "rock", x: 206 * K, y: 152 * K, size: 5 * K },
  { kind: "shrub", x: 100 * K, y: 158 * K, size: 5 * K },
  { kind: "shrub", x: 268 * K, y: 62 * K, size: 4 * K },
  { kind: "shrub", x: 286 * K, y: 140 * K, size: 5 * K },
  { kind: "rock", x: 42 * K, y: 92 * K, size: 3 * K },
  { kind: "shrub", x: 196 * K, y: 52 * K, size: 4 * K }
];

/** Freie Flächen zeigen Potential, aber keine sterilen Platzhalter. */
export const FUTURE_PARCELS = [
  { x: 74 * K, y: 124 * K, rx: 17 * K, ry: 9 * K, label: "Holz- und Wurzelwerkstatt" },
  { x: 236 * K, y: 62 * K, rx: 18 * K, ry: 9 * K, label: "Küche" }
];

/** Wirtschaft. Ein Ausbau verändert immer Bild, Rhythmus und Leistung zugleich. */
export const RULES = {
  berriesPerCrate: 6,
  harvestSeconds: 1.0,
  dropSeconds: 0.5,
  walkSpeed: 26 * K,
  cartSpeed: 34 * K,
  unloadSeconds: 1.1,
  autosaveSeconds: 5
};

export const UPGRADES = {
  wagenlager: {
    id: "wagenlager",
    name: "Wagenlager",
    cost: 36,
    unlockAfterDeliveries: 3,
    beschreibung:
      "Die Verladestation bekommt ein Vordach und zwei zusätzliche Kistenplätze. " +
      "Der Wurzelwagen nimmt vier Kisten pro Fahrt statt zwei.",
    wirkung: ["Kistenplätze 2 → 4", "Ladung pro Fahrt 2 → 4", "Neue Blüte an Cozywolfs Nest"]
  }
};

export const SAVE_KEY = "fellgrund.spielstand.v1";
