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

/** Kistenplätze an der Verladestation. Voll heißt: die Tiere warten. */
export function kistenPlaetze(a) {
  return gebaut(a, "verladehof") ? 6 : gebaut(a, "wagenlager") ? 4 : 2;
}

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

/** Wagen auf der Strecke. */
export function wagenZahl(a) {
  return gebaut(a, "zweiterwagen") ? 2 : 1;
}

export function wagenTempo(a) {
  return RULES.cartSpeed * (gebaut(a, "schnellschiene") ? 1.6 : 1);
}
