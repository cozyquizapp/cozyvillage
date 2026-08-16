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

/**
 * Bauplätze.
 *
 * Die Aufteilung ist am gelieferten Waldrahmen ausgemessen, nicht geschätzt:
 * Die Lichtung öffnet sich bei y = 110, ist zwischen y = 180 und y = 250 am
 * breitesten (x 50 bis 570) und schließt sich unten ab y = 300 rasch wieder.
 * Jeder Ort liegt vollständig in diesem Bereich – auch bei vollem Ausbau.
 *
 * In der Mitte steht das Nest. Cozywolf gehört auf den Dorfplatz, nicht an
 * den Rand; alles andere ordnet sich um ihn herum an.
 */
export const PLACES = {
  beet:      { x: 185, y: 160, label: "Glühbeerenbeet" },
  station:   { x: 310, y: 244, label: "Verladestation" },
  werkstatt: { x: 390, y: 214, label: "Holz- und Wurzelwerkstatt" },
  store:     { x: 500, y: 244, label: "Vorratsstand" },
  nest:      { x: 320, y: 326, label: "Cozywolfs Nest" },
  pond:      { x: 150, y: 232, label: "Wasserbecken", rx: 44, ry: 22 }
};

/**
 * Die Nutzbäume der Holzkette.
 *
 * Ein Nutzbaum ist die Umkehrung des Beerenbuschs: Er wird beim Abernten
 * sichtbar **kleiner** – voll, halb abgeerntet, Stumpf – und wächst danach
 * wieder nach. Damit gilt die Konzeptregel „Ressourcen dürfen nie nur als
 * Zahl erscheinen" auch für die Quelle, nicht nur für das Ziel.
 */
export const NUTZBAEUME = [
  { x: 150, y: 292 },
  { x: 205, y: 302 },
  { x: 258, y: 312 }
];

/** Der Weg des Eichhörnchens: von den Nutzbäumen zur Verladestation. */
export const HOLZWEG = {
  from: { x: 208, y: 296 }, to: { x: 274, y: 256 }
};

/**
 * Regalbretter des Vorratsstands.
 *
 * Die Werte sind aus `vorratsstand_1_128x96.png` gemessen: Brettoberkanten
 * liegen 48, 33 und 15 px über dem Fuß. Die Fächer sind allerdings nur 15,
 * 12 und 14 px hoch, die Kiste ist 16 px – sie ragt oben leicht heraus.
 * Das ist ein Fehler im Bild, nicht in dieser Rechnung; er ist gemeldet.
 *
 * Was nicht mehr ins Regal passt, stapelt sich neben dem Stand. Ein volles
 * Regal mit einem wachsenden Haufen daneben sagt "hier geht nichts mehr rein"
 * deutlicher als jede Zahl.
 */
export const REGAL = {
  // Sechs sichtbare Plätze auf den beiden oberen Brettern – nicht mehr.
  //
  // Vorher zeigte das Regal jede einzelne Kiste, bis zu sechsunddreißig. Das
  // ergab eine massive braune Wand, die alles andere erschlug und eher nach
  // Debug-Anzeige aussah als nach einem Dorfgebäude. Die Zahl der Kisten war
  // ohnehin nie ablesbar – man zählt sie nicht, man sieht nur, wie voll es
  // ist. Genau das zeigen jetzt sechs Plätze, anteilig gefüllt.
  reihen: [-48, -33],
  spalten: [-28, 0, 28],
  sichtbar: 6
};
/**
 * Die Ladefläche des Wurzelwagens, gemessen an `gueter_64x32.png`.
 *
 * Der Wagen ist 40 × 32 px groß; die Innenfläche liegt zwischen 14 px links
 * und 14 px rechts der Mitte und 16 bis 25 px über dem Fuß. Vorher lagen die
 * Kisten daneben statt darin.
 */
/*
 * Zeilenweise ausgemessen: Der Wagen ist oben 4 px breit, in der Mitte 40 und
 * unten wieder 4 – er ist also **isometrisch** gezeichnet, während Gleise,
 * Station und Vorratsstand orthogonal von oben stehen. Das ist der Grund,
 * warum er schräg auf der Schiene sitzt; als Bild lässt sich das hier nicht
 * beheben, es ist an ChatGPT gemeldet.
 *
 * Die Ladefläche ist zwischen 8 und 14 px über dem Fuß am tiefsten. Die
 * Kisten liegen jetzt dort, nicht mehr darüber in der Luft.
 */
export const WAGEN_BETT = { dx: 6, dy: -13, reihe: 2, stapel: 7 };

/** Brambles Weg – Tiere laufen ausschließlich auf echten Wegen. */
export const PATH = {
  // Das Wegende liegt links vor der Station, nicht darauf. Vorher stand das
  // abliefernde Tier mitten im Gebäude.
  from: { x: 225, y: 205 }, to: { x: 255, y: 250 }
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
  [-20, -4], [-8, 2], [4, -6], [16, 0], [-14, 8], [8, 10],
  [26, -8], [34, 2], [24, 10], [36, 12],
  [-30, -6], [-24, 4], [-32, 12], [2, 18], [20, 20]
].map(([dx, dy]) => ({ dx: dx * K, dy: dy * K }));

/** Die Tiere, die nacheinander einziehen. Reihenfolge = Reihenfolge der Ausbauten. */
export const ARBEITER = [
  { id: "bramble", name: "Bramble" },
  { id: "fern",    name: "Fern" },
  { id: "moos",    name: "Moos" },
  { id: "kiesel",  name: "Kiesel" }
];

/**
 * Die Schienenstrecke des Wurzelwagens.
 *
 * `home` liegt jetzt genau unter der Verladestation und `dock` genau vor dem
 * Vorratsstand – vorher begann die Schiene erst rechts der Station, sodass
 * der Wagen nirgends sichtbar etwas abholte. An beiden Enden steht ein
 * Prellbock, damit die Strecke nicht im Nichts aufhört.
 */
export const RAIL = {
  // Die Strecke liegt zwischen den Gebäuden und dem Dorfplatz: unter der
  // Station und dem Vorratsstand, aber sechzehn Pixel über Cozywolfs Nest.
  // Vorher lief sie mitten durch den Platz – das Herz des Dorfes lag auf
  // dem Gleis. `home` liegt rechts neben der Station statt darunter, wo
  // der wartende Wagen hinter dem Gebäude verschwand.
  y: 262, from: 250, to: 535, home: 380, dock: 470
};

/**
 * Der Streckenplan.
 *
 * Ab hier ist die Schiene keine Gerade mehr, sondern ein Graph. Für die eine
 * Fahrt von der Verladestation zum Vorratsstand wäre das Übermaß – aber die
 * Weiche zur Werkstatt ist schon eingezeichnet, und damit muss der Wagen
 * bereits heute einen Weg *wählen* statt einer Zahl zu folgen. Aus demselben
 * Plan entstehen später die acht Speichen und der Außenring: mehr Knoten,
 * mehr Kanten, kein anderer Code.
 *
 * `halt` heißt: hier hält ein Wagen und lädt. `ende` bekommt einen Prellbock.
 */
export const GLEISPLAN = {
  knoten: [
    { id: "westende",  x: 258, y: 262, art: "ende" },
    { id: "station",   x: 310, y: 262, art: "halt" },
    { id: "weiche",    x: 390, y: 262, art: "durch" },
    { id: "werkstatt", x: 390, y: 218, art: "halt" },
    { id: "lager",     x: 500, y: 262, art: "halt" },
    { id: "ostende",   x: 540, y: 262, art: "ende" }
  ],
  kanten: [
    ["westende", "station"],
    ["station", "weiche"],
    ["weiche", "werkstatt"],
    ["weiche", "lager"],
    ["lager", "ostende"]
  ]
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

/**
 * Freie Flächen zeigen Potential, aber keine sterilen Platzhalter.
 *
 * Beide lagen vorher halb unter etwas anderem: die Küche hinter dem
 * Vorratsstand, die Werkstatt in der unteren Waldkante. Jetzt liegen sie
 * frei auf offenem Rasen.
 */
export const FUTURE_PARCELS = [
  { x: 452, y: 176, rx: 30, ry: 15, label: "Küche" }
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
  reifeSekunden: 12,

  /* Holzkette */
  /** Erntestufen je Nutzbaum, bis er ein Stumpf ist. */
  scheitProBaum: 2,
  /** Sekunden je Stufe, bis ein Nutzbaum wieder nachgewachsen ist. */
  baumReifeSekunden: 20,
  /** Sekunden, die das Eichhörnchen an einem Baum arbeitet. */
  faellSekunden: 1.6,
  /** Sekunden, die die Werkstatt für ein Brett aus einem Scheit braucht. */
  brettSekunden: 6,
  /** Scheite, die im Holzstapel der Werkstatt Platz haben. */
  holzstapel: 6
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
    cost: 110, unlockAfterDeliveries: 10,
    beschreibung:
      "Eine Holzrinne führt vom Wasserbecken zum Beet. Die Büsche leuchten " +
      "deutlich schneller nach – das Beet hält damit mehr Tiere aus.",
    wirkung: ["Nachwachszeit 12 s → 7 s", "Rinne vom Becken zum Beet"]
  },
  beetdrei: {
    id: "beetdrei", ort: "beet", name: "Drittes Beet",
    cost: 195, unlockAfterDeliveries: 24,
    beschreibung:
      "Das Beet greift nun um den ganzen westlichen Rand der Lichtung.",
    wirkung: ["Büsche 10 → 15", "Das Beet umschließt den Weg"]
  },

  wagenlager: {
    id: "wagenlager", ort: "station", name: "Wagenlager",
    cost: 40, unlockAfterDeliveries: 3,
    beschreibung:
      "Die Verladestation bekommt ein Vordach und zwei zusätzliche Kistenplätze. " +
      "Der Wurzelwagen nimmt vier Kisten pro Fahrt statt zwei.",
    wirkung: ["Kistenplätze 2 → 4", "Ladung pro Fahrt 2 → 4", "Neue Blüte an Cozywolfs Nest"]
  },
  schnellschiene: {
    id: "schnellschiene", ort: "station", name: "Geölte Schiene",
    cost: 175, unlockAfterDeliveries: 20,
    beschreibung:
      "Die Schiene wird abgezogen und gefettet. Der Wurzelwagen läuft spürbar " +
      "leichter und ist schneller zurück, bevor die Station volläuft.",
    bretter: 6,
    wirkung: ["Wagen 60 % schneller", "Blanke Schiene statt stumpfem Holz"]
  },
  verladehof: {
    id: "verladehof", ort: "station", name: "Verladehof",
    cost: 310, unlockAfterDeliveries: 36,
    beschreibung:
      "Aus der Station wird ein kleiner Hof mit zwei weiteren Plätzen.",
    bretter: 10,
    wirkung: ["Kistenplätze 4 → 6", "Ladung pro Fahrt 4 → 6"]
  },

  regalreihe: {
    id: "regalreihe", ort: "store", name: "Zweite Regalreihe",
    cost: 86, unlockAfterDeliveries: 7,
    beschreibung:
      "Der Vorratsstand bekommt eine zweite Reihe Bretter. Es passen mehr " +
      "Kisten hinein, bevor der Wagen nicht mehr abladen kann.",
    wirkung: ["Regalplätze 15 → 24"]
  },
  lagerschuppen: {
    id: "lagerschuppen", ort: "store", name: "Lagerschuppen",
    cost: 140, unlockAfterDeliveries: 16,
    beschreibung:
      "Hinter dem Stand entsteht ein gedeckter Schuppen für den Winter.",
    bretter: 4,
    wirkung: ["Regalplätze 24 → 36"]
  },
  grossbehaelter: {
    id: "grossbehaelter", ort: "store", name: "Tiefe Kisten",
    cost: 210, unlockAfterDeliveries: 28,
    beschreibung:
      "Die Werkstatt baut tiefere Kisten. Jede einzelne Kiste fasst mehr " +
      "Glühbeeren – das Regal fasst dadurch weit mehr, ohne größer zu werden.",
    wirkung: ["Glühbeeren pro Kiste 6 → 9"]
  },

  werkstatt: {
    id: "werkstatt", ort: "werkstatt", name: "Werkstatt bauen",
    cost: 80, unlockAfterDeliveries: 6,
    beschreibung:
      "Am Ende der Stichstrecke entsteht eine Werkbank unter offenem Dach. " +
      "Nussa das Eichhörnchen zieht ein, fällt Holz an den Nutzbäumen und " +
      "bringt Scheite zur Verladestation. Der Wurzelwagen fährt sie zur " +
      "Werkstatt, dort werden Bretter daraus.",
    wirkung: ["Nussa zieht ein", "Nutzbäume werden abgeerntet",
              "Der Wagen bekommt ein zweites Ziel", "Bretter als neuer Baustoff"]
  },
  saege: {
    id: "saege", ort: "werkstatt", name: "Zugsäge",
    cost: 150, unlockAfterDeliveries: 18,
    beschreibung:
      "Eine lange Säge über der Werkbank. Aus einem Scheit wird deutlich " +
      "schneller ein Brett – die Werkstatt hält mit mehr Nachschub Schritt.",
    wirkung: ["Brett in 6 s → 3,5 s", "Holzstapel 6 → 10 Scheite"]
  },

  zweiterwagen: {
    id: "zweiterwagen", ort: "station", name: "Zweiter Wurzelwagen",
    cost: 190, bretter: 8, unlockAfterDeliveries: 22,
    beschreibung:
      "Ein zweiter Wagen fährt auf derselben Strecke. Beide teilen sich das " +
      "Netz: Wer zuerst auf eine Kante fährt, belegt sie, der andere wartet " +
      "am Knoten. Beeren und Holz können damit gleichzeitig unterwegs sein.",
    wirkung: ["Zweiter Wagen auf der Strecke",
              "Beeren und Holz fahren nicht mehr abwechselnd",
              "Belegte Gleisabschnitte werden sichtbar"]
  },

  pfote2: {
    id: "pfote2", ort: "nest", name: "Fern zieht ein",
    cost: 64, unlockAfterDeliveries: 5,
    beschreibung:
      "Eine zweite Biberin klopft an. Sie erntet am selben Beet und trägt " +
      "zur selben Station – zu zweit ist die Station doppelt so schnell voll.",
    wirkung: ["Zweites Tier auf dem Weg"]
  },
  pfote3: {
    id: "pfote3", ort: "nest", name: "Moos zieht ein",
    cost: 130, unlockAfterDeliveries: 13,
    beschreibung:
      "Ein dritter Biber. Achte darauf, ob das Beet noch nachkommt.",
    wirkung: ["Drittes Tier auf dem Weg"]
  },
  pfote4: {
    id: "pfote4", ort: "nest", name: "Kiesel zieht ein",
    cost: 265, unlockAfterDeliveries: 32,
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
