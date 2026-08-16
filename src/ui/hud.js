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
/* Die Leiste war eine graue Balken über dem Bild und wirkte, als gehöre sie
   zur Webseite statt zum Spiel. Jetzt ist sie eine Holztafel mit demselben
   Rahmen wie die Gebäude, schwebt frei in der Ecke und trägt zu jedem Wert
   ein gezeichnetes Zeichen – Beere, Kiste, Wagen, Blüte. */
#ui .leiste {
  position: absolute; top: 12px; left: 12px;
  display: flex; align-items: stretch;
  background: linear-gradient(#221a12, #17110c);
  border: 2px solid #6b4f33;
  box-shadow: 0 0 0 2px #16100b, 3px 3px 0 rgba(0,0,0,.4);
}
#ui .wert {
  padding: 7px 13px 6px; border-right: 2px solid #3a2a1c;
  display: flex; align-items: center; gap: 9px;
}
#ui .wert:last-child { border-right: 0; }
#ui .wert svg { width: 17px; height: 17px; flex: none; display: block; }
#ui .wert .zahl { display: grid; gap: 1px; }
#ui .wert b {
  font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums;
  line-height: 1; color: #ecdfba;
}
#ui .wert.gold b { color: #f0b84a; }
#ui .wert span {
  font-size: 8px; letter-spacing: .14em; text-transform: uppercase; color: #8d7a5c;
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
/* Ohne diese Fläche landeten Klicks neben dem Panel auf der Leinwand – man
   wollte einen Ausbau kaufen und öffnete stattdessen die Verladestation. */
#ui .abdeckung {
  position: absolute; inset: 0; pointer-events: none;
  background: rgba(6,12,8,0);
  transition: background .18s;
}
#ui .abdeckung.an { pointer-events: auto; background: rgba(6,12,8,.5); }

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
  // Die Zeichen sind bewusst gezeichnet und nicht als Emoji gesetzt: Sie
  // sollen dieselben Kanten und Farben haben wie die Pixelwelt darunter.
  const beere = `<svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 2h2v3H6z" fill="#3E6440"/>
      <circle cx="8" cy="10" r="5" fill="#F0885E"/>
      <circle cx="8" cy="10" r="3.4" fill="#FFD05C"/>
      <circle cx="6.6" cy="8.6" r="1.2" fill="#FFF2C0"/></svg>`;
  const kiste = `<svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" fill="#8A6942" stroke="#453017" stroke-width="1.4"/>
      <path d="M2.6 4.6l10.8 7.8M13.4 4.6L2.6 12.4" stroke="#6B4F33" stroke-width="1.2"/></svg>`;
  const wagen = `<svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="4" width="12" height="6" fill="#8A6942" stroke="#453017" stroke-width="1.4"/>
      <circle cx="5" cy="12.4" r="2" fill="#453017"/><circle cx="11" cy="12.4" r="2" fill="#453017"/>
      <circle cx="5" cy="12.4" r=".8" fill="#B5A177"/><circle cx="11" cy="12.4" r=".8" fill="#B5A177"/></svg>`;
  const bluete = `<svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M7 8h2v7H7z" fill="#3E6440"/>
      <circle cx="8" cy="5.5" r="4.2" fill="#F5E9C0" stroke="#453017" stroke-width="1.2"/>
      <circle cx="8" cy="5.5" r="1.7" fill="#F0885E"/></svg>`;

  wurzel.innerHTML = `
    <div class="leiste">
      <div class="wert gold">${beere}<div class="zahl"><b id="w-beeren">0</b><span>Glühbeeren</span></div></div>
      <div class="wert">${kiste}<div class="zahl"><b id="w-kisten">0</b><span>Station</span></div></div>
      <div class="wert">${wagen}<div class="zahl"><b id="w-wagen">0</b><span>im Wagen</span></div></div>
      <div class="wert">${bluete}<div class="zahl"><b id="w-lief">0</b><span>Lieferungen</span></div></div>
    </div>
    <div class="hinweis">Fahre über die Lichtung – was leuchtet, lässt sich anklicken.</div>
    <div class="status" id="status">…</div>
    <div class="abdeckung" id="abdeckung"></div>
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
    abdeckung: document.getElementById("abdeckung"),
    titel: document.getElementById("panel-titel"),
    inhalt: document.getElementById("panel-inhalt"),
    ausbau: document.getElementById("panel-ausbau")
  };

  document.getElementById("panel-zu").addEventListener("click", schliesse);
  el.abdeckung.addEventListener("click", schliesse);
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
  el.abdeckung.classList.remove("an");
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
  el.abdeckung.classList.add("an");
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
