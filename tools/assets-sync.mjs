/**
 * Spiegelt gelieferte Tilesets nach public/, damit Vite sie ausliefert.
 * Kanonischer Ort bleibt assets/tilesets/ – so wie im Auftrag beschrieben.
 */
import { cpSync, existsSync, rmSync } from "node:fs";

const quelle = "assets/tilesets";
const ziel = "public/assets/tilesets";

if (!existsSync(quelle)) {
  console.log("Keine Tilesets vorhanden – nichts zu spiegeln.");
  process.exit(0);
}
rmSync(ziel, { recursive: true, force: true });
cpSync(quelle, ziel, { recursive: true, filter: (p) => !p.endsWith(".md") && !p.endsWith(".txt") || p === quelle });
console.log(`Tilesets gespiegelt: ${quelle} → ${ziel}`);
