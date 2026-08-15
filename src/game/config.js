/**
 * Weltaufbau von Fellgrund.
 *
 * Alle Orte sind von Hand gesetzt, nicht generiert. Fellgrund ist eine
 * feste Bühne: Die Lichtung füllt sich, bevor sie wächst.
 */

export const VIEW = { width: 320, height: 180 };

/** Die Lichtung – klare Kante, rundum von Wald geschlossen. */
export const GLADE = { cx: 160, top: 26, bottom: 176, corner: 34, halfWidth: 152 };

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
  return GLADE.halfWidth - inset + Math.sin(y * 0.5) * 4 + Math.sin(y * 0.17) * 3;
}

export function insideGlade(x, y) {
  const hw = gladeHalf(y);
  return hw > 0 && Math.abs(x - GLADE.cx) < hw;
}

/** Bauplätze. Jeder Ort ist eine Parzelle, die über Stufen ausgebaut wird. */
export const PLACES = {
  beet:    { x: 68,  y: 78,  label: "Glühbeerenbeet" },
  station: { x: 132, y: 108, label: "Verladestation" },
  store:   { x: 244, y: 118, label: "Vorratsstand" },
  nest:    { x: 148, y: 164, label: "Cozywolfs Nest" },
  pond:    { x: 56,  y: 150, label: "Wasserbecken" }
};

/** Brambles Weg – Tiere laufen ausschließlich auf echten Wegen. */
export const PATH = { from: { x: 82, y: 86 }, to: { x: 124, y: 112 } };

/** Die Schienenstrecke des Wurzelwagens. */
export const RAIL = { y: 124, from: 150, to: 262, home: 152, dock: 224 };

/** Die Bäume auf der Lichtungskante werden aus dieser Vorschrift gesetzt. */
export const TREE_RING = { stepY: 10, stepX: 15, margin: 5 };

/** Kleine Streuobjekte, damit der Boden nicht überall gleich aussieht. */
export const PROPS = [
  { kind: "rock",  x: 118, y: 60,  size: 4 },
  { kind: "rock",  x: 86,  y: 138, size: 3 },
  { kind: "rock",  x: 206, y: 152, size: 5 },
  { kind: "shrub", x: 100, y: 158, size: 5 },
  { kind: "shrub", x: 268, y: 62,  size: 4 },
  { kind: "shrub", x: 286, y: 140, size: 5 },
  { kind: "rock",  x: 42,  y: 92,  size: 3 },
  { kind: "shrub", x: 196, y: 52,  size: 4 }
];

/** Freie Flächen zeigen Potential, aber keine sterilen Platzhalter. */
export const FUTURE_PARCELS = [
  { x: 74, y: 124, rx: 17, ry: 9, label: "Holz- und Wurzelwerkstatt" },
  { x: 236, y: 62, rx: 18, ry: 9, label: "Küche" }
];

/** Wirtschaft. Ein Ausbau verändert immer Bild, Rhythmus und Leistung zugleich. */
export const RULES = {
  berriesPerCrate: 6,
  harvestSeconds: 1.0,
  dropSeconds: 0.5,
  walkSpeed: 26,
  cartSpeed: 34,
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
