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
import { SAVE_KEY, UPGRADES, RULES, ARBEITER, BEET_PLAETZE } from "./config.js";

export const bus = new Phaser.Events.EventEmitter();

function leereAusbauten() {
  const o = {};
  for (const id of Object.keys(UPGRADES)) o[id] = false;
  return o;
}

export const state = {
  beeren: 0,
  kisten: 0,
  wagenLadung: 0,
  lieferungen: 0,
  ausbauten: leereAusbauten(),
  /** Wo die Kette gerade klemmt. Wird jeden Bild neu bestimmt. */
  stau: { beet: false, station: false, lager: false },
  meldung: "Bramble macht sich auf den Weg zum Glühbeerenbeet"
};

/* --------------------------------------------------------------- *
 * Abgeleitete Regeln
 * --------------------------------------------------------------- */

const gebaut = (id) => !!state.ausbauten[id];

/** Kistenplätze an der Verladestation. Voll heißt: die Tiere warten. */
export function kistenPlaetze() {
  return gebaut("verladehof") ? 6 : gebaut("wagenlager") ? 4 : 2;
}

/** Was der Wurzelwagen pro Fahrt mitnimmt. */
export function wagenKapazitaet() {
  return kistenPlaetze();
}

/** Glühbeeren in einer Kiste. */
export function beerenProKiste() {
  return gebaut("grossbehaelter") ? 9 : RULES.berriesPerCrate;
}

/** Kisten, die ins Regal des Vorratsstands passen. */
export function regalPlaetze() {
  return gebaut("lagerschuppen") ? 32 : gebaut("regalreihe") ? 20 : 12;
}

/**
 * Der Vorrat ist genau so groß, wie das Regal Kisten fasst. Läuft er über,
 * kann der Wagen nicht abladen – und die ganze Kette steht still, bis
 * Cozywolf etwas ausbaut. Ausgeben ist damit das Ventil.
 */
export function lagerKapazitaet() {
  return regalPlaetze() * beerenProKiste();
}

/** Aktive Büsche im Beet. */
export function beetBuesche() {
  const n = gebaut("beetdrei") ? 15 : gebaut("beetzwei") ? 10 : 6;
  return Math.min(n, BEET_PLAETZE.length);
}

/** Sekunden, bis ein abgeernteter Busch wieder trägt. */
export function reifeSekunden() {
  return gebaut("bewaesserung") ? 7 : RULES.reifeSekunden;
}

/** Tiere, die gerade auf dem Weg arbeiten. */
export function arbeiterZahl() {
  let n = 1;
  if (gebaut("pfote2")) n++;
  if (gebaut("pfote3")) n++;
  if (gebaut("pfote4")) n++;
  return Math.min(n, ARBEITER.length);
}

export function wagenTempo() {
  return RULES.cartSpeed * (gebaut("schnellschiene") ? 1.6 : 1);
}

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
  return !!up && !state.ausbauten[id] && istFreigeschaltet(id) && state.beeren >= up.cost;
}

export function kaufen(id) {
  if (!istKaufbar(id)) return false;
  state.beeren -= UPGRADES[id].cost;
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
  state.wagenLadung = 0;
  state.lieferungen = 0;
  state.ausbauten = leereAusbauten();
  state.stau = { beet: false, station: false, lager: false };
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* egal */ }
}
