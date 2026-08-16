/**
 * Oberfläche: Ressourcenleiste, Statuszeile und das Gebäude-Panel.
 *
 * Bewusst als HTML über der Leinwand, nicht als Pixelschrift – Fließtext
 * auf Deutsch bleibt so bei jeder Fenstergröße scharf lesbar.
 */

import { state, bus, kaufen, istKaufbar, zuruecksetzen, speichern } from "../game/state.js";
import { RULES, UPGRADES } from "../game/config.js";

const css = `
#ui {
  position: fixed; inset: 0; pointer-events: none;
  font-family: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
  color: #e6efdd;
}
#ui .leiste {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; gap: 0; align-items: stretch;
  background: rgba(14,23,18,0.92);
  border-bottom: 2px solid #3f5a44;
}
#ui .wert {
  padding: 8px 14px; border-right: 1px solid #2a3d2e;
  display: grid; gap: 2px;
}
#ui .wert b {
  font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums;
  transition: color .2s;
}
#ui .wert.gold b { color: #f0b84a; }
#ui .wert span {
  font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #8aa08c;
}
#ui .wert b.puls { animation: puls .45s ease-out; }
@keyframes puls {
  0% { transform: scale(1); color: #fff3ce; }
  35% { transform: scale(1.35); color: #fff3ce; }
  100% { transform: scale(1); }
}
#ui .status {
  position: absolute; left: 0; right: 0; bottom: 0;
  background: rgba(14,23,18,0.92); border-top: 2px solid #3f5a44;
  padding: 7px 14px; font-size: 11px; color: #b9cbb6;
}
#ui .status::before { content: "› "; color: #f0b84a; }
#ui .hinweis {
  position: absolute; right: 12px; top: 58px;
  font-size: 10px; color: #7e937f; text-align: right; line-height: 1.6;
}
#ui .panel {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: min(420px, calc(100vw - 40px));
  background: #16241b; border: 2px solid #6e8470;
  box-shadow: 6px 6px 0 rgba(0,0,0,.45);
  pointer-events: auto; display: none;
}
#ui .panel.offen { display: block; }
#ui .panel h2 {
  margin: 0; padding: 12px 16px 10px;
  font-size: 15px; letter-spacing: .04em; border-bottom: 2px solid #3f5a44;
}
#ui .panel .inhalt { padding: 14px 16px; display: grid; gap: 8px; font-size: 12px; line-height: 1.6; color: #c6d6c2; }
#ui .panel .ausbau {
  margin: 4px 16px 16px; border: 2px solid #3f5a44; padding: 12px;
  display: grid; gap: 8px;
}
#ui .panel .ausbau.gesperrt { border-style: dashed; opacity: .62; }
#ui .panel .ausbau .sperre { margin: 0; font-size: 11px; color: #8aa08c; }
#ui .panel .ausbau h3 { margin: 0; font-size: 12px; color: #f0b84a; letter-spacing: .08em; text-transform: uppercase; }
#ui .panel .ausbau p { margin: 0; font-size: 12px; line-height: 1.55; color: #c6d6c2; }
#ui .panel .ausbau ul { margin: 0; padding-left: 16px; font-size: 11px; color: #9fb59c; }
#ui .panel button {
  font: inherit; font-size: 12px; padding: 9px 14px; cursor: pointer;
  background: #f0b84a; color: #1b2620; border: 0; letter-spacing: .04em;
}
#ui .panel button:disabled { background: #3f5a44; color: #8aa08c; cursor: not-allowed; }
#ui .panel .zu {
  position: absolute; right: 10px; top: 9px; background: none; color: #8aa08c;
  border: 0; font-size: 16px; cursor: pointer; padding: 2px 6px;
}
#ui .panel .zu:hover { color: #e6efdd; }
`;

let el = {};

export function starteOberflaeche() {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const wurzel = document.createElement("div");
  wurzel.id = "ui";
  wurzel.innerHTML = `
    <div class="leiste">
      <div class="wert gold"><b id="w-beeren">0</b><span>Glühbeeren</span></div>
      <div class="wert"><b id="w-kisten">0</b><span>Kisten · Station</span></div>
      <div class="wert"><b id="w-wagen">0</b><span>Ladung · Wagen</span></div>
      <div class="wert"><b id="w-lief">0</b><span>Lieferungen</span></div>
    </div>
    <div class="hinweis">Klicke auf ein Gebäude.<br>Die Welt arbeitet von selbst weiter.</div>
    <div class="status" id="status">…</div>
    <div class="panel" id="panel">
      <button class="zu" id="panel-zu" aria-label="Schließen">×</button>
      <h2 id="panel-titel"></h2>
      <div class="inhalt" id="panel-inhalt"></div>
      <div id="panel-ausbau"></div>
    </div>`;
  document.body.appendChild(wurzel);

  el = {
    beeren: document.getElementById("w-beeren"),
    kisten: document.getElementById("w-kisten"),
    wagen: document.getElementById("w-wagen"),
    lief: document.getElementById("w-lief"),
    status: document.getElementById("status"),
    panel: document.getElementById("panel"),
    titel: document.getElementById("panel-titel"),
    inhalt: document.getElementById("panel-inhalt"),
    ausbau: document.getElementById("panel-ausbau")
  };

  document.getElementById("panel-zu").addEventListener("click", schliesse);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") schliesse(); });

  bus.on("aendert", zeichne);
  bus.on("meldung", (t) => { el.status.textContent = t; });
  bus.on("oeffne", oeffne);
  zeichne();
}

function puls(node) {
  node.classList.remove("puls");
  void node.offsetWidth;
  node.classList.add("puls");
}

let letzteBeeren = -1;
function zeichne() {
  if (state.beeren !== letzteBeeren) {
    el.beeren.textContent = state.beeren;
    if (letzteBeeren >= 0 && state.beeren > letzteBeeren) puls(el.beeren);
    letzteBeeren = state.beeren;
  }
  el.kisten.textContent = state.kisten;
  el.wagen.textContent = state.wagenLadung;
  el.lief.textContent = state.lieferungen;
  for (const id of offeneAusbauten) setzeKnopf(id);
}

/** Welche Ausbauknöpfe im Panel gerade stehen – für die laufende Aktualisierung. */
let offeneAusbauten = [];

function schliesse() {
  el.panel.classList.remove("offen");
  offeneAusbauten = [];
}

function oeffne(daten) {
  el.titel.textContent = daten.titel;
  el.inhalt.innerHTML = daten.zeilen.map((z) => `<div>${z}</div>`).join("");
  el.ausbau.innerHTML = "";
  offeneAusbauten = [];

  // Ein Ort kann mehrere Ausbaustufen anbieten; die nächste gesperrte steht
  // als Ausblick dabei, damit sichtbar ist, worauf man hinarbeitet.
  const liste = daten.ausbauten || (daten.ausbau ? [daten.ausbau] : []);
  for (const a of liste) {
    const block = document.createElement("div");
    block.className = "ausbau" + (a.freigeschaltet ? "" : " gesperrt");
    block.innerHTML = `
      <h3>Ausbau · ${a.name}</h3>
      <p>${a.beschreibung}</p>
      <ul>${a.wirkung.map((w) => `<li>${w}</li>`).join("")}</ul>
      ${a.freigeschaltet
        ? `<button data-kauf="${a.id}">Für ${a.kosten} Glühbeeren bauen</button>`
        : `<p class="sperre">${a.hinweis}</p>`}`;
    el.ausbau.appendChild(block);
    if (a.freigeschaltet) {
      offeneAusbauten.push(a.id);
      block.querySelector("button").addEventListener("click", () => {
        if (kaufen(a.id)) schliesse();
      });
    }
  }
  for (const id of offeneAusbauten) setzeKnopf(id);
  el.panel.classList.add("offen");
}

function setzeKnopf(id) {
  const knopf = el.ausbau.querySelector(`[data-kauf="${id}"]`);
  if (!knopf) return;
  const up = UPGRADES[id];
  const moeglich = istKaufbar(id);
  knopf.disabled = !moeglich;
  knopf.textContent = moeglich
    ? `Für ${up.cost} Glühbeeren bauen`
    : `Noch ${up.cost - state.beeren} Glühbeeren nötig`;
}

// Für die Konsole, damit man den Slice von vorn spielen kann.
window.fellgrund = {
  zuruecksetzen() { zuruecksetzen(); location.reload(); },
  speichern,
  state,
  RULES
};
