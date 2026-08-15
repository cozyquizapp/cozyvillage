/**
 * Die Lichtung – Fellgrunds einzige Bühne.
 *
 * Hier läuft die erste vollständige Produktionskette:
 * Glühbeerenbeet → Bramble sammelt → Verladestation → Wurzelwagen →
 * Vorratsstand → Glühbeerenbestand.
 *
 * Der Bestand steigt erst bei der tatsächlichen Ankunft des Wagens.
 */

import Phaser from "phaser";
import {
  VIEW, GLADE, gladeHalf, PLACES, PATH, RAIL, PROPS, FUTURE_PARCELS,
  TREE_RING, RULES, UPGRADES
} from "../game/config.js";
import {
  state, bus, melde, kistenPlaetze, wagenKapazitaet, speichern, istFreigeschaltet
} from "../game/state.js";

export default class GladeScene extends Phaser.Scene {
  constructor() {
    super("Glade");
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);

    this.tiefe = this.add.container(0, 0);
    this.baueWaldkranz();
    this.baueParzellen();
    this.baueStreuobjekte();
    this.baueBeet();
    this.baueStation();
    this.baueVorratsstand();
    this.baueNest();
    this.baueWagen();
    this.baueBramble();
    this.baueLaterne();

    this.funken = this.add.particles(0, 0, "spark", {
      lifespan: 620, speed: { min: 18, max: 48 }, gravityY: 40,
      scale: { start: 1, end: 0 }, quantity: 0, emitting: false,
      tint: [0xfff6d0, 0xffd05c]
    }).setDepth(900);

    this.bramble = {
      fortschritt: 1, phase: "hin", timer: 0, traegt: false
    };
    this.wagen = { phase: "wartet", timer: 0 };

    bus.on("ausbau", this.beiAusbau, this);
    this.events.once("shutdown", () => bus.off("ausbau", this.beiAusbau, this));

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
    for (let x = 14; x <= VIEW.width - 14; x += TREE_RING.stepX) {
      const y = GLADE.top + 2 + ((x * 13) % 4);
      this.tiefeSetzen(this.add.image(x, y, `tree-${v++ % 3}-d`).setOrigin(0.5, 1), y);
      const yb = GLADE.bottom + 3;
      this.tiefeSetzen(this.add.image(x + 6, yb, "shrub-d").setOrigin(0.5, 1), yb);
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

  baueStreuobjekte() {
    for (const p of PROPS) {
      const key = p.kind === "rock" ? "rock" : "shrub";
      this.tiefeSetzen(this.add.image(p.x, p.y, key).setOrigin(0.5, 1), p.y);
    }
  }

  baueBeet() {
    const b = PLACES.beet;
    this.buesche = [];
    const versatz = [[-16, -6], [-6, 2], [4, -4], [14, 3], [-10, 8], [8, 8]];
    versatz.forEach(([dx, dy], i) => {
      const bild = this.add.image(b.x + dx, b.y + dy, "bush-0").setOrigin(0.5, 1);
      this.tiefeSetzen(bild, b.y + dy);
      bild.setInteractive({ useHandCursor: true });
      bild.on("pointerup", () => this.oeffneBeet());
      this.buesche.push(bild);
    });
    this.time.addEvent({
      delay: 420, loop: true,
      callback: () => this.buesche.forEach((bu, i) =>
        bu.setTexture(`bush-${(Math.floor(this.time.now / 420) + i) % 3}`))
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
    this.tiefeSetzen(this.add.image(n.x, n.y, "nest").setOrigin(0.5, 1), n.y - 2);
    this.wolf = this.add.image(n.x - 1, n.y - 8, "wolf-sleep").setOrigin(0.5, 1);
    this.tiefeSetzen(this.wolf, n.y - 1);
    this.tiefeSetzen(this.add.image(n.x, n.y, "nest-rim").setOrigin(0.5, 1), n.y);
    this.bluete = this.add.image(n.x + 20, n.y - 6, "blossom").setOrigin(0.5, 1);
    this.tiefeSetzen(this.bluete, n.y);
    this.bluete.setVisible(state.ausbauten.wagenlager);

    this.wolf.setInteractive({ useHandCursor: true });
    this.wolf.on("pointerup", () => bus.emit("oeffne", {
      titel: "Cozywolf",
      zeilen: [
        "Er schläft im Nest und ist das Herz von Fellgrund.",
        "Er wacht kurz auf, wenn eine Lieferung ankommt.",
        `Bisherige Lieferungen: ${state.lieferungen}`
      ],
      gesperrt: true
    }));

    // Atmen
    this.tweens.add({
      targets: this.wolf, y: this.wolf.y - 1, duration: 1400,
      yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
  }

  baueWagen() {
    this.wagenBild = this.add.image(RAIL.home, RAIL.y + 4, "cart").setOrigin(0.5, 1);
    this.tiefeSetzen(this.wagenBild, RAIL.y + 4);
    this.wagenKisten = [];
    this.wagenBild.setInteractive({ useHandCursor: true });
    this.wagenBild.on("pointerup", () => bus.emit("oeffne", {
      titel: "Wurzelwagen",
      zeilen: [
        `Ladung pro Fahrt: ${wagenKapazitaet()} Kisten`,
        "Er fährt ausschließlich auf der sichtbaren Schiene.",
        "Er fährt erst los, wenn die Verladestation voll ist."
      ],
      gesperrt: true
    }));
  }

  baueBramble() {
    this.brambleBild = this.add.image(PATH.to.x, PATH.to.y, "beaver-0").setOrigin(0.5, 1);
    this.tiefeSetzen(this.brambleBild, PATH.to.y);
    this.brambleKiste = this.add.image(0, 0, "crate").setOrigin(0.5, 1).setVisible(false);
  }

  baueLaterne() {
    const x = PLACES.station.x - 30, y = PLACES.station.y - 4;
    this.tiefeSetzen(this.add.image(x, y, "lamp").setOrigin(0.5, 1), y);
    const schein = this.add.ellipse(x, y - 1, 44, 22, 0xffce78, 0.13).setDepth(6);
    this.tweens.add({
      targets: schein, alpha: 0.2, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
    const standSchein = this.add.ellipse(
      PLACES.store.x, PLACES.store.y - 2, 62, 26, 0xffce78, 0.12
    ).setDepth(6);
    this.tweens.add({
      targets: standSchein, alpha: 0.17, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
  }

  /* ----------------------------------------------------------- *
   * Sichtbare Güter
   * ----------------------------------------------------------- */

  aktualisiereStation() {
    const plaetze = kistenPlaetze();
    const s = PLACES.station;
    const breite = 8 + plaetze * 10;
    const links = s.x - breite / 2 + 8;
    while (this.stationKisten.length > state.kisten) this.stationKisten.pop().destroy();
    while (this.stationKisten.length < state.kisten) {
      const i = this.stationKisten.length;
      const kiste = this.add.image(links + i * 10, s.y - 14, "crate").setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, s.y + 1);
      this.stationKisten.push(kiste);
      // Die Kiste landet mit einem kurzen Stauchen, statt zu erscheinen.
      kiste.setScale(1.5, 0.5);
      this.tweens.add({ targets: kiste, scaleX: 1, scaleY: 1, duration: 220, ease: "Back.easeOut" });
    }
  }

  aktualisiereRegal() {
    const s = PLACES.store;
    const anzahl = Math.min(12, Math.floor(state.beeren / RULES.berriesPerCrate));
    while (this.regalKisten.length > anzahl) this.regalKisten.pop().destroy();
    while (this.regalKisten.length < anzahl) {
      const i = this.regalKisten.length;
      const reihe = Math.floor(i / 4), spalte = i % 4;
      const x = s.x - 20 + spalte * 10;
      const y = s.y - 28 + reihe * 10;
      const kiste = this.add.image(x, y, "crate").setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, s.y + 1 + reihe);
      this.regalKisten.push(kiste);
      kiste.y -= 8;
      kiste.setAlpha(0);
      this.tweens.add({ targets: kiste, y, alpha: 1, duration: 260, ease: "Back.easeOut" });
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
      k.x = x - 7 + (i % 2) * 9;
      k.y = RAIL.y - 7 - Math.floor(i / 2) * 8;
    });
  }

  /* ----------------------------------------------------------- *
   * Panels
   * ----------------------------------------------------------- */

  oeffneBeet() {
    bus.emit("oeffne", {
      titel: PLACES.beet.label,
      zeilen: [
        "Bramble erntet hier von Hand.",
        `Eine volle Kiste enthält ${RULES.berriesPerCrate} Glühbeeren.`,
        "Solange das Beet leuchtet, gibt es Nachschub."
      ],
      gesperrt: true
    });
  }

  oeffneStation() {
    const up = UPGRADES.wagenlager;
    const gebaut = state.ausbauten.wagenlager;
    bus.emit("oeffne", {
      titel: PLACES.station.label,
      zeilen: [
        `Kistenplätze: ${state.kisten} von ${kistenPlaetze()} belegt`,
        `Abgeschlossene Lieferungen: ${state.lieferungen}`,
        gebaut ? "Ausgebaut mit Wagenlager." : ""
      ].filter(Boolean),
      ausbau: gebaut ? null : {
        id: up.id,
        name: up.name,
        kosten: up.cost,
        beschreibung: up.beschreibung,
        wirkung: up.wirkung,
        freigeschaltet: istFreigeschaltet(up.id),
        hinweis: istFreigeschaltet(up.id)
          ? null
          : `Freigeschaltet nach ${up.unlockAfterDeliveries} Lieferungen.`
      }
    });
  }

  oeffneStand() {
    bus.emit("oeffne", {
      titel: PLACES.store.label,
      zeilen: [
        `Glühbeerenbestand: ${state.beeren}`,
        `Im Regal sichtbar: ${this.regalKisten.length} Kisten`,
        "Der Bestand steigt erst, wenn der Wagen tatsächlich ankommt."
      ],
      gesperrt: true
    });
  }

  beiAusbau(id) {
    if (id !== "wagenlager") return;
    this.station.setTexture("station-2");
    this.bluete.setVisible(true).setScale(0);
    this.tweens.add({ targets: this.bluete, scale: 1, duration: 420, ease: "Back.easeOut" });
    this.funken.emitParticleAt(PLACES.station.x, PLACES.station.y - 24, 16);
    this.cameras.main.flash(180, 255, 226, 160, false);
    this.aktualisiereStation();
    melde("Das Wagenlager steht – die Verladestation hat jetzt ein Vordach");
  }

  /* ----------------------------------------------------------- *
   * Der Kreislauf
   * ----------------------------------------------------------- */

  update(zeit, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.laufeBramble(dt);
    this.fahreWagen(dt);
  }

  laufeBramble(dt) {
    const b = this.bramble;
    const strecke = Phaser.Math.Distance.Between(PATH.from.x, PATH.from.y, PATH.to.x, PATH.to.y);
    const tempo = (RULES.walkSpeed / strecke) * dt;

    if (b.phase === "hin") {
      b.fortschritt = Math.max(0, b.fortschritt - tempo);
      melde("Bramble geht zum Glühbeerenbeet");
      if (b.fortschritt === 0) { b.phase = "ernten"; b.timer = RULES.harvestSeconds; }
    } else if (b.phase === "ernten") {
      b.timer -= dt;
      melde("Bramble erntet Glühbeeren");
      if (b.timer <= 0) { b.phase = "zurueck"; b.traegt = true; }
    } else if (b.phase === "zurueck") {
      b.fortschritt = Math.min(1, b.fortschritt + tempo);
      melde("Bramble trägt eine Kiste zur Verladestation");
      if (b.fortschritt === 1) { b.phase = "abgeben"; b.timer = RULES.dropSeconds; }
    } else if (b.phase === "abgeben") {
      b.timer -= dt;
      if (b.timer <= 0) {
        if (state.kisten < kistenPlaetze()) {
          state.kisten++;
          b.traegt = false;
          b.phase = "hin";
          this.aktualisiereStation();
          this.funken.emitParticleAt(PLACES.station.x, PLACES.station.y - 12, 4);
          bus.emit("aendert");
        } else {
          melde("Verladestation voll – Bramble wartet auf den Wurzelwagen");
          b.timer = 0.4;
        }
      }
    }

    const x = PATH.from.x + (PATH.to.x - PATH.from.x) * b.fortschritt;
    const y = PATH.from.y + (PATH.to.y - PATH.from.y) * b.fortschritt;
    const laeuft = b.phase === "hin" || b.phase === "zurueck";
    const wippen = b.phase === "ernten" && Math.floor(this.time.now / 200) % 2 === 0 ? 1 : 0;
    this.brambleBild.setTexture(
      laeuft && Math.floor(this.time.now / 140) % 2 === 0 ? "beaver-1" : "beaver-0"
    );
    this.brambleBild.setPosition(x, y + wippen);
    this.brambleBild.setDepth(10 + y);
    this.brambleKiste.setVisible(b.traegt);
    if (b.traegt) {
      this.brambleKiste.setPosition(x + 6, y - 4).setDepth(11 + y);
    }
  }

  fahreWagen(dt) {
    const w = this.wagen;
    const bild = this.wagenBild;

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
      bild.x += RULES.cartSpeed * dt;
      melde("Wurzelwagen fährt zum Vorratsstand");
      if (bild.x >= RAIL.dock) {
        bild.x = RAIL.dock;
        w.phase = "abladen";
        w.timer = RULES.unloadSeconds;
      }
    } else if (w.phase === "abladen") {
      w.timer -= dt;
      melde("Ankunft – die Kisten wandern ins Regal");
      if (w.timer <= 0) {
        // Der Bestand steigt erst hier, nie vorher.
        state.beeren += state.wagenLadung * RULES.berriesPerCrate;
        state.lieferungen++;
        state.wagenLadung = 0;
        this.aktualisiereWagen();
        this.aktualisiereRegal();
        this.funken.emitParticleAt(PLACES.store.x, PLACES.store.y - 30, 14);
        this.weckeWolf();
        bus.emit("aendert");
        speichern();
        w.phase = "zurueck";
      }
    } else if (w.phase === "zurueck") {
      bild.x -= RULES.cartSpeed * dt;
      melde("Wurzelwagen kehrt zur Verladestation zurück");
      if (bild.x <= RAIL.home) { bild.x = RAIL.home; w.phase = "wartet"; }
    }
    this.setzeWagenKisten();
  }

  weckeWolf() {
    melde("Cozywolf hebt kurz das Ohr");
    this.tweens.add({
      targets: this.wolf, y: this.wolf.y - 2, duration: 160, yoyo: true, repeat: 1, ease: "Sine.easeOut"
    });
    const herz = this.add.image(this.wolf.x - 8, this.wolf.y - 18, "spark")
      .setTint(0xff9cc0).setScale(2).setDepth(950);
    this.tweens.add({
      targets: herz, y: herz.y - 12, alpha: 0, duration: 1100,
      ease: "Sine.easeOut", onComplete: () => herz.destroy()
    });
  }
}
