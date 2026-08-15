/**
 * Spielzustand und Ereignisse.
 *
 * Die Welt arbeitet selbstständig weiter; die Person entscheidet nur,
 * was als Nächstes ausgebaut wird. Alles, was die Oberfläche wissen muss,
 * läuft über `bus`.
 */

import Phaser from "phaser";
import { SAVE_KEY, UPGRADES } from "./config.js";

export const bus = new Phaser.Events.EventEmitter();

export const state = {
  beeren: 0,
  kisten: 0,
  wagenLadung: 0,
  lieferungen: 0,
  ausbauten: { wagenlager: false },
  meldung: "Bramble macht sich auf den Weg zum Glühbeerenbeet"
};

export function kistenPlaetze() {
  return state.ausbauten.wagenlager ? 4 : 2;
}

export function wagenKapazitaet() {
  return state.ausbauten.wagenlager ? 4 : 2;
}

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

export function speichern() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
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
    state.kisten = Math.min(Number(daten.kisten) || 0, 4);
    state.lieferungen = Number(daten.lieferungen) || 0;
    state.ausbauten = Object.assign({ wagenlager: false }, daten.ausbauten || {});
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
  state.ausbauten = { wagenlager: false };
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* egal */ }
}
