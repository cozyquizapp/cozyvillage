#!/usr/bin/env node
/**
 * Prüft, dass sich Fellgrund nicht selbst blockieren kann.
 *
 *   node tools/pruefe-wirtschaft.mjs
 *
 * Der Vorratsstand ist absichtlich begrenzt: Läuft er über, hält die ganze
 * Kette an, und man muss etwas ausgeben, damit es weitergeht. Ausgeben ist
 * das Ventil.
 *
 * Genau daraus entsteht aber eine Falle, in die das Spiel tatsächlich gelaufen
 * ist: Kostet der nächste Ausbau **mehr**, als der Vorratsstand überhaupt
 * fasst, kann man ihn nie bezahlen. Die Kette steht, das Lager ist voll, und
 * es gibt nichts zu kaufen — bei genau 72 Glühbeeren war Schluss.
 *
 * Diese Prüfung geht den Ausbaubaum in der Reihenfolge durch, in der man ihn
 * kaufen kann, und verlangt an jeder Stelle:
 *
 *     Kosten des nächsten Ausbaus  ≤  Fassungsvermögen des Vorratsstands
 *
 * Das ist keine Faustregel, sondern die genaue Bedingung dafür, dass ein
 * Stillstand entstehen kann.
 */

import { UPGRADES } from "../src/game/config.js";
import { lagerKapazitaet } from "../src/game/wirtschaft.js";

const alle = Object.values(UPGRADES);
const fehler = [];
const zeilen = [];

/* Reihenfolge: aufsteigend nach Freischaltung, bei Gleichstand nach Kosten.
   So kauft der Durchlauf in derselben Folge, in der die Ausbauten sichtbar
   werden. */
const folge = [...alle].sort((a, b) =>
  a.unlockAfterDeliveries - b.unlockAfterDeliveries || a.cost - b.cost);

const gekauft = {};
for (const up of folge) {
  const kapazitaet = lagerKapazitaet(gekauft);
  const passt = up.cost <= kapazitaet;
  zeilen.push({
    name: up.name,
    kosten: up.cost,
    kapazitaet,
    lieferungen: up.unlockAfterDeliveries,
    bretter: up.bretter || 0,
    marmelade: up.marmelade || 0,
    passt
  });
  if (!passt) {
    fehler.push(
      `„${up.name}" kostet ${up.cost}, der Vorratsstand fasst an dieser Stelle ` +
      `aber nur ${kapazitaet}. Sobald das Regal voll ist, steht das Spiel: ` +
      `Der Wagen kann nicht abladen, und der Ausbau, der Platz schaffen würde, ` +
      `ist unbezahlbar.`
    );
  }
  gekauft[up.id] = true;
}

/* Bretter sind die zweite Währung. Sie entstehen erst, wenn die Werkstatt
   steht – ein Ausbau, der Bretter kostet und vor ihr freigeschaltet wird,
   wäre genauso unbezahlbar wie ein zu teurer. */
for (const [wareId, feld, name] of [["werkstatt","bretter","Bretter"], ["kueche","marmelade","Marmelade"]]) {
  const quelle = UPGRADES[wareId];
  for (const up of alle) {
    if (!up[feld]) continue;
    if (!quelle || up.unlockAfterDeliveries <= quelle.unlockAfterDeliveries) {
      fehler.push(
        `„${up.name}" kostet ${up[feld]} ${name}, wird aber nach ` +
        `${up.unlockAfterDeliveries} Lieferungen sichtbar – „${quelle ? quelle.name : "die Quelle"}" ` +
        `erst nach ${quelle ? quelle.unlockAfterDeliveries : "nie"}. Bis dahin gibt es keine ${name}.`
      );
    }
  }
}
const werkAlt = UPGRADES.werkstatt;


const breite = Math.max(...zeilen.map((z) => z.name.length));
console.log("\nAusbaubaum in Kaufreihenfolge\n");
console.log(`  ${"Ausbau".padEnd(breite)}   ab Lief.   Kosten   Lager fasst`);
for (const z of zeilen) {
  console.log(
    `  ${z.passt ? "✓" : "✗"} ${z.name.padEnd(breite - 2)}   ` +
    `${String(z.lieferungen).padStart(7)}   ${String(z.kosten).padStart(6)}   ` +
    `${String(z.kapazitaet).padStart(11)}${z.bretter ? `   +${z.bretter}B` : ""}${z.marmelade ? `   +${z.marmelade}M` : ""}`
  );
}
console.log("");

if (fehler.length) {
  for (const f of fehler) console.log(`FEHLER  ${f}\n`);
  console.log(`${fehler.length} Stelle(n), an denen das Spiel stehen bleiben kann.\n`);
  process.exit(1);
}
console.log("Kein Stillstand möglich – an jeder Stelle ist der nächste Ausbau bezahlbar.\n");
