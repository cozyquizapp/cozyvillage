/**
 * Die Lichtung – Fellgrunds einzige Bühne.
 *
 * Hier läuft die erste vollständige Produktionskette:
 * Glühbeerenbeet → Tiere sammeln → Verladestation → Wurzelwagen →
 * Vorratsstand → Glühbeerenbestand.
 *
 * Zwei Regeln bestimmen alles Weitere:
 *
 *   1. Der Bestand steigt erst bei der tatsächlichen Ankunft des Wagens.
 *   2. Jede Stufe der Kette kann klemmen, und jeder Stau ist am Bild
 *      zu erkennen, bevor eine Zeile Text ihn benennt.
 *
 * Die drei Engstellen: das Beet ist abgeerntet, die Verladestation ist voll,
 * das Regal ist voll. Sie treten in dieser Reihenfolge auf, je mehr Tiere
 * einziehen – und genau daraus entsteht die Aufgabe für die spielende Person.
 */

import Phaser from "phaser";
import {
  VIEW, GLADE, gladeHalf, PLACES, PATH, RAIL, PROPS, FUTURE_PARCELS,
  TREE_RING, RULES, UPGRADES, BEET_PLAETZE, ARBEITER, REGAL, ausbautenFuer, K
} from "../game/config.js";
import {
  state, bus, melde, speichern, istFreigeschaltet,
  kistenPlaetze, wagenKapazitaet, beerenProKiste, regalPlaetze, lagerKapazitaet,
  beetBuesche, reifeSekunden, arbeiterZahl, wagenTempo
} from "../game/state.js";

export default class GladeScene extends Phaser.Scene {
  constructor() {
    super("Glade");
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);
    this.baueWald();
    this.baueParzellen();
    this.baueTeich();
    this.baueStreuobjekte();
    this.baueBeet();
    this.baueStation();
    this.baueVorratsstand();
    this.baueNest();
    this.baueWagen();
    this.baueArbeiter();
    this.baueLaterne();
    this.baueStauzeichen();

    this.funken = this.add.particles(0, 0, "spark", {
      lifespan: 620, speed: { min: 18, max: 48 }, gravityY: 40,
      scale: { start: 1, end: 0 }, quantity: 0, emitting: false,
      tint: [0xfff6d0, 0xffd05c]
    }).setDepth(900);

    this.wagen = { phase: "wartet", timer: 0, blockiert: false };

    bus.on("ausbau", this.beiAusbau, this);
    this.events.once("shutdown", () => bus.off("ausbau", this.beiAusbau, this));

    // Ein geladener Spielstand muss die Welt sofort im richtigen Zustand zeigen
    if (state.ausbauten.wagenlager) this.station.setTexture("station-2");
    if (state.ausbauten.bewaesserung) this.zeigeRinne();
    if ((state.ausbauten.regalreihe || state.ausbauten.lagerschuppen)
        && this.textures.exists("store-2")) {
      this.stand.setTexture("store-2");
    }
    this.aktualisiereStation();
    this.aktualisiereRegal();

    this.time.addEvent({
      delay: RULES.autosaveSeconds * 1000, loop: true, callback: speichern
    });
  }

  /* ----------------------------------------------------------- *
   * Aufbau
   * ----------------------------------------------------------- */

  tiefeSetzen(obj, y) {
    obj.setDepth(10 + y);   // Figuren werden nach Fußpunkt sortiert
    return obj;
  }

  /**
   * Der Waldrahmen liegt in zwei Ebenen: hinten hinter allem, vorn über den
   * Figuren – nur so kann ein Tier hinter einem Baum verschwinden.
   * Ohne Lieferung fällt der prozedurale Baumkranz ein.
   */
  baueWald() {
    if (this.textures.exists("wald-hinten")) {
      this.add.image(0, 0, "wald-hinten").setOrigin(0, 0).setDepth(2);
      this.add.image(0, 0, "wald-vorn").setOrigin(0, 0).setDepth(8000);
      return;
    }
    this.baueWaldkranz();
  }

  baueWaldkranz() {
    let v = 0;
    for (let y = GLADE.top + 4; y <= GLADE.bottom - 2; y += TREE_RING.stepY) {
      const hw = gladeHalf(y);
      if (hw <= 4) continue;
      const jitter = ((y * 37) % 7) - 3;
      for (const seite of [-1, 1]) {
        const x = GLADE.cx + seite * (hw + TREE_RING.margin) + jitter * seite;
        this.tiefeSetzen(this.add.image(x, y, `tree-${v++ % 3}-d`).setOrigin(0.5, 1), y);
      }
    }
    for (let x = 14 * K; x <= VIEW.width - 14 * K; x += TREE_RING.stepX) {
      const y = GLADE.top + 2 * K + ((x * 13) % (4 * K));
      this.tiefeSetzen(this.add.image(x, y, `tree-${v++ % 3}-d`).setOrigin(0.5, 1), y);
      const yb = GLADE.bottom + 3 * K;
      this.tiefeSetzen(this.add.image(x + 6 * K, yb, "shrub-d").setOrigin(0.5, 1), yb);
    }
  }

  baueParzellen() {
    for (const p of FUTURE_PARCELS) {
      const bild = this.add.image(p.x, p.y, "parcel").setOrigin(0.5, 0.6).setDepth(5);
      bild.setInteractive({ useHandCursor: true });
      bild.on("pointerup", () => bus.emit("oeffne", {
        titel: p.label,
        zeilen: ["Diese Fläche ist vorbereitet, aber noch nicht bebaut.",
                 "Sie wird frei, sobald die erste Kette zuverlässig läuft."],
        gesperrt: true
      }));
    }
  }

  /**
   * Der Teich.
   *
   * Der gelieferte 9er-Ufersatz kann nur rechteckige Becken erzeugen – seine
   * Uferkante ist nur zwei Pixel breit. Bis ein organischer Satz vorliegt,
   * werden die animierten Wasserkacheln durch eine elliptische Maske
   * beschnitten und bekommen einen eigenen Uferring. Das Wasser bewegt sich
   * dabei wirklich, statt gemalt zu sein.
   */
  baueTeich() {
    const p = PLACES.pond;
    if (!this.textures.exists("wasser-0")) return;
    const rx = p.rx, ry = p.ry;

    // Ufer: überlappend gestempelte Flecken, kein Kachelsatz. Ein 9er-Satz
    // könnte nur ein Rechteck umranden – Flecken folgen jeder Form.
    if (this.textures.exists("ufer-rund-0")) {
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        const lang = i % 3 === 0;
        const key = lang
          ? `ufer-lang-${i % 3}`
          : `ufer-rund-${i % 4}`;
        this.add.image(
          p.x + Math.cos(a) * (rx - 4), p.y + Math.sin(a) * (ry - 3), key
        ).setDepth(2.6).setScale(0.9 + ((i * 7) % 3) * 0.08);
      }
    } else {
      const ufer = this.add.graphics().setDepth(2.6);
      ufer.fillStyle(0x2c4a34, 1).fillEllipse(p.x, p.y, rx * 2 + 10, ry * 2 + 8);
      ufer.fillStyle(0x4a3b26, 1).fillEllipse(p.x, p.y, rx * 2 + 4, ry * 2 + 3);
    }

    const wasser = this.add.container(0, 0).setDepth(2.8);
    const kachel = 32;
    this.wasserKacheln = [];
    for (let y = p.y - ry - kachel; y < p.y + ry + kachel; y += kachel) {
      for (let x = p.x - rx - kachel; x < p.x + rx + kachel; x += kachel) {
        const k = this.add.image(x, y, "wasser-0").setOrigin(0, 0);
        wasser.add(k);
        this.wasserKacheln.push(k);
      }
    }
    const form = this.make.graphics({ x: 0, y: 0, add: false });
    form.fillStyle(0xffffff).fillEllipse(p.x, p.y, rx * 2, ry * 2);
    wasser.setMask(form.createGeometryMask());

    this.time.addEvent({
      delay: 280, loop: true,
      callback: () => {
        const f = Math.floor(this.time.now / 280) % 4;
        for (const k of this.wasserKacheln) k.setTexture(`wasser-${f}`);
      }
    });

    // Schilf und Seerosen liegen über dem Wasser, nicht darunter
    if (this.textures.exists("ufer-bewuchs-0")) {
      const bewuchs = [[-44, -18], [32, -22], [-24, 22], [46, 10], [4, 25]];
      bewuchs.forEach(([dx, dy], i) => {
        this.add.image(p.x + dx, p.y + dy, `ufer-bewuchs-${i}`)
          .setOrigin(0.5, 0.8).setDepth(3.1);
      });
    }

    // Glanzlichter auf der Oberfläche
    for (let i = 0; i < 3; i++) {
      const glanz = this.add.rectangle(
        p.x - 30 + i * 26, p.y - 12 + i * 9, 10, 2, 0x93cfe0, 0.7
      ).setDepth(2.9);
      this.tweens.add({
        targets: glanz, x: glanz.x + 12, alpha: 0.25,
        duration: 1800 + i * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
      });
    }

    const flaeche = this.add.rectangle(p.x, p.y, rx * 2, ry * 2, 0x000000, 0)
      .setDepth(3).setInteractive({ useHandCursor: true });
    flaeche.on("pointerup", () => bus.emit("oeffne", {
      titel: PLACES.pond.label,
      zeilen: [
        "Ein stilles Becken am Rand der Lichtung.",
        state.ausbauten.bewaesserung
          ? "Eine Rinne führt von hier zum Glühbeerenbeet."
          : "Von hier ließe sich eine Rinne zum Beet legen.",
        "Ein Axolotl wird hier einziehen, sobald Fellgrund größer ist."
      ],
      gesperrt: true
    }));
  }

  baueStreuobjekte() {
    for (const p of PROPS) {
      const key = p.kind === "rock" ? "rock" : "shrub";
      this.tiefeSetzen(this.add.image(p.x, p.y, key).setOrigin(0.5, 1), p.y);
    }
  }

  /**
   * Das Beet.
   *
   * Jeder Busch ist ein eigener Vorrat mit eigener Reifezeit. Ein reifer
   * Busch leuchtet und wippt leicht, ein abgeernteter steht matt da. Ist das
   * ganze Beet matt, sieht man den Engpass, bevor irgendein Text ihn nennt.
   */
  baueBeet() {
    const b = PLACES.beet;
    this.buesche = BEET_PLAETZE.map(({ dx, dy }, i) => {
      const x = b.x + dx, y = b.y + dy;
      const bild = this.add.image(x, y, "bush-2").setOrigin(0.5, 1);
      this.tiefeSetzen(bild, y);
      bild.setInteractive({ useHandCursor: true });
      bild.on("pointerup", () => this.oeffneBeet());
      return { bild, x, y, reife: 1, aktiv: false, belegt: null, index: i };
    });
    this.aktualisiereBeetplaetze();
  }

  /** Zeigt so viele Büsche, wie das Beet ausgebaut ist. */
  aktualisiereBeetplaetze() {
    const n = beetBuesche();
    this.buesche.forEach((bu, i) => {
      const aktiv = i < n;
      if (aktiv && !bu.aktiv) bu.reife = 1;
      bu.aktiv = aktiv;
      bu.bild.setVisible(aktiv);
      bu.bild.input && (bu.bild.input.enabled = aktiv);
    });
  }

  baueStation() {
    const s = PLACES.station;
    this.station = this.add.image(s.x, s.y, "station-1").setOrigin(0.5, 1);
    this.tiefeSetzen(this.station, s.y);
    this.station.setInteractive({ useHandCursor: true });
    this.station.on("pointerup", () => this.oeffneStation());
    this.stationKisten = [];
  }

  baueVorratsstand() {
    const s = PLACES.store;
    this.stand = this.add.image(s.x, s.y, "store").setOrigin(0.5, 1);
    this.tiefeSetzen(this.stand, s.y);
    this.stand.setInteractive({ useHandCursor: true });
    this.stand.on("pointerup", () => this.oeffneStand());
    this.regalKisten = [];
  }

  baueNest() {
    const n = PLACES.nest;
    this.tiefeSetzen(this.add.image(n.x, n.y, "nest").setOrigin(0.5, 1), n.y - 2 * K);
    this.wolf = this.add.image(n.x - 1 * K, n.y - 8 * K, "wolf-sleep").setOrigin(0.5, 1);
    this.tiefeSetzen(this.wolf, n.y - 1);
    this.tiefeSetzen(this.add.image(n.x, n.y, "nest-rim").setOrigin(0.5, 1), n.y);
    this.bluete = this.add.image(n.x + 20 * K, n.y - 6 * K, "blossom").setOrigin(0.5, 1);
    this.tiefeSetzen(this.bluete, n.y);
    this.bluete.setVisible(state.ausbauten.wagenlager);
    if (this.textures.exists("blossom-1")) {
      this.time.addEvent({
        delay: 260, loop: true,
        callback: () => this.bluete.setTexture(`blossom-${Math.floor(this.time.now / 260) % 4}`)
      });
    }

    this.wolf.setInteractive({ useHandCursor: true });
    this.wolf.on("pointerup", () => this.oeffneNest());

    // Atmen: entweder über gelieferte Bilder oder als leichte Bewegung
    if (this.textures.exists("wolf-sleep-1")) {
      this.time.addEvent({
        delay: 700, loop: true,
        callback: () => {
          const i = Math.floor(this.time.now / 700) % 4;
          this.wolf.setTexture(`wolf-sleep-${i}`);
        }
      });
    } else {
      this.tweens.add({
        targets: this.wolf, y: this.wolf.y - 1 * K, duration: 1400,
        yoyo: true, repeat: -1, ease: "Sine.easeInOut"
      });
    }
  }

  baueWagen() {
    this.wagenBild = this.add.image(RAIL.home, RAIL.y + 4 * K, "cart").setOrigin(0.5, 1);
    this.tiefeSetzen(this.wagenBild, RAIL.y + 4 * K);
    this.wagenKisten = [];
    this.wagenBild.setInteractive({ useHandCursor: true });
    this.wagenBild.on("pointerup", () => bus.emit("oeffne", {
      titel: "Wurzelwagen",
      zeilen: [
        `Ladung pro Fahrt: ${wagenKapazitaet()} Kisten`,
        "Er fährt ausschließlich auf der sichtbaren Schiene.",
        "Er fährt erst los, wenn die Verladestation voll ist.",
        state.ausbauten.schnellschiene ? "Die Schiene ist geölt – er läuft leicht." : ""
      ].filter(Boolean),
      gesperrt: true
    }));
  }

  /**
   * Die Tiere. Es ist bewusst eine Liste, keine feste Figur: Wer einzieht,
   * ergibt sich aus den gebauten Ausbauten. Jedes Tier hat eine eigene Spur
   * neben dem Weg, damit vier Biber nicht als ein Klumpen laufen.
   */
  baueArbeiter() {
    this.arbeiter = [];
    this.setzeArbeiterzahl();
  }

  setzeArbeiterzahl() {
    const soll = arbeiterZahl();
    while (this.arbeiter.length > soll) {
      const a = this.arbeiter.pop();
      if (a.busch != null) this.buesche[a.busch].belegt = null;
      a.bild.destroy();
      a.kiste.destroy();
    }
    while (this.arbeiter.length < soll) {
      const i = this.arbeiter.length;
      const def = ARBEITER[i];
      const bild = this.add.image(PATH.to.x, PATH.to.y, "beaver-0").setOrigin(0.5, 1);
      this.tiefeSetzen(bild, PATH.to.y);
      const kiste = this.add.image(0, 0, "crate").setOrigin(0.5, 1).setVisible(false);
      this.arbeiter.push({
        id: def.id, name: def.name, bild, kiste,
        // Versetzter Start, damit die Tiere nicht im Gleichschritt laufen
        fortschritt: Math.min(1, 1 - i * 0.22),
        nah: 0, phase: "hin", timer: 0, traegt: false, busch: null
      });
    }
    // Spuren neu verteilen, damit die Gruppe mittig um den Weg bleibt
    this.arbeiter.forEach((a, i) => {
      a.spur = (i - (this.arbeiter.length - 1) / 2) * 7 * K;
    });
  }

  baueLaterne() {
    const x = PLACES.station.x - 30 * K, y = PLACES.station.y - 4 * K;
    const laterne = this.tiefeSetzen(this.add.image(x, y, "lamp").setOrigin(0.5, 1), y);
    if (this.textures.exists("lamp-1")) {
      const stufen = [0, 1, 2, 1];
      this.time.addEvent({
        delay: 220, loop: true,
        callback: () => laterne.setTexture(`lamp-${stufen[Math.floor(this.time.now / 220) % 4]}`)
      });
    }
    // Additiv gemischt, sonst liegt eine flache graue Scheibe auf der Wiese
    const schein = this.add.ellipse(x, y - 1 * K, 40 * K, 20 * K, 0xffb85c, 0.10)
      .setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: schein, alpha: 0.16, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
    const standSchein = this.add.ellipse(
      PLACES.store.x, PLACES.store.y - 2 * K, 58 * K, 24 * K, 0xffb85c, 0.09
    ).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: standSchein, alpha: 0.14, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
  }

  /**
   * Ein Wartezeichen über der Stelle, die klemmt. Keine Zahl, kein rotes
   * Dreieck – eine Sprechblase, die sagt: hier fehlt gerade etwas.
   */
  baueStauzeichen() {
    const orte = {
      beet: { x: PLACES.beet.x, y: PLACES.beet.y - 26 * K },
      station: { x: PLACES.station.x, y: PLACES.station.y - 46 * K },
      lager: { x: PLACES.store.x, y: PLACES.store.y - 52 * K }
    };
    this.stauZeichen = {};
    for (const [id, p] of Object.entries(orte)) {
      const z = this.add.image(p.x, p.y, "stau").setOrigin(0.5, 1)
        .setDepth(8500).setVisible(false);
      z.grundY = p.y;
      this.stauZeichen[id] = z;
    }
  }

  /** Die Rinne vom Wasserbecken zum Beet – der sichtbare Teil der Bewässerung. */
  zeigeRinne() {
    if (this.rinne) return;
    const p = PLACES.pond, b = PLACES.beet;
    const g = this.add.graphics().setDepth(6);
    g.lineStyle(4 * K, 0x6b4f33, 1).lineBetween(p.x + 24 * K, p.y - 14 * K, b.x - 14 * K, b.y + 6 * K);
    g.lineStyle(2 * K, 0x8a6942, 1).lineBetween(p.x + 24 * K, p.y - 15 * K, b.x - 14 * K, b.y + 5 * K);
    g.lineStyle(1 * K, 0x4e93a8, 0.8).lineBetween(p.x + 24 * K, p.y - 15 * K, b.x - 14 * K, b.y + 5 * K);
    this.rinne = g;
  }

  /* ----------------------------------------------------------- *
   * Sichtbare Güter
   * ----------------------------------------------------------- */

  aktualisiereStation() {
    const plaetze = kistenPlaetze();
    const s = PLACES.station;
    const breite = plaetze * 22;
    const links = s.x - breite / 2 + 11;
    while (this.stationKisten.length > state.kisten) this.stationKisten.pop().destroy();
    while (this.stationKisten.length < state.kisten) {
      const i = this.stationKisten.length;
      const kiste = this.add.image(links + i * 22, s.y - 34, "crate").setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, s.y + 1);
      this.stationKisten.push(kiste);
      // Die Kiste landet mit einem kurzen Stauchen, statt zu erscheinen.
      kiste.setScale(1.5, 0.5);
      this.tweens.add({ targets: kiste, scaleX: 1, scaleY: 1, duration: 220, ease: "Back.easeOut" });
    }
    // Nach einem Ausbau stehen die alten Kisten falsch
    this.stationKisten.forEach((k, i) => { k.x = links + i * 22; });
  }

  /**
   * Das Regal ist der Bestand. Es zeigt genau so viele Kisten, wie wirklich
   * gelagert sind, und ist voll, wenn der Vorrat voll ist – deshalb steht
   * nirgends eine Zahl, die man sonst glauben müsste.
   */
  /** Der Platz einer Kiste: erst die Bretter, dann der Haufen daneben. */
  regalPlatz(i) {
    const s = PLACES.store;
    const bretter = REGAL.reihen.length * REGAL.spalten.length;
    if (i < bretter) {
      const reihe = Math.floor(i / REGAL.spalten.length);
      const spalte = i % REGAL.spalten.length;
      return {
        x: s.x + REGAL.spalten[spalte],
        y: s.y + REGAL.reihen[reihe],
        tiefe: s.y + 1 + (REGAL.reihen.length - reihe)
      };
    }
    const h = REGAL.haufen, j = i - bretter;
    return {
      x: s.x + h.x + (j % h.proReihe) * h.dx,
      y: s.y + h.y - Math.floor(j / h.proReihe) * h.dy,
      tiefe: s.y + 2
    };
  }

  aktualisiereRegal() {
    const anzahl = Math.min(regalPlaetze(), Math.floor(state.beeren / beerenProKiste()));
    while (this.regalKisten.length > anzahl) this.regalKisten.pop().destroy();
    while (this.regalKisten.length < anzahl) {
      const i = this.regalKisten.length;
      const p = this.regalPlatz(i);
      const kiste = this.add.image(p.x, p.y, "crate").setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, p.tiefe);
      this.regalKisten.push(kiste);
      kiste.y -= 8 * K;
      kiste.setAlpha(0);
      this.tweens.add({ targets: kiste, y: p.y, alpha: 1, duration: 260, ease: "Back.easeOut" });
    }
  }

  aktualisiereWagen() {
    while (this.wagenKisten.length) this.wagenKisten.pop().destroy();
    for (let i = 0; i < state.wagenLadung; i++) {
      const kiste = this.add.image(0, 0, "crate").setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, RAIL.y + 5);
      this.wagenKisten.push(kiste);
    }
    this.setzeWagenKisten();
  }

  setzeWagenKisten() {
    const x = this.wagenBild.x;
    this.wagenKisten.forEach((k, i) => {
      k.x = x - 14 + (i % 3) * 14;
      k.y = RAIL.y - 14 - Math.floor(i / 3) * 16;
    });
  }

  /* ----------------------------------------------------------- *
   * Panels
   * ----------------------------------------------------------- */

  /** Baut die Ausbauliste eines Ortes für das Panel. */
  ausbauListe(ort) {
    return ausbautenFuer(ort)
      .filter((u) => !state.ausbauten[u.id])
      .map((u) => ({
        id: u.id, name: u.name, kosten: u.cost,
        beschreibung: u.beschreibung, wirkung: u.wirkung,
        freigeschaltet: istFreigeschaltet(u.id),
        hinweis: istFreigeschaltet(u.id)
          ? null
          : `Wird sichtbar nach ${u.unlockAfterDeliveries} Lieferungen.`
      }))
      // Gesperrte Ausbauten zeigen wir nur den nächsten, sonst wird es eine Liste
      .filter((u, i, alle) => u.freigeschaltet || i === alle.findIndex((x) => !x.freigeschaltet));
  }

  gebauteZeile(ort) {
    const fertig = ausbautenFuer(ort).filter((u) => state.ausbauten[u.id]);
    return fertig.length ? `Gebaut: ${fertig.map((u) => u.name).join(", ")}` : "";
  }

  oeffneBeet() {
    const reif = this.buesche.filter((b) => b.aktiv && b.reife >= 1).length;
    bus.emit("oeffne", {
      titel: PLACES.beet.label,
      zeilen: [
        `Büsche im Beet: ${beetBuesche()}, davon reif: ${reif}`,
        `Ein abgeernteter Busch braucht ${reifeSekunden()} Sekunden.`,
        `Eine volle Kiste enthält ${beerenProKiste()} Glühbeeren.`,
        state.stau.beet ? "Das Beet ist abgeerntet – die Tiere warten." : "",
        this.gebauteZeile("beet")
      ].filter(Boolean),
      ausbauten: this.ausbauListe("beet")
    });
  }

  oeffneStation() {
    bus.emit("oeffne", {
      titel: PLACES.station.label,
      zeilen: [
        `Kistenplätze: ${state.kisten} von ${kistenPlaetze()} belegt`,
        `Abgeschlossene Lieferungen: ${state.lieferungen}`,
        state.stau.station ? "Die Station ist voll – ein Tier wartet mit seiner Kiste." : "",
        this.gebauteZeile("station")
      ].filter(Boolean),
      ausbauten: this.ausbauListe("station")
    });
  }

  oeffneStand() {
    bus.emit("oeffne", {
      titel: PLACES.store.label,
      zeilen: [
        `Im Regal: ${this.regalKisten.length} von ${regalPlaetze()} Kisten`,
        `Glühbeeren: ${state.beeren} von ${lagerKapazitaet()}`,
        state.stau.lager
          ? "Das Regal ist voll – der Wagen kann nicht abladen. Etwas ausgeben schafft Platz."
          : "Der Bestand steigt erst, wenn der Wagen tatsächlich ankommt.",
        this.gebauteZeile("store")
      ].filter(Boolean),
      ausbauten: this.ausbauListe("store")
    });
  }

  oeffneNest() {
    const namen = this.arbeiter.map((a) => a.name).join(", ");
    bus.emit("oeffne", {
      titel: "Cozywolfs Nest",
      zeilen: [
        "Er schläft im Nest und ist das Herz von Fellgrund.",
        "Er wacht kurz auf, wenn eine Lieferung ankommt.",
        `Auf dem Weg arbeiten: ${namen}`,
        `Bisherige Lieferungen: ${state.lieferungen}`
      ],
      ausbauten: this.ausbauListe("nest")
    });
  }

  /* ----------------------------------------------------------- *
   * Wirkung der Ausbauten – jede ist sofort im Bild zu sehen
   * ----------------------------------------------------------- */

  beiAusbau(id) {
    const up = UPGRADES[id];
    if (!up) return;
    const ortPunkt = {
      beet: PLACES.beet, station: PLACES.station,
      store: PLACES.store, nest: PLACES.nest
    }[up.ort] || PLACES.station;

    switch (id) {
      case "wagenlager":
        this.station.setTexture("station-2");
        this.bluete.setVisible(true).setScale(0);
        this.tweens.add({ targets: this.bluete, scale: 1, duration: 420, ease: "Back.easeOut" });
        break;
      case "verladehof":
        this.station.setTexture("station-2");
        this.tweens.add({
          targets: this.station, scaleX: 1.12, scaleY: 1.12,
          duration: 260, yoyo: true, ease: "Sine.easeOut"
        });
        break;
      case "beetzwei":
      case "beetdrei":
        this.aktualisiereBeetplaetze();
        this.buesche.filter((b) => b.aktiv).forEach((b, i) => {
          b.bild.setScale(0.4);
          this.tweens.add({ targets: b.bild, scale: 1, duration: 320, delay: i * 40, ease: "Back.easeOut" });
        });
        break;
      case "bewaesserung":
        this.zeigeRinne();
        break;
      case "regalreihe":
      case "lagerschuppen":
        if (this.textures.exists("store-2")) this.stand.setTexture("store-2");
        this.tweens.add({
          targets: this.stand, scaleX: 1.08, scaleY: 1.08,
          duration: 260, yoyo: true, ease: "Sine.easeOut"
        });
        break;
      case "schnellschiene":
        this.blitzeSchiene();
        break;
      case "pfote2":
      case "pfote3":
      case "pfote4":
        this.setzeArbeiterzahl();
        this.funken.emitParticleAt(PATH.to.x, PATH.to.y - 10 * K, 14);
        break;
      default:
        break;
    }

    this.aktualisiereStation();
    this.aktualisiereRegal();
    this.funken.emitParticleAt(ortPunkt.x, ortPunkt.y - 24 * K, 16);
    this.cameras.main.flash(180, 255, 226, 160, false);
    melde(up.ort === "nest" ? up.name : `${up.name} steht`);
  }

  /** Ein kurzer Lichtstrich über die frisch geölte Schiene. */
  blitzeSchiene() {
    const strich = this.add.rectangle(RAIL.from, RAIL.y + 2 * K, 8 * K, 2 * K, 0xfff2c0, 0.9)
      .setOrigin(0, 0.5).setDepth(7000).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: strich, x: RAIL.to, alpha: 0, duration: 520,
      ease: "Sine.easeIn", onComplete: () => strich.destroy()
    });
  }

  /* ----------------------------------------------------------- *
   * Der Kreislauf
   * ----------------------------------------------------------- */

  update(zeit, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    state.stau.beet = false;
    state.stau.station = false;
    this.reifeBeet(dt);
    for (const a of this.arbeiter) this.laufeArbeiter(a, dt);
    this.fahreWagen(dt);
    // Der Wagen merkt sich seine Blockade über mehrere Bilder hinweg, sonst
    // würde das Wartezeichen im Takt des Nachfassens flackern.
    state.stau.lager = this.wagen.blockiert && this.wagen.phase === "abladen";
    this.zeigeStau();
    this.aktualisiereMeldung();
  }

  /** Jeder Busch wächst für sich nach. */
  reifeBeet(dt) {
    const sek = reifeSekunden();
    for (const b of this.buesche) {
      if (!b.aktiv) continue;
      if (b.reife < 1) {
        b.reife = Math.min(1, b.reife + dt / sek);
      }
      const stufe = b.reife >= 1 ? 2 : b.reife >= 0.45 ? 1 : 0;
      const key = `bush-${stufe}`;
      if (b.bild.texture.key !== key) b.bild.setTexture(key);
      if (b.reife >= 1) {
        b.bild.clearTint();
        // Reife Büsche atmen leicht – das Beet lebt, wenn es voll ist
        b.bild.y = b.y + Math.sin(this.time.now / 620 + b.index) * 0.8 * K;
      } else {
        b.bild.setTint(0x93a58d);
        b.bild.y = b.y;
      }
    }
  }

  /** Sucht dem Tier den nächsten reifen, noch nicht belegten Busch. */
  suchebusch(a) {
    let best = null, bestD = Infinity;
    for (const b of this.buesche) {
      if (!b.aktiv || b.reife < 1 || b.belegt) continue;
      const d = Phaser.Math.Distance.Between(PATH.from.x, PATH.from.y, b.x, b.y);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (!best) return false;
    best.belegt = a.id;
    a.busch = best.index;
    return true;
  }

  laufeArbeiter(a, dt) {
    const strecke = Phaser.Math.Distance.Between(PATH.from.x, PATH.from.y, PATH.to.x, PATH.to.y);
    const tempo = (RULES.walkSpeed / strecke) * dt;
    const busch = a.busch != null ? this.buesche[a.busch] : null;
    const nahStrecke = busch
      ? Math.max(1, Phaser.Math.Distance.Between(PATH.from.x, PATH.from.y, busch.x, busch.y))
      : 1;
    const nahTempo = (RULES.walkSpeed / nahStrecke) * dt;

    if (a.phase === "hin") {
      a.fortschritt = Math.max(0, a.fortschritt - tempo);
      if (a.fortschritt === 0) a.phase = "sucht";
    } else if (a.phase === "sucht") {
      // Steht am Beetrand und wartet, bis irgendwo wieder etwas leuchtet
      if (this.suchebusch(a)) { a.phase = "annaehern"; a.nah = 0; }
      else state.stau.beet = true;
    } else if (a.phase === "annaehern") {
      a.nah = Math.min(1, a.nah + nahTempo);
      if (a.nah === 1) { a.phase = "ernten"; a.timer = RULES.harvestSeconds; }
    } else if (a.phase === "ernten") {
      a.timer -= dt;
      if (a.timer <= 0) {
        if (busch) { busch.reife = 0; busch.belegt = null; }
        a.busch = null;
        a.traegt = true;
        a.phase = "entfernen";
      }
    } else if (a.phase === "entfernen") {
      // Der Rückweg vom Busch zum Weg – ohne Busch bleibt die Strecke gemerkt
      a.nah = Math.max(0, a.nah - (RULES.walkSpeed / Math.max(1, a.letzteNah || 1)) * dt);
      if (a.nah === 0) a.phase = "zurueck";
    } else if (a.phase === "zurueck") {
      a.fortschritt = Math.min(1, a.fortschritt + tempo);
      if (a.fortschritt === 1) { a.phase = "abgeben"; a.timer = RULES.dropSeconds; }
    } else if (a.phase === "abgeben") {
      a.timer -= dt;
      if (a.timer <= 0) {
        if (state.kisten < kistenPlaetze()) {
          state.kisten++;
          a.traegt = false;
          a.phase = "hin";
          this.aktualisiereStation();
          this.funken.emitParticleAt(PLACES.station.x, PLACES.station.y - 12 * K, 4);
          bus.emit("aendert");
        } else {
          state.stau.station = true;
          a.timer = 0.3;
        }
      }
    }

    if (busch) a.letzteNah = nahStrecke;

    // Position: erst entlang des Wegs, dann seitlich zum Busch
    const wx = PATH.from.x + (PATH.to.x - PATH.from.x) * a.fortschritt;
    const wy = PATH.from.y + (PATH.to.y - PATH.from.y) * a.fortschritt;
    const zielX = busch ? busch.x : a.zielX || wx;
    const zielY = busch ? busch.y : a.zielY || wy;
    if (busch) { a.zielX = busch.x; a.zielY = busch.y; }
    let x = wx + (zielX - wx) * a.nah;
    let y = wy + (zielY - wy) * a.nah;
    // Die Spur verliert sich, sobald das Tier am Busch steht
    x += a.spur * (1 - a.nah);

    const laeuft = a.phase === "hin" || a.phase === "zurueck"
      || a.phase === "annaehern" || a.phase === "entfernen";
    const wippen = a.phase === "ernten" && Math.floor(this.time.now / 200) % 2 === 0 ? 1 * K : 0;
    const bild = (laeuft || a.phase === "ernten") ? Math.floor(this.time.now / 150) % 4 : 0;
    let reihe;
    if (a.phase === "ernten") reihe = "beaver-arbeit-";
    else if (a.traegt) reihe = "beaver-carry-";
    else if (a.phase === "hin" || a.phase === "annaehern") reihe = "beaver-hinten-";
    else reihe = "beaver-rechts-";
    let schluessel = reihe + bild;
    if (!this.textures.exists(schluessel)) {
      schluessel = this.textures.exists(`beaver-${bild}`) ? `beaver-${bild}` : "beaver-0";
    }
    a.bild.setTexture(schluessel);
    a.bild.setPosition(x, y + wippen);
    a.bild.setDepth(10 + y);
    const kisteImSprite = this.textures.exists("beaver-carry-0");
    a.kiste.setVisible(a.traegt && !kisteImSprite);
    if (a.kiste.visible) {
      a.kiste.setPosition(x + 6 * K, y - 4 * K).setDepth(11 + y);
    }
  }

  fahreWagen(dt) {
    const w = this.wagen;
    const bild = this.wagenBild;
    const tempo = wagenTempo();

    if (w.phase === "wartet") {
      if (state.kisten >= kistenPlaetze()) {
        state.wagenLadung = state.kisten;
        state.kisten = 0;
        this.aktualisiereStation();
        this.aktualisiereWagen();
        w.phase = "hin";
        bus.emit("aendert");
      }
    } else if (w.phase === "hin") {
      bild.x += tempo * dt;
      if (bild.x >= RAIL.dock) {
        bild.x = RAIL.dock;
        w.phase = "abladen";
        w.timer = RULES.unloadSeconds;
      }
    } else if (w.phase === "abladen") {
      w.timer -= dt;
      if (w.timer <= 0) {
        const proKiste = beerenProKiste();
        const platz = Math.floor((lagerKapazitaet() - state.beeren) / proKiste);
        const menge = Math.min(state.wagenLadung, Math.max(0, platz));
        if (menge <= 0) {
          // Das Regal ist voll. Der Wagen steht am Stand und wartet, bis
          // Cozywolf etwas ausgibt – die ganze Kette hält sichtbar an.
          w.blockiert = true;
          w.timer = 0.4;
        } else {
          // Der Bestand steigt erst hier, nie vorher.
          state.beeren += menge * proKiste;
          state.wagenLadung -= menge;
          this.aktualisiereWagen();
          this.aktualisiereRegal();
          this.funken.emitParticleAt(PLACES.store.x, PLACES.store.y - 30 * K, 14);
          bus.emit("aendert");
          if (state.wagenLadung > 0) {
            w.blockiert = true;           // Rest passt nicht mehr
            w.timer = 0.4;
          } else {
            w.blockiert = false;
            state.lieferungen++;
            this.weckeWolf();
            speichern();
            w.phase = "zurueck";
          }
        }
      }
    } else if (w.phase === "zurueck") {
      bild.x -= tempo * dt;
      if (bild.x <= RAIL.home) { bild.x = RAIL.home; w.phase = "wartet"; }
    }
    this.setzeWagenKisten();
  }

  /** Wartezeichen ein- und ausblenden, mit ruhigem Wippen. */
  zeigeStau() {
    for (const [id, z] of Object.entries(this.stauZeichen)) {
      const an = !!state.stau[id];
      if (an !== z.visible) z.setVisible(an);
      if (an) z.y = z.grundY + Math.sin(this.time.now / 320) * 2 * K;
    }
  }

  /**
   * Eine Zeile, nicht vier. Staus haben Vorrang – sie sind das, was die
   * spielende Person wissen muss; alles andere sieht sie ohnehin.
   */
  aktualisiereMeldung() {
    if (state.stau.lager) {
      melde("Das Regal ist voll – der Wurzelwagen kann nicht abladen. Bau etwas.");
      return;
    }
    if (state.stau.station) {
      melde("Die Verladestation ist voll – der Wurzelwagen kommt nicht nach");
      return;
    }
    if (state.stau.beet) {
      const wartend = this.arbeiter.filter((a) => a.phase === "sucht");
      const namen = wartend.map((a) => a.name).join(" und ");
      melde(`Das Beet ist abgeerntet – ${namen} ${wartend.length > 1 ? "warten" : "wartet"}`);
      return;
    }
    if (this.wagen.phase === "hin") { melde("Der Wurzelwagen fährt zum Vorratsstand"); return; }
    if (this.wagen.phase === "abladen") { melde("Ankunft – die Kisten wandern ins Regal"); return; }
    if (this.wagen.phase === "zurueck") { melde("Der Wurzelwagen kehrt zur Verladestation zurück"); return; }
    const traeger = this.arbeiter.filter((a) => a.traegt).length;
    if (traeger > 0) {
      melde(traeger === 1
        ? "Eine Kiste ist unterwegs zur Verladestation"
        : `${traeger} Kisten sind unterwegs zur Verladestation`);
      return;
    }
    melde("Im Glühbeerenbeet wird geerntet");
  }

  weckeWolf() {
    this.tweens.add({
      targets: this.wolf, y: this.wolf.y - 2 * K, duration: 160, yoyo: true, repeat: 1, ease: "Sine.easeOut"
    });
    const herz = this.add.image(this.wolf.x - 8 * K, this.wolf.y - 18 * K, "spark")
      .setTint(0xff9cc0).setScale(2).setDepth(950);
    this.tweens.add({
      targets: herz, y: herz.y - 12 * K, alpha: 0, duration: 1100,
      ease: "Sine.easeOut", onComplete: () => herz.destroy()
    });
  }
}
