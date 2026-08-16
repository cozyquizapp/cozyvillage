/**
 * Das Gleisnetz als Graph.
 *
 * Bisher war die Strecke fünf Zahlen: `{ y, from, to, home, dock }`. Damit
 * fährt genau ein Wagen genau eine Gerade, und der Wagen *war* sein Sprite –
 * seine Position stand in `bild.x`. Weichen, Ringe oder ein zweiter Wagen
 * ließen sich daran nicht anbauen.
 *
 * Hier steht stattdessen ein richtiger Graph: benannte Knoten mit Weltkoordi-
 * naten, Kanten dazwischen, und ein kürzester Weg von jedem Knoten zu jedem
 * anderen. Für die eine Strecke von heute ist das Übermaß. Für die acht
 * Speichen und den Außenring von morgen ist es die Grundlage, und es ist der
 * einzige Teil, der sich später nicht nachrüsten lässt, ohne alles darüber
 * noch einmal anzufassen.
 *
 * Der Graph kennt keine Sprites. Er weiß, wo etwas liegt und wie man
 * hinkommt – nicht, wie es aussieht.
 */

export const KNOTENART = {
  HALT: "halt",           // hier hält ein Wagen und lädt
  DURCH: "durch",         // reine Streckenführung
  ENDE: "ende"            // Streckenende, bekommt einen Prellbock
};

export class Gleisnetz {
  constructor() {
    /** @type {Map<string, {id, x, y, art, kanten: string[]}>} */
    this.knoten = new Map();
    /** @type {Map<string, {a, b, laenge, belegtVon}>} */
    this.kanten = new Map();
  }

  /* ----------------------------------------------------------- *
   * Aufbau
   * ----------------------------------------------------------- */

  setzeKnoten(id, x, y, art = KNOTENART.DURCH) {
    this.knoten.set(id, { id, x, y, art, kanten: [] });
    return this;
  }

  /** Kantenschlüssel ist richtungsunabhängig, damit A→B und B→A dieselbe Kante sind. */
  static schluessel(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  verbinde(a, b) {
    const ka = this.knoten.get(a), kb = this.knoten.get(b);
    if (!ka || !kb) throw new Error(`Unbekannter Knoten in Kante ${a}–${b}`);
    const key = Gleisnetz.schluessel(a, b);
    if (this.kanten.has(key)) return this;
    this.kanten.set(key, {
      a, b,
      laenge: Math.hypot(kb.x - ka.x, kb.y - ka.y),
      belegtVon: null
    });
    ka.kanten.push(b);
    kb.kanten.push(a);
    return this;
  }

  kante(a, b) {
    return this.kanten.get(Gleisnetz.schluessel(a, b)) || null;
  }

  /** Alle Kanten als Paare – für den Zeichner. */
  alleKanten() {
    return [...this.kanten.values()].map((k) => ({
      von: this.knoten.get(k.a),
      nach: this.knoten.get(k.b),
      laenge: k.laenge
    }));
  }

  /* ----------------------------------------------------------- *
   * Wegfindung
   * ----------------------------------------------------------- */

  /**
   * Kürzester Weg als Knotenliste, Start eingeschlossen.
   *
   * Dijkstra über die Kantenlängen. Bei sechs Knoten wäre eine Breitensuche
   * genug; mit acht Speichen und einem Außenring sind die Kanten aber
   * unterschiedlich lang, und dann ist "am wenigsten Stationen" nicht
   * dasselbe wie "am schnellsten dort".
   */
  route(vonId, nachId) {
    if (vonId === nachId) return [vonId];
    if (!this.knoten.has(vonId) || !this.knoten.has(nachId)) return null;

    const abstand = new Map([[vonId, 0]]);
    const vorgaenger = new Map();
    const offen = new Set(this.knoten.keys());

    while (offen.size) {
      let aktuell = null, bester = Infinity;
      for (const id of offen) {
        const d = abstand.has(id) ? abstand.get(id) : Infinity;
        if (d < bester) { bester = d; aktuell = id; }
      }
      if (aktuell === null) break;          // Rest ist nicht erreichbar
      if (aktuell === nachId) break;
      offen.delete(aktuell);

      for (const nachbar of this.knoten.get(aktuell).kanten) {
        if (!offen.has(nachbar)) continue;
        const kante = this.kante(aktuell, nachbar);
        const neu = bester + kante.laenge;
        if (neu < (abstand.has(nachbar) ? abstand.get(nachbar) : Infinity)) {
          abstand.set(nachbar, neu);
          vorgaenger.set(nachbar, aktuell);
        }
      }
    }

    if (!vorgaenger.has(nachId) && vonId !== nachId) return null;
    const weg = [nachId];
    while (weg[0] !== vonId) {
      const v = vorgaenger.get(weg[0]);
      if (v === undefined) return null;
      weg.unshift(v);
    }
    return weg;
  }

  /* ----------------------------------------------------------- *
   * Belegung
   * ----------------------------------------------------------- *
   *
   * Eine Kante trägt zunächst genau einen Wagen. Das ist absichtlich streng:
   * Zwei Wagen, die sich gegenseitig blockieren, sehen für die spielende
   * Person nicht nach einem interessanten Stau aus, sondern nach einem
   * kaputten Spiel. Lieber später lockern als früh Verklemmungen einbauen.
   */

  istFrei(a, b, wagenId) {
    const k = this.kante(a, b);
    return !!k && (k.belegtVon === null || k.belegtVon === wagenId);
  }

  belege(a, b, wagenId) {
    const k = this.kante(a, b);
    if (!k) return false;
    if (k.belegtVon !== null && k.belegtVon !== wagenId) return false;
    k.belegtVon = wagenId;
    return true;
  }

  gibFrei(a, b, wagenId) {
    const k = this.kante(a, b);
    if (k && k.belegtVon === wagenId) k.belegtVon = null;
  }

  /** Alle Belegungen eines Wagens lösen – etwa beim Zurücksetzen. */
  raeume(wagenId) {
    for (const k of this.kanten.values()) {
      if (k.belegtVon === wagenId) k.belegtVon = null;
    }
  }
}

/** Baut ein Netz aus einer Beschreibung. */
export function baueNetz(plan) {
  const netz = new Gleisnetz();
  for (const k of plan.knoten) netz.setzeKnoten(k.id, k.x, k.y, k.art);
  for (const [a, b] of plan.kanten) netz.verbinde(a, b);
  return netz;
}
