/**
 * Zeichen-Grundlagen für alle Platzhaltertexturen.
 *
 * Diese Datei ist die einzige Stelle, an der Grafik entsteht. Sobald ein
 * fertiges Tileset im Projekt liegt, wird sie durch echte Bilddateien
 * ersetzt – der Rest des Spiels kennt nur Texturschlüssel und ändert sich nicht.
 */

// Licht kommt in ganz Fellgrund von oben links.
export const PAL = {
  ink: "#181016",

  sky1: "#141E33", sky2: "#1B2740",
  forestDeep: "#0D1811", forest: "#152B1C", forestLt: "#1D3A26",

  grassHi: "#79AC63", grassLt: "#5D9153", grass: "#487646",
  grassDk: "#37603C", grassSh: "#284833",

  soilHi: "#8A6942", soil: "#6B4F33", soilDk: "#453017",
  pathHi: "#B5A177", path: "#9A8862", pathDk: "#6E6046",

  woodHi: "#D2A468", woodLt: "#BC8F55", wood: "#96693C",
  woodDk: "#5E4227",

  roofHi: "#C9765A", roof: "#A85440", roofDk: "#7A3A2B",

  leafHi: "#77BE6D", leaf: "#4E9455", leafDk: "#357045", leafOut: "#1F4028",
  trunk: "#7E5734", trunkDk: "#4C331D",

  berry: "#FFD05C", berryHi: "#FFF2C0", lamp: "#FFDC96",
  waterHi: "#93CFE0", waterLt: "#4E93A8", water: "#31708C", waterDk: "#204C60",
  rail: "#8A7758", railHi: "#B49874", tie: "#5A4630", ballast: "#3A5340",
  stone: "#98A08B", stoneDk: "#66705A"
};

/** Ein Rechteck in Spielpixeln. */
export function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Ein Kreis am Boden erscheint in der Schrägsicht gestaucht. */
export function ellipse(ctx, color, cx, cy, rx, ry, fromDy, toDy) {
  rx = Math.max(1, Math.round(rx));
  ry = Math.max(1, Math.round(ry));
  const a = fromDy === undefined ? -ry : Math.max(-ry, fromDy);
  const b = toDy === undefined ? ry : Math.min(ry, toDy);
  for (let dy = a; dy <= b; dy++) {
    const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
    if (hw > 0) rect(ctx, color, cx - hw, cy + dy, hw * 2, 1);
  }
}

/** Schlagschatten – der Grund, warum ein Objekt am Boden steht statt zu schweben. */
export function shadow(ctx, cx, cy, rx, ry, alpha = 0.34) {
  ellipse(ctx, `rgba(12,26,20,${alpha})`, cx, cy, rx, ry);
}

/**
 * Zeichnet ein Zeichenraster: ein Zeichen ist ein Pixel, "." ist durchsichtig.
 * Mit `span` wird die Zeile zusätzlich gespiegelt – so bleiben symmetrische
 * Figuren über alle Frames pixelgenau identisch.
 */
export function drawChars(ctx, rows, pal, ox = 0, oy = 0, span = 0) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      const color = pal[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
      if (span) ctx.fillRect(ox + span - 1 - x, oy + y, 1, 1);
    }
  }
}

/** Deterministischer Zufall, damit die Welt bei jedem Start gleich aussieht. */
export function makeRandom(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
