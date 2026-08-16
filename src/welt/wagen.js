/**
 * Ein Wurzelwagen als Modell.
 *
 * Vorher stand die Wahrheit im Sprite: `bild.x += tempo * dt`. Ein Wagen
 * außerhalb des Bildes konnte deshalb nicht existieren – er *war* sein Bild.
 * Hier hat er eine Route, eine Kante und einen Fortschritt darauf. Ob ihn
 * gerade jemand zeichnet, ist ihm gleich; das ist die Voraussetzung dafür,
 * dass später acht Bezirke weiterlaufen, während man nur einen ansieht.
 */

export class Wagen {
  /**
   * @param {import("./graph.js").Gleisnetz} netz
   * @param {string} id            eindeutig, dient auch der Kantenbelegung
   * @param {string} startKnoten
   */
  constructor(netz, id, startKnoten) {
    this.netz = netz;
    this.id = id;
    this.knoten = startKnoten;   // zuletzt erreichter Knoten
    this.route = [startKnoten];
    this.schritt = 0;            // Index des aktuellen Knotens in der Route
    this.aufKante = 0;           // 0 … 1 zwischen route[schritt] und route[schritt+1]
    this.ladung = [];
    this.wartet = false;         // Kante belegt, kann nicht weiter
  }

  get amZiel() {
    return this.schritt >= this.route.length - 1 && this.aufKante === 0;
  }

  get ziel() {
    return this.route[this.route.length - 1];
  }

  /** Setzt eine neue Route. Gibt false zurück, wenn kein Weg dorthin führt. */
  fahreZu(zielKnoten) {
    const weg = this.netz.route(this.knoten, zielKnoten);
    if (!weg) return false;
    this.netz.raeume(this.id);
    this.route = weg;
    this.schritt = 0;
    this.aufKante = 0;
    this.wartet = false;
    return true;
  }

  /**
   * Bewegt den Wagen um `tempo * dt` Pixel entlang seiner Route.
   *
   * Eine Kante wird betreten, indem sie belegt wird – ist sie besetzt,
   * bleibt der Wagen am Knoten stehen und meldet das über `wartet`. So wird
   * ein blockierter Wagen zu einem sichtbaren Stau statt zu einer
   * Verklemmung, die niemand erklären kann.
   */
  tick(dt, tempo) {
    let rest = tempo * dt;
    let sicherung = 0;

    while (rest > 0 && this.schritt < this.route.length - 1) {
      if (++sicherung > 64) break;          // niemals in einer Runde festhängen

      const a = this.route[this.schritt];
      const b = this.route[this.schritt + 1];

      if (this.aufKante === 0 && !this.netz.belege(a, b, this.id)) {
        this.wartet = true;
        return;
      }
      this.wartet = false;

      const kante = this.netz.kante(a, b);
      const uebrig = (1 - this.aufKante) * kante.laenge;

      if (rest < uebrig) {
        this.aufKante += rest / kante.laenge;
        return;
      }

      // Knoten erreicht: Kante freigeben und weiterrücken
      rest -= uebrig;
      this.netz.gibFrei(a, b, this.id);
      this.schritt++;
      this.knoten = b;
      this.aufKante = 0;
    }
  }

  /** Weltposition und Fahrtrichtung, aus dem Modell berechnet. */
  position() {
    const a = this.netz.knoten.get(this.route[this.schritt]);
    const b = this.netz.knoten.get(this.route[this.schritt + 1]);
    if (!b) return { x: a.x, y: a.y, dx: 1, dy: 0 };
    const laenge = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    return {
      x: a.x + (b.x - a.x) * this.aufKante,
      y: a.y + (b.y - a.y) * this.aufKante,
      dx: (b.x - a.x) / laenge,
      dy: (b.y - a.y) / laenge
    };
  }
}
