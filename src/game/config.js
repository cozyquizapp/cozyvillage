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
  beet:    { x: 112 * K, y: 70 * K,  label: "Glühbeerenbeet" },
  station: { x: 150 * K, y: 125 * K, label: "Verladestation" },
  store:   { x: 245 * K, y: 127 * K, label: "Vorratsstand" },
  nest:    { x: 142 * K, y: 160 * K, label: "Cozywolfs Nest" },
  // Das Becken war so groß, dass Brambles Weg mitten hindurchführte – die
  // Tiere liefen über das Wasser. Es liegt jetzt kleiner und weiter westlich.
  pond:    { x: 85 * K,  y: 103 * K, label: "Wasserbecken", rx: 64, ry: 33 }
};

/**
 * Regalbretter des Vorratsstands, gemessen am gelieferten Bild.
 *
 * Was darüber hinausgeht, stapelt sich als Haufen neben dem Stand. Ein volles
 * Regal mit einem wachsenden Haufen davor sagt "hier passt nichts mehr rein"
 * deutlicher als jede Zahl – und es ist die Vorlage für den Lagerschuppen.
 */
export const REGAL = {
  reihen: [-60, -36, -12],
  spalten: [-33, -11, 11, 33],
  haufen: { x: 56, y: -4, dx: 20, dy: 14, proReihe: 3 }
};

/** Brambles Weg – Tiere laufen ausschließlich auf echten Wegen. */
export const PATH = {
  from: { x: 120 * K, y: 78 * K }, to: { x: 141 * K, y: 120 * K }
};

/**
 * Die einzelnen Büsche des Glühbeerenbeets.
 *
 * Jeder Busch trägt genau eine Kiste und braucht danach Zeit, bis er wieder
 * leuchtet. Damit ist das Beet die erste Stelle, an der die Kette ins Stocken
 * gerät: Wer mehr Tiere anstellt, als das Beet nachwachsen lässt, sieht seine
 * Tiere warten. Die Plätze sind in drei Gruppen geordnet – Grundbeet, zweites
 * und drittes Beet –, damit ein Ausbau die Fläche sichtbar nach außen wachsen
 * lässt statt nur eine Zahl zu erhöhen.
 */
export const BEET_PLAETZE = [
  [-16, -6], [-6, 2], [4, -4], [14, 3], [-10, 8], [8, 8],
  [24, -8], [33, 1], [23, 9], [34, 10],
  [-26, -2], [-22, -12], [-32, 7], [16, 13], [27, 15]
].map(([dx, dy]) => ({ dx: dx * K, dy: dy * K }));

/** Die Tiere, die nacheinander einziehen. Reihenfolge = Reihenfolge der Ausbauten. */
export const ARBEITER = [
  { id: "bramble", name: "Bramble" },
  { id: "fern",    name: "Fern" },
  { id: "moos",    name: "Moos" },
  { id: "kiesel",  name: "Kiesel" }
];

/** Die Schienenstrecke des Wurzelwagens. */
export const RAIL = {
  y: 144 * K, from: 175 * K, to: 280 * K, home: 178 * K, dock: 235 * K
};

/** Die Bäume auf der Lichtungskante werden aus dieser Vorschrift gesetzt. */
export const TREE_RING = { stepY: 10 * K, stepX: 15 * K, margin: 5 * K };

/** Kleine Streuobjekte, damit der Boden nicht überall gleich aussieht. */
export const PROPS = [
  { kind: "rock", x: 75 * K, y: 88 * K, size: 4 * K },
  { kind: "rock", x: 200 * K, y: 75 * K, size: 3 * K },
  { kind: "rock", x: 280 * K, y: 115 * K, size: 5 * K },
  { kind: "shrub", x: 125 * K, y: 150 * K, size: 5 * K },
  { kind: "shrub", x: 60 * K, y: 120 * K, size: 4 * K },
  { kind: "shrub", x: 277 * K, y: 145 * K, size: 5 * K },
  { kind: "rock", x: 50 * K, y: 127 * K, size: 3 * K },
  { kind: "shrub", x: 205 * K, y: 60 * K, size: 4 * K }
];

/** Freie Flächen zeigen Potential, aber keine sterilen Platzhalter. */
export const FUTURE_PARCELS = [
  { x: 260 * K, y: 90 * K, rx: 18 * K, ry: 9 * K, label: "Küche" },
  { x: 215 * K, y: 155 * K, rx: 17 * K, ry: 9 * K, label: "Holz- und Wurzelwerkstatt" }
];

/** Wirtschaft. Ein Ausbau verändert immer Bild, Rhythmus und Leistung zugleich. */
export const RULES = {
  berriesPerCrate: 6,
  harvestSeconds: 1.0,
  dropSeconds: 0.5,
  walkSpeed: 26 * K,
  cartSpeed: 34 * K,
  unloadSeconds: 1.1,
  autosaveSeconds: 5,
  /** Sekunden, bis ein abgeernteter Busch wieder leuchtet. */
  reifeSekunden: 12
};

/**
 * Der Ausbaubaum.
 *
 * Jeder Ausbau löst genau einen sichtbaren Stau auf – keiner ist eine reine
 * Zahlenerhöhung. `ort` bestimmt, in welchem Gebäude-Panel er auftaucht;
 * `nachLieferungen` sorgt dafür, dass immer nur so viel zur Wahl steht, wie
 * die Lichtung gerade fassen kann.
 */
export const UPGRADES = {
  beetzwei: {
    id: "beetzwei", ort: "beet", name: "Zweites Beet",
    cost: 24, unlockAfterDeliveries: 2,
    beschreibung:
      "Neben dem Grundbeet wird ein zweites Feld angelegt. Vier zusätzliche " +
      "Büsche bedeuten vier weitere Kisten, bevor das Beet abgeerntet ist.",
    wirkung: ["Büsche 6 → 10", "Das Beet wächst sichtbar nach rechts"]
  },
  bewaesserung: {
    id: "bewaesserung", ort: "beet", name: "Bewässerungsrinne",
    cost: 160, unlockAfterDeliveries: 11,
    beschreibung:
      "Eine Holzrinne führt vom Wasserbecken zum Beet. Die Büsche leuchten " +
      "deutlich schneller nach – das Beet hält damit mehr Tiere aus.",
    wirkung: ["Nachwachszeit 12 s → 7 s", "Rinne vom Becken zum Beet"]
  },
  beetdrei: {
    id: "beetdrei", ort: "beet", name: "Drittes Beet",
    cost: 780, unlockAfterDeliveries: 26,
    beschreibung:
      "Das Beet greift nun um den ganzen westlichen Rand der Lichtung.",
    wirkung: ["Büsche 10 → 15", "Das Beet umschließt den Weg"]
  },

  wagenlager: {
    id: "wagenlager", ort: "station", name: "Wagenlager",
    cost: 36, unlockAfterDeliveries: 3,
    beschreibung:
      "Die Verladestation bekommt ein Vordach und zwei zusätzliche Kistenplätze. " +
      "Der Wurzelwagen nimmt vier Kisten pro Fahrt statt zwei.",
    wirkung: ["Kistenplätze 2 → 4", "Ladung pro Fahrt 2 → 4", "Neue Blüte an Cozywolfs Nest"]
  },
  schnellschiene: {
    id: "schnellschiene", ort: "station", name: "Geölte Schiene",
    cost: 380, unlockAfterDeliveries: 18,
    beschreibung:
      "Die Schiene wird abgezogen und gefettet. Der Wurzelwagen läuft spürbar " +
      "leichter und ist schneller zurück, bevor die Station volläuft.",
    wirkung: ["Wagen 60 % schneller", "Blanke Schiene statt stumpfem Holz"]
  },
  verladehof: {
    id: "verladehof", ort: "station", name: "Verladehof",
    cost: 1500, unlockAfterDeliveries: 35,
    beschreibung:
      "Aus der Station wird ein kleiner Hof mit zwei weiteren Plätzen.",
    wirkung: ["Kistenplätze 4 → 6", "Ladung pro Fahrt 4 → 6"]
  },

  regalreihe: {
    id: "regalreihe", ort: "store", name: "Zweite Regalreihe",
    cost: 100, unlockAfterDeliveries: 8,
    beschreibung:
      "Der Vorratsstand bekommt eine zweite Reihe Bretter. Es passen mehr " +
      "Kisten hinein, bevor der Wagen nicht mehr abladen kann.",
    wirkung: ["Regalplätze 12 → 20"]
  },
  lagerschuppen: {
    id: "lagerschuppen", ort: "store", name: "Lagerschuppen",
    cost: 560, unlockAfterDeliveries: 22,
    beschreibung:
      "Hinter dem Stand entsteht ein gedeckter Schuppen für den Winter.",
    wirkung: ["Regalplätze 20 → 32"]
  },
  grossbehaelter: {
    id: "grossbehaelter", ort: "store", name: "Tiefe Kisten",
    cost: 2200, unlockAfterDeliveries: 40,
    beschreibung:
      "Die Werkstatt baut tiefere Kisten. Jede einzelne Kiste fasst mehr " +
      "Glühbeeren – das Regal fasst dadurch weit mehr, ohne größer zu werden.",
    wirkung: ["Glühbeeren pro Kiste 6 → 9"]
  },

  pfote2: {
    id: "pfote2", ort: "nest", name: "Fern zieht ein",
    cost: 60, unlockAfterDeliveries: 5,
    beschreibung:
      "Eine zweite Biberin klopft an. Sie erntet am selben Beet und trägt " +
      "zur selben Station – zu zweit ist die Station doppelt so schnell voll.",
    wirkung: ["Zweites Tier auf dem Weg"]
  },
  pfote3: {
    id: "pfote3", ort: "nest", name: "Moos zieht ein",
    cost: 260, unlockAfterDeliveries: 14,
    beschreibung:
      "Ein dritter Biber. Achte darauf, ob das Beet noch nachkommt.",
    wirkung: ["Drittes Tier auf dem Weg"]
  },
  pfote4: {
    id: "pfote4", ort: "nest", name: "Kiesel zieht ein",
    cost: 1100, unlockAfterDeliveries: 30,
    beschreibung:
      "Der vierte Biber. Ohne ausgebautes Beet stehen jetzt Tiere herum.",
    wirkung: ["Viertes Tier auf dem Weg"]
  }
};

/** Alle Ausbauten eines Ortes, in der Reihenfolge des Baums. */
export function ausbautenFuer(ort) {
  return Object.values(UPGRADES).filter((u) => u.ort === ort);
}

export const SAVE_KEY = "fellgrund.spielstand.v1";
