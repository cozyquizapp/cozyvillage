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

/**
 * Die Leinwand. 1600 × 900 seit dem zweiten Waldrahmen.
 *
 * Die Pixel bleiben gleich groß – eine Figur ist weiterhin 64 px. Nachgemessen
 * hat sich damit nur die Bühne vergrößert: Die freie Lichtung ist von 80 987
 * auf 922 597 Pixel gewachsen (35,2 % → 64,1 % der Bildfläche, Faktor 11,4).
 * Eine Figur belegt jetzt 0,44 % der Lichtung statt 5,06 % – genug Raum für
 * einen Sortierring, mehrere Bauplätze und Luft dazwischen.
 */
export const VIEW = { width: 1600, height: 900 };

/**
 * Die Lichtung, am gelieferten Rahmen ausgemessen: offen von y = 110 bis
 * y = 800, an der breitesten Stelle 1435 px bei y = 356.
 */
export const GLADE = {
  cx: 800, top: 110, bottom: 800, corner: 150, halfWidth: 720
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
  beet:      { x: 300,  y: 258, label: "Glühbeerenbeet" },
  station:   { x: 470,  y: 428, label: "Verladestation" },
  werkstatt: { x: 800,  y: 232, label: "Holz- und Wurzelwerkstatt" },
  store:     { x: 1140, y: 428, label: "Vorratsstand" },
  kueche:    { x: 800,  y: 700, label: "Küche" },
  nest:      { x: 800,  y: 470, label: "Cozywolfs Nest" },
  pond:      { x: 250,  y: 528, label: "Wasserbecken", rx: 112, ry: 56 }
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
  { x: 236, y: 672 },
  { x: 340, y: 706 },
  { x: 446, y: 668 }
];

/** Der Weg des Eichhörnchens: von den Nutzbäumen zur Verladestation. */
export const HOLZWEG = {
  from: { x: 340, y: 648 }, to: { x: 408, y: 452 }
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
  // Das Wegende liegt links vor der Station, nicht darauf.
  from: { x: 316, y: 316 }, to: { x: 400, y: 424 }
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
].map(([dx, dy]) => ({ dx: dx * K * 2.1, dy: dy * K * 2.1 }));

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
/** Nur noch für die Tiefensortierung des Wagens gebraucht. */
export const RAIL_ALT = {
  // Die Strecke liegt zwischen den Gebäuden und dem Dorfplatz: unter der
  // Station und dem Vorratsstand, aber sechzehn Pixel über Cozywolfs Nest.
  // Vorher lief sie mitten durch den Platz – das Herz des Dorfes lag auf
  // dem Gleis. `home` liegt rechts neben der Station statt darunter, wo
  // der wartende Wagen hinter dem Gebäude verschwand.
  y: 470
};
export const RAIL = RAIL_ALT;

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
  /*
   * Der Sortierring.
   *
   * Acht Knoten bilden einen geschlossenen Ring um Cozywolfs Dorfplatz; von
   * drei Seiten führen kurze Stichstrecken zu den Gebäuden. Damit gibt es
   * erstmals **zwei Wege** zu jedem Ziel – der Wagen wählt den kürzeren, und
   * bei belegtem Abschnitt kann der zweite Wagen außen herum.
   *
   * Aus derselben Beschreibung entstehen später die acht Speichen zu den
   * Bezirken: mehr Knoten, mehr Kanten, kein anderer Code.
   */
  knoten: [
    { id: "ring-nw", x: 620,  y: 330, art: "durch" },
    { id: "ring-n",  x: 800,  y: 330, art: "durch" },
    { id: "ring-no", x: 980,  y: 330, art: "durch" },
    { id: "ring-o",  x: 980,  y: 470, art: "durch" },
    { id: "ring-so", x: 980,  y: 610, art: "durch" },
    { id: "ring-s",  x: 800,  y: 610, art: "durch" },
    { id: "ring-sw", x: 620,  y: 610, art: "durch" },
    { id: "ring-w",  x: 620,  y: 470, art: "durch" },

    { id: "station",   x: 470,  y: 470, art: "halt" },
    { id: "werkstatt", x: 800,  y: 268, art: "halt" },
    { id: "lager",     x: 1140, y: 470, art: "halt" },
    { id: "kueche",    x: 800,  y: 738, art: "halt" },
    { id: "quelle",    x: 1180, y: 700, art: "halt" }
  ],
  kanten: [
    ["ring-nw", "ring-n"], ["ring-n", "ring-no"],
    ["ring-no", "ring-o"], ["ring-o", "ring-so"],
    ["ring-so", "ring-s"], ["ring-s", "ring-sw"],
    ["ring-sw", "ring-w"], ["ring-w", "ring-nw"],
    ["ring-w", "station"], ["ring-n", "werkstatt"], ["ring-o", "lager"],
    ["ring-s", "kueche"], ["ring-so", "quelle"]
  ]
};
/** Die Bäume auf der Lichtungskante werden aus dieser Vorschrift gesetzt. */
export const TREE_RING = { stepY: 10 * K, stepX: 15 * K, margin: 5 * K };

/** Kleine Streuobjekte, damit der Boden nicht überall gleich aussieht. */
/**
 * Die Unterkünfte.
 *
 * Ohne sie war Fellgrund eine Fabrik: Tiere, die zwischen Beet und Station
 * pendeln und nirgendwo hingehören. Jede Art bekommt ihr eigenes Zuhause an
 * dem Ort, der zu ihr passt – der Biberbau steht im Wasser, Nussas Kobel bei
 * den Nutzbäumen, die Eulenstange als leerer Platz für später.
 *
 * Alle drei wachsen in drei Stufen mit dem, was in Fellgrund passiert, und
 * jede Stufe gibt es unbewohnt und bewohnt.
 */
export const UNTERKUENFTE = {
  bau:         { x: 230, y: 520, label: "Biberbau" },
  kobel:       { x: 390, y: 770, label: "Nussas Kobel" },
  eulenstange: { x: 1300, y: 560, label: "Eulenstange" }
};

/**
 * Dorfkram.
 *
 * Kleinigkeiten, die niemand baut und niemand zählt: eine Wäscheleine, eine
 * Bank, ein Brunnen. Sie machen aus einer Anlage einen Ort, an dem jemand
 * wohnt. Jedes Stück liegt bei etwas, das es erklärt.
 */
export const DORFKRAM = [
  // Am Biberbau: Wäsche und ein Fass am Ufer
  { bild: "waescheleine", x: 318, y: 600 },
  { bild: "fass",         x: 196, y: 596 },
  // Verladestation: der Arbeitshof
  { bild: "schubkarre",   x: 548, y: 512 },
  { bild: "wegweiser",    x: 596, y: 546 },
  // Dorfplatz: Brunnen, Bank, Feuerstelle
  { bild: "brunnen",      x: 700, y: 556 },
  { bild: "bank",         x: 902, y: 548 },
  { bild: "feuerstelle",  x: 690, y: 662 },
  { bild: "blumenkasten", x: 880, y: 596 },
  // Küche
  { bild: "blumenkasten", x: 886, y: 716 },
  { bild: "fass",         x: 738, y: 736 },
  // Werkstatt
  { bild: "fass",         x: 872, y: 250 },
  { bild: "bank",         x: 726, y: 258 },
  // Vorratsstand und Eulenstange im Osten
  { bild: "fass",         x: 1206, y: 470 },
  { bild: "bank",         x: 1246, y: 596 },
  { bild: "wegweiser",    x: 1348, y: 638 }
];

export const PROPS = [
  { kind: "rock",  x: 560,  y: 210 }, { kind: "shrub", x: 1010, y: 200 },
  { kind: "rock",  x: 1290, y: 300 }, { kind: "shrub", x: 190,  y: 340 },
  { kind: "rock",  x: 1400, y: 520 }, { kind: "shrub", x: 1330, y: 640 },
  { kind: "rock",  x: 540,  y: 700 }, { kind: "shrub", x: 640,  y: 760 },
  { kind: "shrub", x: 960,  y: 770 }, { kind: "rock",  x: 150,  y: 620 },
  { kind: "shrub", x: 1180, y: 210 }, { kind: "rock",  x: 700,  y: 180 }
];

/**
 * Freie Flächen zeigen Potential, aber keine sterilen Platzhalter.
 *
 * Beide lagen vorher halb unter etwas anderem: die Küche hinter dem
 * Vorratsstand, die Werkstatt in der unteren Waldkante. Jetzt liegen sie
 * frei auf offenem Rasen.
 */
export const FUTURE_PARCELS = [
  { x: 1180, y: 700, rx: 46, ry: 23, label: "Kristallquelle" }
];

/** Wirtschaft. Ein Ausbau verändert immer Bild, Rhythmus und Leistung zugleich. */
export const RULES = {
  berriesPerCrate: 6,
  harvestSeconds: 1.0,
  dropSeconds: 0.5,
  /*
   * Tempi für die große Lichtung.
   *
   * Sie waren für 640 × 360 gewählt. Auf 1600 × 900 sind alle Wege rund
   * zweieinhalbmal so lang – mit den alten Werten dauerte eine Runde über den
   * Sortierring fünfunddreißig Sekunden, und die Lichtung wirkte eingeschlafen.
   */
  walkSpeed: 26 * K * 2.2,
  cartSpeed: 34 * K * 2.4,
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

  /** Scheite, die im Holzstapel der Werkstatt warten können. */
  holzstapel: 6,

  /* Küche */
  /** Glühbeeren, die im Vorratskorb der Küche warten können. */
  kuechenkorb: 24,
  /** Glühbeeren für ein Glas Marmelade. */
  beerenProGlas: 8,
  /** Sekunden für ein Glas. */
  glasSekunden: 9
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
    bretter: 10, marmelade: 6,
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

  kueche: {
    id: "kueche", ort: "kueche", name: "Küche bauen",
    cost: 160, bretter: 6, unlockAfterDeliveries: 20,
    beschreibung:
      "Am südlichen Halt entsteht eine Küche. Der Wurzelwagen holt Glühbeeren " +
      "aus dem Vorratsstand und bringt sie hierher; daraus wird Marmelade. " +
      "Erst damit lassen sich weitere Tiere versorgen – wer einzieht, will " +
      "auch satt werden.",
    wirkung: ["Dritter Halt am Ring wird bedient",
              "Der Wagen holt Beeren aus dem Lager statt nur hinzubringen",
              "Marmelade als dritter Baustoff"]
  },
  grosserkessel: {
    id: "grosserkessel", ort: "kueche", name: "Großer Kessel",
    cost: 240, bretter: 10, unlockAfterDeliveries: 30,
    beschreibung:
      "Ein zweiter, größerer Kessel über dem Feuer. Die Küche kocht schneller " +
      "und hält mehr Beeren vorrätig.",
    wirkung: ["Glas in 9 s → 5 s", "Vorratskorb 24 → 40 Glühbeeren"]
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
    marmelade: 8,
    wirkung: ["Viertes Tier auf dem Weg"]
  }
};

/** Alle Ausbauten eines Ortes, in der Reihenfolge des Baums. */
export function ausbautenFuer(ort) {
  return Object.values(UPGRADES).filter((u) => u.ort === ort);
}

export const SAVE_KEY = "fellgrund.spielstand.v1";
