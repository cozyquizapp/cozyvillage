/**
 * Die abgeleiteten Regeln der Wirtschaft.
 *
 * Bewusst ohne Phaser und ohne Spielzustand: Alles hier ist eine reine
 * Funktion der gebauten Ausbauten. Dadurch kann `tools/pruefe-wirtschaft.mjs`
 * dieselben Zahlen rechnen wie das Spiel selbst.
 *
 * Genau das fehlte, als das Spiel bei 72 Glühbeeren stehen blieb: Der Prüfer
 * hätte es gefunden, aber er hätte seine eigene Kopie der Formeln gebraucht —
 * und zwei Kopien laufen auseinander.
 */

import { RULES, ARBEITER, BEET_PLAETZE } from "./config.js";

const gebaut = (a, id) => !!(a && a[id]);

/** Was der Wurzelwagen pro Fahrt mitnimmt. */
export function wagenKapazitaet(a) {
  return kistenPlaetze(a);
}

/** Glühbeeren in einer Kiste. */
export function beerenProKiste(a) {
  return gebaut(a, "grossbehaelter") ? 9 : RULES.berriesPerCrate;
}

/**
 * Kisten, die ins Regal des Vorratsstands passen.
 *
 * Die Grundstufe fasst genau so viele, wie das gelieferte Regal Fächer hat:
 * drei Bretter à fünf Plätze.
 */
export function regalPlaetze(a) {
  return gebaut(a, "lagerschuppen") ? 36 : gebaut(a, "regalreihe") ? 24 : 15;
}

/**
 * Der Vorrat ist genau so groß, wie das Regal Kisten fasst. Läuft er über,
 * kann der Wagen nicht abladen – und die Kette steht still, bis Cozywolf
 * etwas ausbaut. Ausgeben ist damit das Ventil.
 *
 * Deshalb muss an jeder Stelle des Ausbaubaums gelten:
 * `kosten(nächster Ausbau) ≤ lagerKapazitaet()`. Sonst wird aus dem Ventil
 * eine Falle. `tools/pruefe-wirtschaft.mjs` prüft das.
 */
export function lagerKapazitaet(a) {
  return regalPlaetze(a) * beerenProKiste(a);
}

/** Aktive Büsche im Beet. */
export function beetBuesche(a) {
  const n = gebaut(a, "beetdrei") ? 15 : gebaut(a, "beetzwei") ? 10 : 6;
  return Math.min(n, BEET_PLAETZE.length);
}

/** Sekunden, bis ein abgeernteter Busch wieder trägt. */
export function reifeSekunden(a) {
  return gebaut(a, "bewaesserung") ? 7 : RULES.reifeSekunden;
}

/** Tiere, die gerade auf dem Weg arbeiten. */
export function arbeiterZahl(a) {
  let n = 1;
  if (gebaut(a, "pfote2")) n++;
  if (gebaut(a, "pfote3")) n++;
  if (gebaut(a, "pfote4")) n++;
  return Math.min(n, ARBEITER.length);
}

/* --------------------------------------------------------------- *
 * Holzkette
 * --------------------------------------------------------------- */

/** Steht die Werkstatt? Erst dann gibt es Holz, Nussa und Bretter. */
export function werkstattSteht(a) {
  return gebaut(a, "werkstatt");
}

/** Scheite, die im Holzstapel der Werkstatt warten können. */
export function holzstapel(a) {
  return gebaut(a, "saege") ? 10 : RULES.holzstapel;
}

/** Sekunden, die die Werkstatt für ein Brett braucht. */
export function brettSekunden(a) {
  return gebaut(a, "saege") ? 3.5 : RULES.brettSekunden;
}

/* --------------------------------------------------------------- *
 * Küche
 * --------------------------------------------------------------- */

/** Steht die Küche? Erst dann fährt der Wagen Beeren aus dem Lager. */
export function kuecheSteht(a) {
  return gebaut(a, "kueche");
}

/** Glühbeeren, die im Vorratskorb der Küche warten können. */
export function kuechenkorb(a) {
  return gebaut(a, "grosserkessel") ? 40 : RULES.kuechenkorb;
}

/** Sekunden für ein Glas Marmelade. */
export function glasSekunden(a) {
  return gebaut(a, "grosserkessel") ? 5 : RULES.glasSekunden;
}

/** Wagen auf der Strecke. */
export function wagenZahl(a) {
  return gebaut(a, "zweiterwagen") ? 2 : 1;
}

export function wagenTempo(a) {
  return RULES.cartSpeed * (gebaut(a, "schnellschiene") ? 1.6 : 1);
}

/** Kistenplätze an der Verladestation insgesamt. */
export function kistenPlaetze(a) {
  return gebaut(a, "verladehof") ? 6 : gebaut(a, "wagenlager") ? 4 : 2;
}

/**
 * Plätze für eine einzelne Ware.
 *
 * Solange nur Glühbeeren ankommen, gehört die ganze Station ihnen. Sobald die
 * Werkstatt steht, bekommt jede Ware ihre eigene Hälfte.
 *
 * Ohne diese Teilung verhungert die Holzkette zwangsläufig: Zwei Biber füllen
 * die Station schneller mit Kisten, als der Wagen sie leert, und das
 * Eichhörnchen findet nie einen freien Platz für seinen Scheit. Kein Holz,
 * keine Bretter, keine Küche – und für die spielende Person sieht es aus wie
 * ein Stillstand ohne Grund. Genau das ist im Spieltest passiert.
 */
export function plaetzeFuer(a, ware) {
  const gesamt = kistenPlaetze(a);
  if (!werkstattSteht(a)) return ware === "beeren" ? gesamt : 0;
  const holz = Math.max(1, Math.floor(gesamt / 2));
  return ware === "holz" ? holz : gesamt - holz;
}
