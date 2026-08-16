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
  TREE_RING, RULES, UPGRADES, BEET_PLAETZE, ARBEITER, REGAL, WAGEN_BETT,
  GLEISPLAN, NUTZBAEUME, HOLZWEG, ausbautenFuer, K
} from "../game/config.js";
import { baueNetz, KNOTENART } from "../welt/graph.js";
import { Wagen } from "../welt/wagen.js";
import {
  state, bus, melde, speichern, istFreigeschaltet,
  kistenPlaetze, wagenKapazitaet, beerenProKiste, regalPlaetze, lagerKapazitaet,
  beetBuesche, reifeSekunden, arbeiterZahl, wagenTempo,
  werkstattSteht, holzstapel, brettSekunden
} from "../game/state.js";

export default class GladeScene extends Phaser.Scene {
  constructor() {
    super("Glade");
  }

  create() {
    // Das Gleisnetz steht vor allem anderen: Bauplätze und Wagen beziehen
    // ihre Positionen aus ihm, nicht mehr aus festen Zahlen.
    this.netz = baueNetz(GLEISPLAN);

    this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);
    this.baueWald();
    this.baueParzellen();
    this.baueTeich();
    this.baueStreuobjekte();
    this.baueBeet();
    this.baueStation();
    this.baueVorratsstand();
    this.baueNest();
    this.baueNutzbaeume();
    this.baueWerkstatt();
    this.baueGleisnetz();
    this.baueWagen();
    this.baueArbeiter();
    this.baueNussa();
    this.baueLaterne();
    this.baueStauzeichen();

    this.funken = this.add.particles(0, 0, "spark", {
      lifespan: 620, speed: { min: 18, max: 48 }, gravityY: 40,
      scale: { start: 1, end: 0 }, quantity: 0, emitting: false,
      tint: [0xfff6d0, 0xffd05c]
    }).setDepth(900);

    this.fahrt = { phase: "wartet", timer: 0, blockiert: false };

    bus.on("ausbau", this.beiAusbau, this);
    this.events.once("shutdown", () => bus.off("ausbau", this.beiAusbau, this));

    // Ein geladener Spielstand muss die Welt sofort im richtigen Zustand zeigen
    if (state.ausbauten.wagenlager) this.station.setTexture("station-2");
    if (state.ausbauten.bewaesserung) this.zeigeRinne();
    if ((state.ausbauten.regalreihe || state.ausbauten.lagerschuppen)
        && this.textures.exists("store-2")) {
      this.stand.setTexture("store-2");
    }
    if (state.ausbauten.saege && this.textures.exists("werkstatt-1")) {
      this.werkstatt.setTexture("werkstatt-1");
    }
    this.aktualisiereStation();
    this.aktualisiereRegal();
    this.aktualisiereWerkstatt();

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
   * Macht ein Objekt anklickbar – und zeigt das auch.
   *
   * Vorher war nirgends zu erkennen, worauf man klicken kann; man musste die
   * Lichtung mit dem Mauszeiger abtasten. Jetzt hebt sich alles Anklickbare
   * beim Überfahren leicht an, wird wärmer und bekommt einen weichen Schein
   * am Fußpunkt. Der Schein liegt unter dem Objekt, damit er es nicht
   * überdeckt.
   */
  machAnklickbar(obj, handler) {
    obj.setInteractive({ useHandCursor: true });
    const ruheY = obj.y;
    let schein = null;
    obj.on("pointerover", () => {
      obj.setTint(0xfff0c8);
      obj.y = ruheY - 1 * K;
      if (!schein) {
        schein = this.add.ellipse(obj.x, ruheY + 2, obj.displayWidth * 0.9, 10 * K, 0xffd05c, 0.16)
          .setDepth(Math.max(4, obj.depth - 0.5))
          .setBlendMode(Phaser.BlendModes.ADD);
      }
      schein.setVisible(true).setPosition(obj.x, ruheY + 2);
    });
    obj.on("pointerout", () => {
      obj.clearTint();
      obj.y = ruheY;
      if (schein) schein.setVisible(false);
    });
    obj.on("pointerup", handler);
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
      this.machAnklickbar(bild, () => bus.emit("oeffne", {
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

    /*
     * Das Ufer.
     *
     * Die gelieferten Flecken sind 64 × 64 groß und zu zwei Dritteln gefüllt –
     * gedacht, um daraus ein ganzes Becken zu stempeln. Ich hatte sie in voller
     * Größe an den Rand der Maske gelegt; dadurch ragte jeder Fleck rund
     * zweiundzwanzig Pixel über die Wasserkante hinaus, und seine helle
     * Randlinie lag als geschwungener Streifen mitten im Becken. Genau das
     * waren die "Striche im Wasser".
     *
     * Halbiert und enger gesetzt bilden dieselben Flecken einen acht Pixel
     * breiten Uferrand – das, wofür eine Randlinie da ist.
     */
    /*
     * Ufer und Wasserkante folgen derselben Linie.
     *
     * Vorher war die Wasserfläche eine glatte Ellipse und die Uferflecken lagen
     * als Ring darauf. Jede Fleckenrandlinie, die dabei ins Becken ragte, wurde
     * zu einem geschwungenen hellen Strich mitten im Wasser — das waren die
     * "Striche", nicht die Wasserkacheln. Nachgewiesen, indem ich die Flecken
     * abgeschaltet habe: Dann sind sie weg.
     *
     * Jetzt beschreibt eine einzige gewellte Linie beide Dinge: Sie ist die
     * Maske für das Wasser und zugleich die Kante des Ufers. Die Flecken liegen
     * ganz außerhalb davon und können deshalb nicht mehr hineinragen.
     */
    const welle = (a) => 1 + Math.sin(a * 3) * 0.07 + Math.sin(a * 5 + 1.3) * 0.05;
    const rand = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const f = welle(a);
      rand.push({ x: p.x + Math.cos(a) * rx * f, y: p.y + Math.sin(a) * ry * f, a });
    }

    // Uferstreifen: dieselbe Linie, etwas weiter außen
    const bank = this.add.graphics().setDepth(2.5);
    for (const [zuschlag, farbe] of [[10, 0x37603c], [6, 0x6e6046], [2, 0x8a6942]]) {
      bank.fillStyle(farbe, 1).beginPath();
      rand.forEach((pt, i) => {
        const f = welle(pt.a);
        const x = p.x + Math.cos(pt.a) * (rx * f + zuschlag);
        const y = p.y + Math.sin(pt.a) * (ry * f + zuschlag * 0.7);
        i === 0 ? bank.moveTo(x, y) : bank.lineTo(x, y);
      });
      bank.closePath().fillPath();
    }

    /*
     * Die gelieferten Uferflecken bleiben vorerst ungenutzt.
     *
     * Sie sind gefüllte Wasserblasen mit heller Randlinie – gedacht, um daraus
     * ein Becken zu stempeln. Als Ufer um ein vorhandenes Becken gelegt,
     * streuen sie ihre Randlinien zwangsläufig ins Wasser, egal in welcher
     * Größe oder auf welchem Radius. Ich habe es in drei Fassungen versucht
     * und jedes Mal dieselben geschwungenen Striche bekommen.
     *
     * Was hier gebraucht wird, ist kein Fleck, sondern eine **Kante**: ein
     * Bildteil, das fast vollständig durchsichtig ist und nur die Uferlinie
     * zeigt. Das ist bestellt. Bis dahin zeichne ich die Kante selbst – aus
     * derselben gewellten Linie wie die Wassermaske, damit beide zwangsläufig
     * übereinstimmen.
     */

    const wasser = this.add.container(0, 0).setDepth(2.8);
    const kachel = 32;
    this.wasserKacheln = [];
    for (let y = p.y - ry - kachel; y < p.y + ry + kachel; y += kachel) {
      for (let x = p.x - rx - kachel; x < p.x + rx + kachel; x += kachel) {
        const k = this.add.image(x, y, "wasser-0").setOrigin(0, 0);
        // Ohne Spiegeln liest man das 32er-Raster als Gitter im Wasser.
        const wuerfel = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        k.setFlipX((wuerfel & 1) === 1).setFlipY((wuerfel & 2) === 2);
        wasser.add(k);
        this.wasserKacheln.push(k);
      }
    }
    const form = this.make.graphics({ x: 0, y: 0, add: false });
    form.fillStyle(0xffffff).beginPath();
    rand.forEach((pt, i) => (i === 0 ? form.moveTo(pt.x, pt.y) : form.lineTo(pt.x, pt.y)));
    form.closePath().fillPath();
    wasser.setMask(form.createGeometryMask());

    this.time.addEvent({
      delay: 280, loop: true,
      callback: () => {
        const f = Math.floor(this.time.now / 280) % 4;
        for (const k of this.wasserKacheln) k.setTexture(`wasser-${f}`);
      }
    });

    /*
     * Die Schilf- und Seerosenflecken liegen zurzeit nicht auf dem Wasser.
     *
     * Jeder von ihnen trägt einen rund zwanzig Pixel langen, hellen
     * Waagerechtbalken als Glanzlicht. Über die Beckenfläche gestempelt
     * ergeben fünf davon genau den Eindruck, den die erste Fassung meiner
     * eigenen Glanzlichter machte: Schnitte im Bild statt Wasser. Sobald
     * die Flecken ohne diesen Balken vorliegen, kommen sie zurück – der
     * Aufruf steht auskommentiert direkt hier.
     */
    // if (this.textures.exists("ufer-bewuchs-0")) { … }

    // Früher lagen hier drei harte Rechtecke als Glanzlichter. Sie sahen aus
    // wie Schnitte im Bild, weil sie eine Kante hatten, die das Wasser nicht
    // hat. Die gelieferten Wasserbilder bewegen sich bereits von selbst –
    // eine zusätzliche Bewegung braucht es nicht.

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
      this.machAnklickbar(bild, () => this.oeffneBeet());
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
    this.machAnklickbar(this.station, () => this.oeffneStation());
    this.stationKisten = [];
  }

  baueVorratsstand() {
    const s = PLACES.store;
    this.stand = this.add.image(s.x, s.y, "store").setOrigin(0.5, 1);
    this.tiefeSetzen(this.stand, s.y);
    this.machAnklickbar(this.stand, () => this.oeffneStand());
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

    this.machAnklickbar(this.wolf, () => this.oeffneNest());

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

  /**
   * Zeichnet das Gleisnetz aus dem Graphen.
   *
   * Der Zeichner kennt den Streckenplan nicht – er liest die Kanten aus dem
   * Netz und legt an jeden Knoten das Teil, das zu seinen Anschlüssen passt.
   * Für acht Speichen und einen Außenring ändert sich hier keine Zeile,
   * nur der Plan in `config.js`.
   */
  baueGleisnetz() {
    const T = 32;                         // Kantenlänge eines Gleisteils
    const hat = (k) => this.textures.exists(k);
    if (!hat("gleis-w")) return;          // ohne Gleissatz bleibt der Boden wie er ist

    const lege = (x, y, key, winkel = 0) => {
      const b = this.add.image(x, y, key).setDepth(4);
      if (winkel) b.setAngle(winkel);
      return b;
    };

    // Strecken: alle 32 px ein Teil, waagerecht oder senkrecht
    for (const { von, nach } of this.netz.alleKanten()) {
      const dx = nach.x - von.x, dy = nach.y - von.y;
      const laenge = Math.hypot(dx, dy);
      const waagerecht = Math.abs(dx) >= Math.abs(dy);
      // Aufrunden auf ein kleineres Raster als die Kachel: Bei runden Teilen
      // wurde der Abstand größer als 32 px, und die Strecke bekam Lücken —
      // zwischen Station und Weiche 3,3 px. Mit T − 6 überlappen die Teile
      // immer, egal wie lang die Kante ist.
      const anzahl = Math.max(1, Math.ceil(laenge / (T - 6)));
      for (let i = 0; i < anzahl; i++) {
        const q = (i + 0.5) / anzahl;
        lege(von.x + dx * q, von.y + dy * q, waagerecht ? "gleis-w" : "gleis-s");
      }
    }

    // Knoten: Kreuzung, Weiche oder Prellbock
    for (const k of this.netz.knoten.values()) {
      const grad = k.kanten.length;
      if (k.art === KNOTENART.ENDE) {
        const nachbar = this.netz.knoten.get(k.kanten[0]);
        const key = nachbar && nachbar.x < k.x ? "prellbock-rechts" : "prellbock-links";
        lege(k.x, k.y, key);
      } else if (grad >= 4) {
        lege(k.x, k.y, "gleis-x");
      } else if (grad === 3) {
        // Abzweig: das Weichenteil zeigt von Haus aus nach rechts unten
        const abzweig = k.kanten
          .map((id) => this.netz.knoten.get(id))
          .find((n) => Math.abs(n.y - k.y) > Math.abs(n.x - k.x));
        const winkel = abzweig && abzweig.y < k.y ? -90 : 0;
        lege(k.x, k.y, "gleis-weiche", winkel);
      } else if (grad === 2) {
        const [a, b] = k.kanten.map((id) => this.netz.knoten.get(id));
        const knick = Math.sign(a.x - k.x) !== -Math.sign(b.x - k.x)
          || Math.sign(a.y - k.y) !== -Math.sign(b.y - k.y);
        if (knick) lege(k.x, k.y, "gleis-lu");
      }
    }
  }

  baueWagen() {
    // Der Wagen ist jetzt ein Modell auf dem Graphen; das Bild folgt ihm.
    this.wagen = new Wagen(this.netz, "wurzelwagen", "station");
    const p = this.wagen.position();
    this.wagenBild = this.add.image(p.x, p.y + 8, "cart").setOrigin(0.5, 1);
    this.tiefeSetzen(this.wagenBild, p.y + 8);
    this.wagenKisten = [];
    this.machAnklickbar(this.wagenBild, () => bus.emit("oeffne", {
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

  /**
   * Die Nutzbäume.
   *
   * Umgekehrt zum Beerenbusch: Wer hier erntet, macht den Baum sichtbar
   * **kleiner** – voll, halb, Stumpf. Danach wächst er wieder. Damit ist auch
   * die Quelle der Holzkette am Bild ablesbar und nicht nur eine Zahl.
   */
  baueNutzbaeume() {
    this.baeume = NUTZBAEUME.map((n, i) => {
      const bild = this.add.image(n.x, n.y, "nutzbaum-0").setOrigin(0.5, 1);
      this.tiefeSetzen(bild, n.y);
      bild.setVisible(werkstattSteht());
      this.machAnklickbar(bild, () => this.oeffneWald());
      return { bild, x: n.x, y: n.y, stufen: RULES.scheitProBaum, reife: 0, belegt: null, index: i };
    });
  }

  baueWerkstatt() {
    const w = PLACES.werkstatt;
    this.werkstatt = this.add.image(w.x, w.y, "werkstatt-0").setOrigin(0.5, 1);
    this.tiefeSetzen(this.werkstatt, w.y);
    this.werkstatt.setVisible(werkstattSteht());
    this.machAnklickbar(this.werkstatt, () => this.oeffneWerkstatt());

    // Holzstapel links, Bretterstapel rechts der Werkbank – beide füllen sich
    // sichtbar, statt eine Zahl zu tragen.
    this.holzBild = this.add.image(w.x - 46, w.y - 2, "holzstapel-0").setOrigin(0.5, 1);
    this.tiefeSetzen(this.holzBild, w.y + 1);
    this.bretterBilder = [];
    this.werkstattParzelle = this.add.image(w.x, w.y - 12, "parcel").setOrigin(0.5, 0.6).setDepth(5);
    this.machAnklickbar(this.werkstattParzelle, () => this.oeffneWerkstatt());
    this.aktualisiereWerkstatt();
  }

  /** Nussa, das Eichhörnchen. Sie kommt mit der Werkstatt und geht mit ihr. */
  baueNussa() {
    const bild = this.add.image(HOLZWEG.to.x, HOLZWEG.to.y, "eich-0").setOrigin(0.5, 1);
    this.tiefeSetzen(bild, HOLZWEG.to.y);
    const last = this.add.image(0, 0, "scheit").setOrigin(0.5, 1).setVisible(false);
    this.nussa = {
      id: "nussa", name: "Nussa", bild, last,
      fortschritt: 1, nah: 0, phase: "hin", timer: 0, traegt: false,
      baum: null, blockiert: false, zielX: 0, zielY: 0, letzteNah: 1
    };
    bild.setVisible(werkstattSteht());
    last.setVisible(false);
  }

  aktualisiereWerkstatt() {
    const anteil = state.werkHolz / Math.max(1, holzstapel());
    const stufe = state.werkHolz === 0 ? 0 : anteil >= 0.66 ? 2 : 1;
    if (this.textures.exists(`holzstapel-${stufe}`)) {
      this.holzBild.setTexture(`holzstapel-${stufe}`);
    }
    this.holzBild.setVisible(werkstattSteht());
    this.werkstattParzelle.setVisible(!werkstattSteht());

    // Bretterstapel: bis zu vier sichtbare Stapel rechts der Werkbank
    const w = PLACES.werkstatt;
    const anzahl = Math.min(4, Math.ceil(state.bretter / 3));
    while (this.bretterBilder.length > anzahl) this.bretterBilder.pop().destroy();
    while (this.bretterBilder.length < anzahl) {
      const i = this.bretterBilder.length;
      const b = this.add.image(w.x + 40 + (i % 2) * 4, w.y - 2 - Math.floor(i / 2) * 10, "bretter")
        .setOrigin(0.5, 1);
      this.tiefeSetzen(b, w.y + 1);
      this.bretterBilder.push(b);
      b.setAlpha(0);
      this.tweens.add({ targets: b, alpha: 1, duration: 240 });
    }
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
    // Jede Blase steht rund zwölf Pixel über der Oberkante ihres Gebäudes –
    // nah genug, dass die Zuordnung ohne Nachdenken klappt.
    const orte = {
      beet: { x: PLACES.beet.x, y: PLACES.beet.y - 30 },
      station: { x: PLACES.station.x, y: PLACES.station.y - 84 },
      lager: { x: PLACES.store.x, y: PLACES.store.y - 96 },
      wald: { x: NUTZBAEUME[1].x, y: NUTZBAEUME[1].y - 104 },
      werk: { x: PLACES.werkstatt.x, y: PLACES.werkstatt.y - 92 }
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
    const gesamt = state.kisten + state.scheite;
    while (this.stationKisten.length > gesamt) this.stationKisten.pop().destroy();
    while (this.stationKisten.length < gesamt) {
      const i = this.stationKisten.length;
      // Erst die Beerenkisten, dann die Holzscheite – man sieht auf einen
      // Blick, worauf der Wagen als Nächstes reagieren wird.
      const key = i < state.kisten ? "crate" : "scheit";
      const kiste = this.add.image(links + i * 22, s.y + this.deckHoehe(), key).setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, s.y + 1);
      this.stationKisten.push(kiste);
      // Die Kiste landet mit einem kurzen Stauchen, statt zu erscheinen.
      kiste.setScale(1.5, 0.5);
      this.tweens.add({ targets: kiste, scaleX: 1, scaleY: 1, duration: 220, ease: "Back.easeOut" });
    }
    // Nach einem Ausbau stehen die alten Kisten falsch
    const hoehe = this.deckHoehe();
    this.stationKisten.forEach((k, i) => {
      k.x = links + i * 22;
      k.y = s.y + hoehe;
      const soll = i < state.kisten ? "crate" : "scheit";
      if (this.textures.exists(soll) && k.texture.key !== soll) k.setTexture(soll);
    });
  }

  /**
   * Höhe der Ladefläche über dem Fuß der Verladestation, am Bild gemessen.
   *
   * Stufe 1 ist ein flaches Podest (Mulde 2 px über dem Fuß), Stufe 2 hat ein
   * Vordach und eine erhöhte Ladefläche (15 px). Vorher stand hier ein fester
   * Wert, weshalb die Kisten auf Stufe 2 oben auf dem Dachbalken lagen.
   */
  deckHoehe() {
    return this.station && this.station.texture.key === "station-1" ? -3 : -15;
  }

  /**
   * Das Regal ist der Bestand. Es zeigt genau so viele Kisten, wie wirklich
   * gelagert sind, und ist voll, wenn der Vorrat voll ist – deshalb steht
   * nirgends eine Zahl, die man sonst glauben müsste.
   */
  /** Platz einer sichtbaren Kiste im Regal. */
  regalPlatz(i) {
    const s = PLACES.store;
    const spalte = i % REGAL.spalten.length;
    const reihe = Math.floor(i / REGAL.spalten.length);
    return {
      x: s.x + REGAL.spalten[spalte],
      y: s.y + REGAL.reihen[Math.min(reihe, REGAL.reihen.length - 1)],
      tiefe: s.y + 1 + (REGAL.reihen.length - reihe)
    };
  }

  /**
   * Das Regal zeigt, wie voll der Vorrat ist – nicht, wie viele Kisten er hat.
   *
   * Sechs Plätze, anteilig belegt. Ein halbvoller Vorrat zeigt drei Kisten,
   * ein voller sechs. Die genaue Zahl liest ohnehin niemand ab; man sieht nur,
   * ob noch Platz ist. Alles darüber hinaus bleibt im Gebäude.
   */
  aktualisiereRegal() {
    const anteil = Math.min(1, state.beeren / Math.max(1, lagerKapazitaet()));
    const anzahl = state.beeren > 0
      ? Math.max(1, Math.round(anteil * REGAL.sichtbar))
      : 0;
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
    const key = state.wagenArt === "holz" && this.textures.exists("scheit") ? "scheit" : "crate";
    for (let i = 0; i < state.wagenLadung; i++) {
      const kiste = this.add.image(0, 0, key).setOrigin(0.5, 1);
      this.tiefeSetzen(kiste, RAIL.y + 5);
      this.wagenKisten.push(kiste);
    }
    this.setzeWagenKisten();
  }

  /**
   * Die Kisten liegen in der Ladefläche, nicht daneben.
   *
   * Die Maße stammen aus dem gelieferten Wagenbild: Innenfläche 28 px breit,
   * Boden 17 px über dem Fuß. Vorher hingen die Kisten hinter dem Wagen in
   * der Luft, was aussah, als würde er sie hinterherziehen.
   */
  setzeWagenKisten() {
    const x = this.wagenBild.x, fuss = this.wagenBild.y;
    this.wagenKisten.forEach((k, i) => {
      const spalte = i % 2, reihe = Math.floor(i / 2);
      k.x = x - WAGEN_BETT.dx + spalte * WAGEN_BETT.dx * 2 + reihe * 3;
      k.y = fuss + WAGEN_BETT.dy - reihe * WAGEN_BETT.stapel;
      // Weiter hinten liegende Kisten verschwinden hinter der Bordwand
      k.setDepth(11 + RAIL.y + reihe * 0.1);
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
        id: u.id, name: u.name, kosten: u.cost, bretter: u.bretter || 0,
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
        `Vorrat: ${Math.round(state.beeren / Math.max(1, lagerKapazitaet()) * 100)} % des Lagers`,
        `Glühbeeren: ${state.beeren} von ${lagerKapazitaet()}`,
        state.stau.lager
          ? "Das Regal ist voll – der Wagen kann nicht abladen. Etwas ausgeben schafft Platz."
          : "Der Bestand steigt erst, wenn der Wagen tatsächlich ankommt.",
        this.gebauteZeile("store")
      ].filter(Boolean),
      ausbauten: this.ausbauListe("store")
    });
  }

  oeffneWald() {
    const voll = this.baeume.filter((b) => b.stufen > 0).length;
    bus.emit("oeffne", {
      titel: "Nutzbäume",
      zeilen: [
        `Bäume mit Holz: ${voll} von ${this.baeume.length}`,
        `Ein Baum gibt ${RULES.scheitProBaum} Scheite und wächst dann nach.`,
        `Eine Stufe braucht ${RULES.baumReifeSekunden} Sekunden.`,
        state.stau.wald ? "Alle Bäume sind abgeerntet – Nussa wartet." : ""
      ].filter(Boolean),
      gesperrt: true
    });
  }

  oeffneWerkstatt() {
    const steht = werkstattSteht();
    bus.emit("oeffne", {
      titel: PLACES.werkstatt.label,
      zeilen: steht ? [
        `Holzstapel: ${state.werkHolz} von ${holzstapel()} Scheiten`,
        `Bretter am Lager: ${state.bretter}`,
        `Ein Brett braucht ${brettSekunden()} Sekunden.`,
        state.stau.werk ? "Die Werkbank steht still – es kommt kein Holz an." : "",
        this.gebauteZeile("werkstatt")
      ].filter(Boolean) : [
        "Eine leere Fläche am Ende der Stichstrecke.",
        "Hier könnte aus Holz ein zweiter Baustoff werden."
      ],
      ausbauten: this.ausbauListe("werkstatt")
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
      case "werkstatt":
        this.werkstatt.setVisible(true).setScale(0.4);
        this.tweens.add({ targets: this.werkstatt, scale: 1, duration: 420, ease: "Back.easeOut" });
        this.baeume.forEach((b, i) => {
          b.bild.setVisible(true).setScale(0.4);
          this.tweens.add({ targets: b.bild, scale: 1, duration: 320, delay: i * 90, ease: "Back.easeOut" });
        });
        this.nussa.bild.setVisible(true);
        this.aktualisiereWerkstatt();
        break;
      case "saege":
        if (this.textures.exists("werkstatt-1")) this.werkstatt.setTexture("werkstatt-1");
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
    state.stau.wald = false;
    this.reifeBeet(dt);
    this.wachseBaeume(dt);
    if (werkstattSteht()) this.laufeNussa(dt);
    this.arbeiteWerkstatt(dt);
    for (const a of this.arbeiter) this.laufeArbeiter(a, dt);
    // Ein Tier blockiert, solange es mit voller Kiste an der Station steht –
    // nicht nur in dem Bild, in dem es erfolglos nachfasst.
    state.stau.station = this.arbeiter.some((a) => a.blockiert && a.phase === "abgeben")
      || (werkstattSteht() && this.nussa.blockiert && this.nussa.phase === "abgeben");
    this.fahreWagen(dt);
    // Der Wagen merkt sich seine Blockade über mehrere Bilder hinweg, sonst
    // würde das Wartezeichen im Takt des Nachfassens flackern.
    state.stau.lager = this.fahrt.blockiert && this.fahrt.phase === "abladen";
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
          a.blockiert = false;
          a.traegt = false;
          a.phase = "hin";
          this.aktualisiereStation();
          this.funken.emitParticleAt(PLACES.station.x, PLACES.station.y - 12 * K, 4);
          bus.emit("aendert");
        } else {
          // Merken, nicht nur in diesem Bild setzen: sonst blinkt das
          // Wartezeichen im Takt des Nachfassens.
          a.blockiert = true;
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

  /**
   * Der Kreislauf des Wurzelwagens, jetzt auf dem Graphen.
   *
   * Der Wagen bekommt ein Ziel und findet seinen Weg selbst. Für die eine
   * Strecke von heute ist das dasselbe Ergebnis wie vorher – aber es ist
   * dieselbe Zeile Code, die später acht Speichen bedient.
   */
  fahreWagen(dt) {
    const f = this.fahrt;
    const tempo = wagenTempo();

    if (f.phase === "wartet") {
      /*
       * Hier entsteht die Verzahnung der beiden Ketten.
       *
       * Ein Wagen, zwei Ziele: Beerenkisten wollen zum Vorratsstand, Scheite
       * zur Werkstatt. Beide belegen dieselben Plätze an der Verladestation.
       * Der Wagen nimmt, wovon mehr wartet – bei Gleichstand das Holz, damit
       * die Werkstatt nicht verhungert. Damit wird die Frage "wofür setze ich
       * meine Tiere ein" zum ersten Mal eine Entscheidung.
       */
      const platzImWerk = werkstattSteht()
        ? holzstapel() - state.werkHolz : 0;
      const holzFaehrt = state.scheite > 0 && platzImWerk > 0;
      const beerenFaehrt = state.kisten > 0;
      const voll = state.kisten + state.scheite >= kistenPlaetze();

      if (voll || (holzFaehrt && state.scheite >= kistenPlaetze())) {
        const nimmHolz = holzFaehrt && (state.scheite >= state.kisten || !beerenFaehrt);
        if (nimmHolz) {
          state.wagenArt = "holz";
          state.wagenLadung = Math.min(state.scheite, wagenKapazitaet(), platzImWerk);
          state.scheite -= state.wagenLadung;
        } else if (beerenFaehrt) {
          state.wagenArt = "beeren";
          state.wagenLadung = Math.min(state.kisten, wagenKapazitaet());
          state.kisten -= state.wagenLadung;
        }
        if (state.wagenLadung > 0) {
          this.aktualisiereStation();
          this.aktualisiereWagen();
          if (this.wagen.fahreZu(state.wagenArt === "holz" ? "werkstatt" : "lager")) {
            f.phase = "hin";
          }
          bus.emit("aendert");
        }
      }
    } else if (f.phase === "hin") {
      this.wagen.tick(dt, tempo);
      if (this.wagen.amZiel) { f.phase = "abladen"; f.timer = RULES.unloadSeconds; }
    } else if (f.phase === "abladen") {
      f.timer -= dt;
      if (f.timer <= 0) {
        const fertig = state.wagenArt === "holz"
          ? this.ladeHolzAb() : this.ladeBeerenAb();
        if (!fertig) { f.blockiert = true; f.timer = 0.4; }
        else {
          f.blockiert = false;
          if (this.wagen.fahreZu("station")) f.phase = "zurueck";
        }
      }
    } else if (f.phase === "zurueck") {
      this.wagen.tick(dt, tempo);
      if (this.wagen.amZiel) f.phase = "wartet";
    }

    // Das Bild folgt dem Modell, nie umgekehrt.
    const p = this.wagen.position();
    this.wagenBild.setPosition(p.x, p.y + 8);
    this.wagenBild.setDepth(10 + p.y + 8);
    this.wagenBild.setFlipX(p.dx < -0.3);
    this.setzeWagenKisten();
  }

  /** Gibt true zurück, wenn der Wagen vollständig leer ist. */
  ladeBeerenAb() {
    const proKiste = beerenProKiste();
    const platz = Math.floor((lagerKapazitaet() - state.beeren) / proKiste);
    const menge = Math.min(state.wagenLadung, Math.max(0, platz));
    if (menge <= 0) return false;
    // Der Bestand steigt erst hier, nie vorher.
    state.beeren += menge * proKiste;
    state.wagenLadung -= menge;
    this.aktualisiereWagen();
    this.aktualisiereRegal();
    this.funken.emitParticleAt(PLACES.store.x, PLACES.store.y - 30 * K, 14);
    bus.emit("aendert");
    if (state.wagenLadung > 0) return false;
    state.lieferungen++;
    this.weckeWolf();
    speichern();
    return true;
  }

  ladeHolzAb() {
    const platz = holzstapel() - state.werkHolz;
    const menge = Math.min(state.wagenLadung, Math.max(0, platz));
    if (menge <= 0) return false;
    state.werkHolz += menge;
    state.wagenLadung -= menge;
    this.aktualisiereWagen();
    this.aktualisiereWerkstatt();
    this.funken.emitParticleAt(PLACES.werkstatt.x - 40, PLACES.werkstatt.y - 16, 10);
    bus.emit("aendert");
    if (state.wagenLadung > 0) return false;
    state.lieferungen++;
    this.weckeWolf();
    speichern();
    return true;
  }

  /** Jeder Nutzbaum wächst Stufe um Stufe nach. */
  wachseBaeume(dt) {
    for (const b of this.baeume) {
      b.bild.setVisible(werkstattSteht());
      if (b.stufen < RULES.scheitProBaum) {
        b.reife += dt / RULES.baumReifeSekunden;
        if (b.reife >= 1) { b.reife = 0; b.stufen++; }
      }
      const stufe = RULES.scheitProBaum - b.stufen;   // 0 = voll, 2 = Stumpf
      const key = `nutzbaum-${Math.min(2, stufe)}`;
      if (this.textures.exists(key) && b.bild.texture.key !== key) b.bild.setTexture(key);
    }
  }

  /** Sucht Nussa den nächsten Baum, der noch etwas hergibt. */
  suchebaum(a) {
    let best = null, bestD = Infinity;
    for (const b of this.baeume) {
      if (b.stufen <= 0 || b.belegt) continue;
      const d = Phaser.Math.Distance.Between(HOLZWEG.from.x, HOLZWEG.from.y, b.x, b.y);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (!best) return false;
    best.belegt = a.id;
    a.baum = best.index;
    return true;
  }

  /**
   * Nussa läuft dieselbe Bahn wie die Biber, nur auf dem Holzweg: hin zum
   * Baum, fällen, zurück zur Verladestation. Sie belegt dort dieselben
   * Kistenplätze wie die Beerenkisten – daraus entsteht die eigentliche
   * Verzahnung der beiden Ketten.
   */
  laufeNussa(dt) {
    const a = this.nussa;
    a.bild.setVisible(true);
    const strecke = Phaser.Math.Distance.Between(
      HOLZWEG.from.x, HOLZWEG.from.y, HOLZWEG.to.x, HOLZWEG.to.y);
    const tempo = (RULES.walkSpeed / strecke) * dt;
    const baum = a.baum != null ? this.baeume[a.baum] : null;
    const nahStrecke = baum
      ? Math.max(1, Phaser.Math.Distance.Between(HOLZWEG.from.x, HOLZWEG.from.y, baum.x, baum.y))
      : 1;

    if (a.phase === "hin") {
      a.fortschritt = Math.max(0, a.fortschritt - tempo);
      if (a.fortschritt === 0) a.phase = "sucht";
    } else if (a.phase === "sucht") {
      if (this.suchebaum(a)) { a.phase = "annaehern"; a.nah = 0; }
      else state.stau.wald = true;
    } else if (a.phase === "annaehern") {
      a.nah = Math.min(1, a.nah + (RULES.walkSpeed / nahStrecke) * dt);
      if (a.nah === 1) { a.phase = "faellen"; a.timer = RULES.faellSekunden; }
    } else if (a.phase === "faellen") {
      a.timer -= dt;
      if (a.timer <= 0) {
        if (baum) { baum.stufen--; baum.reife = 0; baum.belegt = null; }
        a.baum = null;
        a.traegt = true;
        a.phase = "entfernen";
        this.funken.emitParticleAt(a.bild.x, a.bild.y - 20, 5);
      }
    } else if (a.phase === "entfernen") {
      a.nah = Math.max(0, a.nah - (RULES.walkSpeed / Math.max(1, a.letzteNah)) * dt);
      if (a.nah === 0) a.phase = "zurueck";
    } else if (a.phase === "zurueck") {
      a.fortschritt = Math.min(1, a.fortschritt + tempo);
      if (a.fortschritt === 1) { a.phase = "abgeben"; a.timer = RULES.dropSeconds; }
    } else if (a.phase === "abgeben") {
      a.timer -= dt;
      if (a.timer <= 0) {
        if (state.kisten + state.scheite < kistenPlaetze()) {
          state.scheite++;
          a.blockiert = false;
          a.traegt = false;
          a.phase = "hin";
          this.aktualisiereStation();
          bus.emit("aendert");
        } else {
          a.blockiert = true;
          a.timer = 0.3;
        }
      }
    }
    if (baum) a.letzteNah = nahStrecke;

    const wx = HOLZWEG.from.x + (HOLZWEG.to.x - HOLZWEG.from.x) * a.fortschritt;
    const wy = HOLZWEG.from.y + (HOLZWEG.to.y - HOLZWEG.from.y) * a.fortschritt;
    if (baum) { a.zielX = baum.x; a.zielY = baum.y; }
    const zx = baum ? baum.x : a.zielX || wx;
    const zy = baum ? baum.y : a.zielY || wy;
    const x = wx + (zx - wx) * a.nah;
    const y = wy + (zy - wy) * a.nah;

    const laeuft = ["hin", "zurueck", "annaehern", "entfernen"].includes(a.phase);
    const bild = (laeuft || a.phase === "faellen") ? Math.floor(this.time.now / 150) % 4 : 0;
    let reihe;
    if (a.phase === "faellen") reihe = "eich-arbeit-";
    else if (a.traegt) reihe = "eich-carry-";
    else if (a.phase === "hin" || a.phase === "annaehern") reihe = "eich-hinten-";
    else reihe = "eich-rechts-";
    let key = reihe + bild;
    if (!this.textures.exists(key)) key = this.textures.exists(`eich-${bild}`) ? `eich-${bild}` : "eich-0";
    a.bild.setTexture(key);
    a.bild.setPosition(x, y);
    a.bild.setDepth(10 + y);
    const imSprite = this.textures.exists("eich-carry-0");
    a.last.setVisible(a.traegt && !imSprite);
    if (a.last.visible) a.last.setPosition(x + 6, y - 4).setDepth(11 + y);
  }

  /**
   * Die Werkstatt macht aus einem Scheit ein Brett.
   *
   * Sie ist die zweite Engstelle der Holzkette: Kommt kein Nachschub, steht
   * sie still; kommt zu viel, läuft der Holzstapel über und der Wagen kann
   * nicht abladen.
   */
  arbeiteWerkstatt(dt) {
    state.stau.werk = false;
    if (!werkstattSteht()) return;
    if (state.werkHolz <= 0) { state.stau.werk = this.werkLeerSeit > 2; this.werkLeerSeit = (this.werkLeerSeit || 0) + dt; return; }
    this.werkLeerSeit = 0;
    this.werkTimer = (this.werkTimer || 0) + dt;
    if (this.werkTimer >= brettSekunden()) {
      this.werkTimer = 0;
      state.werkHolz--;
      state.bretter++;
      this.aktualisiereWerkstatt();
      this.funken.emitParticleAt(PLACES.werkstatt.x, PLACES.werkstatt.y - 30, 6);
      bus.emit("aendert");
    }
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
    if (state.stau.werk) {
      melde("Die Werkbank steht still – es kommt kein Holz an");
      return;
    }
    if (state.stau.wald) {
      melde("Alle Nutzbäume sind abgeerntet – Nussa wartet");
      return;
    }
    if (state.stau.beet) {
      const wartend = this.arbeiter.filter((a) => a.phase === "sucht");
      const namen = wartend.map((a) => a.name).join(" und ");
      melde(`Das Beet ist abgeerntet – ${namen} ${wartend.length > 1 ? "warten" : "wartet"}`);
      return;
    }
    if (this.fahrt.phase === "hin") { melde("Der Wurzelwagen fährt zum Vorratsstand"); return; }
    if (this.fahrt.phase === "abladen") { melde("Ankunft – die Kisten wandern ins Regal"); return; }
    if (this.fahrt.phase === "zurueck") { melde("Der Wurzelwagen kehrt zur Verladestation zurück"); return; }
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
