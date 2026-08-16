/**
 * Spielzustand und Ereignisse.
 *
 * Die Welt arbeitet selbstständig weiter; die Person entscheidet nur,
 * was als Nächstes ausgebaut wird. Alles, was die Oberfläche wissen muss,
 * läuft über `bus`.
 *
 * Keine Leistungszahl steht fest im Code – jede wird aus den gebauten
 * Ausbauten abgeleitet. Ein neuer Ausbau ändert damit die Regeln der Welt,
 * nicht bloß einen Zähler.
 */

import Phaser from "phaser";
import { SAVE_KEY, UPGRADES } from "./config.js";
import * as W from "./wirtschaft.js";

export const bus = new Phaser.Events.EventEmitter();

function leereAusbauten() {
  const o = {};
  for (const id of Object.keys(UPGRADES)) o[id] = false;
  return o;
}

export const state = {
  beeren: 0,
  kisten: 0,
  /* Holzkette: Scheite warten an der Station, Holz liegt im Stapel der
     Werkstatt, Bretter sind das fertige Ergebnis und die zweite Währung. */
  scheite: 0,
  werkHolz: 0,
  bretter: 0,
  /* Küche: Beeren im Vorratskorb, fertige Marmelade als dritte Währung. */
  kuechenBeeren: 0,
  marmelade: 0,
  /** Ladung je Wagen, als Liste – seit dem zweiten Wagen kann es mehr als eine geben. */
  wagenLadung: 0,
  wagenArt: "beeren",
  lieferungen: 0,
  ausbauten: leereAusbauten(),
  /** Wo die Kette gerade klemmt. Wird jeden Bild neu bestimmt. */
  stau: { beet: false, station: false, lager: false, wald: false, werk: false, kueche: false },
  meldung: "Bramble macht sich auf den Weg zum Glühbeerenbeet"
};

/* --------------------------------------------------------------- *
 * Abgeleitete Regeln
 * --------------------------------------------------------------- *
 *
 * Die Formeln stehen in `wirtschaft.js` und kennen nur die gebauten
 * Ausbauten – keinen Spielzustand, kein Phaser. Nur so kann
 * `tools/pruefe-wirtschaft.mjs` mit denselben Zahlen rechnen wie das Spiel.
 * Hier werden sie an den laufenden Zustand gebunden.
 */

export const kistenPlaetze     = () => W.kistenPlaetze(state.ausbauten);
export const wagenKapazitaet   = () => W.wagenKapazitaet(state.ausbauten);
export const beerenProKiste    = () => W.beerenProKiste(state.ausbauten);
export const regalPlaetze      = () => W.regalPlaetze(state.ausbauten);
export const lagerKapazitaet   = () => W.lagerKapazitaet(state.ausbauten);
export const beetBuesche       = () => W.beetBuesche(state.ausbauten);
export const reifeSekunden     = () => W.reifeSekunden(state.ausbauten);
export const arbeiterZahl      = () => W.arbeiterZahl(state.ausbauten);
export const wagenTempo        = () => W.wagenTempo(state.ausbauten);
export const werkstattSteht    = () => W.werkstattSteht(state.ausbauten);
export const holzstapel        = () => W.holzstapel(state.ausbauten);
export const brettSekunden     = () => W.brettSekunden(state.ausbauten);
export const wagenZahl         = () => W.wagenZahl(state.ausbauten);
export const kuecheSteht       = () => W.kuecheSteht(state.ausbauten);
export const kuechenkorb       = () => W.kuechenkorb(state.ausbauten);
export const glasSekunden      = () => W.glasSekunden(state.ausbauten);

/* --------------------------------------------------------------- *
 * Ausbauten
 * --------------------------------------------------------------- */

/** Ein Ausbau ist erst sichtbar, wenn die Kette ihn verdient hat. */
export function istFreigeschaltet(id) {
  const up = UPGRADES[id];
  return !!up && state.lieferungen >= up.unlockAfterDeliveries;
}

export function istKaufbar(id) {
  const up = UPGRADES[id];
  if (!up || state.ausbauten[id] || !istFreigeschaltet(id)) return false;
  return state.beeren >= up.cost
    && state.bretter >= (up.bretter || 0)
    && state.marmelade >= (up.marmelade || 0);
}

export function kaufen(id) {
  if (!istKaufbar(id)) return false;
  state.beeren -= UPGRADES[id].cost;
  state.bretter -= UPGRADES[id].bretter || 0;
  state.marmelade -= UPGRADES[id].marmelade || 0;
  state.ausbauten[id] = true;
  bus.emit("ausbau", id);
  bus.emit("aendert");
  speichern();
  return true;
}

export function melde(text) {
  if (state.meldung === text) return;
  state.meldung = text;
  bus.emit("meldung", text);
}

/* --------------------------------------------------------------- *
 * Spielstand
 * --------------------------------------------------------------- */

export function speichern() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 2,
      beeren: state.beeren,
      kisten: state.kisten,
      lieferungen: state.lieferungen,
      scheite: state.scheite,
      werkHolz: state.werkHolz,
      bretter: state.bretter,
      kuechenBeeren: state.kuechenBeeren,
      marmelade: state.marmelade,
      ausbauten: state.ausbauten
    }));
  } catch (e) {
    // Ohne Speicher läuft das Spiel weiter, nur ohne Fortschritt.
  }
}

export function laden() {
  try {
    const roh = localStorage.getItem(SAVE_KEY);
    if (!roh) return false;
    const daten = JSON.parse(roh);
    state.beeren = Number(daten.beeren) || 0;
    state.lieferungen = Number(daten.lieferungen) || 0;
    state.scheite = Number(daten.scheite) || 0;
    state.werkHolz = Number(daten.werkHolz) || 0;
    state.bretter = Number(daten.bretter) || 0;
    state.kuechenBeeren = Number(daten.kuechenBeeren) || 0;
    state.marmelade = Number(daten.marmelade) || 0;
    // Alte Stände kannten nur "wagenlager"; unbekannte Schlüssel fallen weg.
    state.ausbauten = leereAusbauten();
    for (const id of Object.keys(state.ausbauten)) {
      if (daten.ausbauten && daten.ausbauten[id]) state.ausbauten[id] = true;
    }
    state.kisten = Math.min(Number(daten.kisten) || 0, kistenPlaetze());
    state.beeren = Math.min(state.beeren, lagerKapazitaet());
    return true;
  } catch (e) {
    return false;
  }
}

export function zuruecksetzen() {
  state.beeren = 0;
  state.kisten = 0;
  state.scheite = 0;
  state.werkHolz = 0;
  state.bretter = 0;
  state.kuechenBeeren = 0;
  state.marmelade = 0;
  state.wagenLadung = 0;
  state.lieferungen = 0;
  state.ausbauten = leereAusbauten();
  state.stau = { beet: false, station: false, lager: false, wald: false, werk: false, kueche: false };
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* egal */ }
}
