/**
 * Setzt das gelieferte Tileset auf die Texturschlüssel des Spiels.
 *
 * Die Spiellogik kennt nur Schlüssel wie "tree-0" oder "beaver-1". Hier
 * werden die Zellen aus den Blättern ausgeschnitten und unter genau diesen
 * Schlüsseln abgelegt – der Rest des Spiels merkt nichts davon.
 *
 * Blattaufbau nach assets/tilesets/fellgrund-batch1/BATCH1-INDEX.md.
 */

export const TILESET_PFAD = "assets/tilesets/fellgrund-batch1";

const BLAETTER = {
  "blatt-boden": "boden.png",
  "blatt-wege": "wege.png",
  "blatt-natur": "natur_64x96.png",
  "blatt-natur2": "natur_batch2_32.png",
  "blatt-beerenbusch": "gluehbeerenbusch_32.png",
  "blatt-rinne": "rinne_32.png",
  "blatt-station1": "verladestation_1_96x80.png",
  "blatt-station2": "verladestation_2_96x80.png",
  "blatt-station3": "verladestation_3_96x80.png",
  "blatt-vorratsstand": "vorratsstand_1_128x96.png",
  "blatt-vorratsstand2": "vorratsstand_2_128x96.png",
  "blatt-vorratsstand3": "vorratsstand_3_128x96.png",
  "blatt-wurzelwagen": "wurzelwagen_64x48.png",
  "blatt-uferkante": "uferkante_64x32.png",
  "blatt-verladepunkt": "verladepunkt_64x32.png",
  "blatt-signal": "signal_32.png",
  "blatt-dorfplatz": "dorfplatz_192x96.png",
  "blatt-platzlaterne": "platzlaterne_32x64.png",
  "blatt-nest": "nest_80x48.png",
  "blatt-nestrand": "nest_rand_vorn_80x48.png",
  "blatt-laterne": "laterne_32x64.png",
  "blatt-herzknospe": "herzknospe_32.png",
  "blatt-parzelle": "parzelle_80x48.png",
  "blatt-gueter": "gueter_64x32.png",
  "blatt-schienen": "schienen_32.png",
  "blatt-werkstatt": "werkstatt_96x80.png",
  "blatt-nutzbaum": "nutzbaum_64x96.png",
  "blatt-holz": "holzkette_64x32.png",
  "blatt-eichhorn": "bewohner_eichhoernchen.png",
  "blatt-bau-biber": "bau_biber_96x80.png",
  "blatt-kobel": "kobel_eichhorn_64x96.png",
  "blatt-eulenstange": "sitzstange_eule_64x96.png",
  "blatt-kueche": "kueche_96x80.png",
  "blatt-glas": "marmeladenglas_32.png",
  "blatt-dorfkram": "dorfkram_32.png",
  "blatt-prellbock": "prellbock_32.png",
  "blatt-bewegt": "bewegt.png",
  "blatt-uferflecken": "wasser_uferflecken.png",
  "blatt-biber": "bewohner_biber.png",
  "blatt-wolf": "cozywolf.png",
  "wald-hinten": "waldrahmen_2_hinten.png",
  "wald-vorn": "waldrahmen_2_vorn.png"
};

/**
 * Normalerweise liegen die Blätter als Dateien neben dem Spiel. Für eine
 * einzelne, überall lauffähige HTML-Fassung legt `tools/baue-artifact.mjs`
 * sie stattdessen als eingebettete Bilder unter `FELLGRUND_ASSETS` ab –
 * derselbe Ladeweg, nur ohne Server dahinter.
 */
export function ladeTileset(scene) {
  const eingebettet = globalThis.FELLGRUND_ASSETS;
  for (const [key, datei] of Object.entries(BLAETTER)) {
    const quelle = eingebettet && eingebettet[datei];
    scene.load.image(key, quelle || `${TILESET_PFAD}/${datei}`);
  }
}

/** Maße eines Blattes, oder null wenn es fehlt. */
export function masse(scene, blatt) {
  const t = scene.textures.get(blatt);
  if (!t || t.key === "__MISSING") return null;
  const bild = t.getSourceImage();
  return { w: bild.width, h: bild.height, bild };
}

/**
 * Schneidet eine Zelle aus und legt sie als eigene Textur ab.
 * Durchsichtige Ränder werden entfernt, damit der Fußpunkt stimmt –
 * die Tiefensortierung hängt daran.
 */
function zelle(scene, blatt, key, sx, sy, sw, sh, { trimmen = true } = {}) {
  const m = masse(scene, blatt);
  if (!m) return false;

  const mess = document.createElement("canvas");
  mess.width = sw;
  mess.height = sh;
  const mctx = mess.getContext("2d", { willReadFrequently: true });
  mctx.imageSmoothingEnabled = false;
  mctx.drawImage(m.bild, sx, sy, sw, sh, 0, 0, sw, sh);

  let x0 = 0, y0 = 0, x1 = sw, y1 = sh;
  if (trimmen) {
    const daten = mctx.getImageData(0, 0, sw, sh).data;
    x0 = sw; y0 = sh; x1 = 0; y1 = 0;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        if (daten[(y * sw + x) * 4 + 3] === 0) continue;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x >= x1) x1 = x + 1;
        if (y >= y1) y1 = y + 1;
      }
    }
    if (x1 <= x0 || y1 <= y0) return false;
  }

  const bw = x1 - x0, bh = y1 - y0;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const ziel = scene.textures.createCanvas(key, bw, bh);
  const zctx = ziel.getContext();
  zctx.imageSmoothingEnabled = false;
  zctx.drawImage(m.bild, sx + x0, sy + y0, bw, bh, 0, 0, bw, bh);
  ziel.refresh();
  return true;
}

export function setzeTileset(scene) {
  const ersetzt = [];
  const nimm = (blatt, key, sx, sy, sw, sh, opt) => {
    if (zelle(scene, blatt, key, sx, sy, sw, sh, opt)) ersetzt.push(key);
  };
  const ganz = (blatt, key) => {
    const m = masse(scene, blatt);
    if (m) nimm(blatt, key, 0, 0, m.w, m.h);
  };

  // natur_64x96 – zwei Bäume, dann drei Beerenstufen
  const natur = masse(scene, "blatt-natur");
  if (natur) {
    const zw = natur.w / 5, zh = natur.h;
    nimm("blatt-natur", "tree-0", 0, 0, zw, zh);
    nimm("blatt-natur", "tree-0-d", zw, 0, zw, zh);
    for (let i = 0; i < 3; i++) nimm("blatt-natur", `bush-${i}`, (2 + i) * zw, 0, zw, zh);
    for (const k of ["tree-1", "tree-2"]) nimm("blatt-natur", k, 0, 0, zw, zh);
    for (const k of ["tree-1-d", "tree-2-d"]) nimm("blatt-natur", k, zw, 0, zw, zh);
  }

  /*
   * Der Glühbeerenbusch mit vier Reifestufen: abgeerntet, knospend, halbreif,
   * reif. Bis Batch 4 lieh sich das Spiel dafür Ziersträucher aus dem
   * Naturblatt und legte einen grauen Filter darüber – die wichtigste
   * Engstelle war dadurch im Bild kaum zu sehen.
   */
  const bb = masse(scene, "blatt-beerenbusch");
  if (bb) {
    const zw = bb.w / 4;
    for (let i = 0; i < 4; i++) nimm("blatt-beerenbusch", `beere-${i}`, i * zw, 0, zw, bb.h);
  }
  const ri = masse(scene, "blatt-rinne");
  if (ri) {
    const zw = ri.w / 4;
    for (let i = 0; i < 4; i++) nimm("blatt-rinne", `rinne-${i}`, i * zw, 0, zw, ri.h);
  }

  // natur_batch2_32 – Busch A/B, Findling A/B, Baumstumpf A/B
  const n2 = masse(scene, "blatt-natur2");
  if (n2) {
    const zw = n2.w / 6, zh = n2.h;
    nimm("blatt-natur2", "shrub", 0, 0, zw, zh);
    nimm("blatt-natur2", "shrub-d", zw, 0, zw, zh);
    nimm("blatt-natur2", "rock", zw * 2, 0, zw, zh);
    nimm("blatt-natur2", "rock-b", zw * 3, 0, zw, zh);
    nimm("blatt-natur2", "stumpf", zw * 4, 0, zw, zh);
    nimm("blatt-natur2", "stumpf-b", zw * 5, 0, zw, zh);
  }

  /*
   * Füllstandsblätter statt leerer Gebäude plus gesetzter Kisten.
   *
   * Ein Regalfach ist zwanzig Pixel hoch, eine Kiste sechzehn – aber wie eine
   * Kiste im Fach *sitzt*, mit Schatten und Überschneidung, kann nur der
   * zeichnende Blick entscheiden. Deshalb liefert jede Stufe ihre Füllstände
   * mit, und das Spiel wählt nur noch die Zelle.
   */
  const stufenblatt = (blatt, praefix, zw, zh) => {
    const m = masse(scene, blatt);
    if (!m) return 0;
    const n = Math.round(m.w / zw);
    for (let i = 0; i < n; i++) nimm(blatt, `${praefix}-${i}`, i * zw, 0, zw, zh);
    return n;
  };
  stufenblatt("blatt-station1", "station-1", 96, 80);
  stufenblatt("blatt-station2", "station-2", 96, 80);
  stufenblatt("blatt-station3", "station-3", 96, 80);
  stufenblatt("blatt-vorratsstand", "store-1", 128, 96);
  stufenblatt("blatt-vorratsstand2", "store-2", 128, 96);
  stufenblatt("blatt-vorratsstand3", "store-3", 128, 96);
  stufenblatt("blatt-wurzelwagen", "wagen", 64, 48);
  stufenblatt("blatt-verladepunkt", "verladepunkt", 64, 32);
  stufenblatt("blatt-signal", "signal", 32, 32);
  stufenblatt("blatt-uferkante", "uferkante", 64, 32);
  stufenblatt("blatt-platzlaterne", "platzlaterne", 32, 64);
  ganz("blatt-dorfplatz", "dorfplatz");
  ganz("blatt-nest", "nest");
  ganz("blatt-nestrand", "nest-rim");
  ganz("blatt-parzelle", "parcel");

  // Laterne – drei Flackerstufen
  const lat = masse(scene, "blatt-laterne");
  if (lat) {
    const zw = lat.w / 3;
    for (let i = 0; i < 3; i++) nimm("blatt-laterne", `lamp-${i}`, i * zw, 0, zw, lat.h);
    nimm("blatt-laterne", "lamp", 0, 0, zw, lat.h);
  }

  // Herzknospe – vier Funkelbilder
  const hk = masse(scene, "blatt-herzknospe");
  if (hk) {
    const zw = hk.w / 4;
    for (let i = 0; i < 4; i++) nimm("blatt-herzknospe", `blossom-${i}`, i * zw, 0, zw, hk.h);
    nimm("blatt-herzknospe", "blossom", 0, 0, zw, hk.h);
  }

  // gueter_64x32 – Kiste, Schiene, Wagen A, Wagen B
  const gue = masse(scene, "blatt-gueter");
  if (gue) {
    const zw = gue.w / 4;
    nimm("blatt-gueter", "crate", 0, 0, zw, gue.h);
    nimm("blatt-gueter", "schiene", zw, 0, zw, gue.h);
    nimm("blatt-gueter", "cart", zw * 2, 0, zw, gue.h);
    nimm("blatt-gueter", "cart-b", zw * 3, 0, zw, gue.h);
  }

  // Gleissatz aus tools/zeichne-schienen.mjs: acht Netzteile, zwei Prellböcke
  const gl = masse(scene, "blatt-schienen");
  if (gl) {
    const k = gl.h;
    const namen = ["gleis-w", "gleis-s", "gleis-lo", "gleis-ro",
                   "gleis-lu", "gleis-ru", "gleis-x", "gleis-weiche"];
    namen.forEach((name, i) => nimm("blatt-schienen", name, i * k, 0, k, k, { trimmen: false }));
  }
  const pb = masse(scene, "blatt-prellbock");
  if (pb) {
    const k = pb.h;
    nimm("blatt-prellbock", "prellbock-links", 0, 0, k, k, { trimmen: false });
    nimm("blatt-prellbock", "prellbock-rechts", k, 0, k, k, { trimmen: false });
  }

  // Holzkette – Werkstatt in drei Stufen, Nutzbaum in drei Erntestufen
  const wk = masse(scene, "blatt-werkstatt");
  if (wk) {
    const zw = wk.w / 3;
    for (let i = 0; i < 3; i++) nimm("blatt-werkstatt", `werkstatt-${i}`, i * zw, 0, zw, wk.h);
  }
  const nb = masse(scene, "blatt-nutzbaum");
  if (nb) {
    const zw = nb.w / 3;
    for (let i = 0; i < 3; i++) nimm("blatt-nutzbaum", `nutzbaum-${i}`, i * zw, 0, zw, nb.h);
  }
  // holzkette_64x32: Scheit, Stapel leer/halb/voll, Bretterstapel
  const hz = masse(scene, "blatt-holz");
  if (hz) {
    const zw = hz.w / 5;
    nimm("blatt-holz", "scheit", 0, 0, zw, hz.h);
    for (let i = 0; i < 3; i++) nimm("blatt-holz", `holzstapel-${i}`, (1 + i) * zw, 0, zw, hz.h);
    nimm("blatt-holz", "bretter", zw * 4, 0, zw, hz.h);
  }
  // Eichhörnchen – 4×6: vorn, rechts, hinten, Arbeiten, Tragen, Ruhen
  const eich = masse(scene, "blatt-eichhorn");
  if (eich) {
    const zw = eich.w / 4, zh = 64;
    const reihen = ["eich", "eich-rechts", "eich-hinten", "eich-arbeit", "eich-carry", "eich-ruhe"];
    reihen.forEach((name, r) => {
      for (let i = 0; i < 4; i++) nimm("blatt-eichhorn", `${name}-${i}`, i * zw, r * zh, zw, zh);
    });
  }

  /*
   * Unterkünfte – drei Ausbaustufen, jede in unbewohnt und bewohnt.
   *
   * Die zweite Zeile ist dieselbe Hütte mit Licht im Fenster, Rauch und
   * Wäscheleine. Damit lässt sich am Bild ablesen, ob jemand daheim ist,
   * ohne dass eine Zahl irgendwo stünde: `bau-2` ist leer, `bau-2-warm`
   * bewohnt.
   */
  const unterkunft = (blatt, praefix, zw, zh) => {
    const m = masse(scene, blatt);
    if (!m) return;
    for (let i = 0; i < 3; i++) {
      nimm(blatt, `${praefix}-${i}`, i * zw, 0, zw, zh);
      nimm(blatt, `${praefix}-${i}-warm`, i * zw, zh, zw, zh);
    }
  };
  unterkunft("blatt-bau-biber", "bau", 96, 80);
  unterkunft("blatt-kobel", "kobel", 64, 96);
  unterkunft("blatt-eulenstange", "eulenstange", 64, 96);

  // Küche – Kessel, Rauchfang, zweiter Kessel
  stufenblatt("blatt-kueche", "kueche", 96, 80);
  // Marmelade – ein Glas, drei Gläser, volles Brett
  stufenblatt("blatt-glas", "glas", 32, 32);
  // Dorfkram – acht Kleinigkeiten, die die Lichtung bewohnt aussehen lassen
  const kram = masse(scene, "blatt-dorfkram");
  if (kram) {
    const namen = ["waescheleine", "feuerstelle", "bank", "brunnen",
                   "blumenkasten", "schubkarre", "fass", "wegweiser"];
    namen.forEach((name, i) => nimm("blatt-dorfkram", name, i * 32, 0, 32, 32));
  }

  // Wasser – vier Bilder
  const beweg = masse(scene, "blatt-bewegt");
  if (beweg) {
    const zw = beweg.w / 4;
    for (let i = 0; i < 4; i++) {
      nimm("blatt-bewegt", `wasser-${i}`, i * zw, 0, zw, beweg.h, { trimmen: false });
    }
  }

  /*
   * Uferflecken statt Kachelsatz.
   *
   * Ein 9er-Satz kann nur rechteckige Becken erzeugen – das war der Fehler
   * der ersten Fassung. Die Flecken werden stattdessen überlappend um das
   * Wasser gestempelt, wie bei den Wegen. Layout: vier runde 64×64, drei
   * längliche 96×64, dann fünf Bewuchsflecken à 64×32.
   */
  const uf = masse(scene, "blatt-uferflecken");
  if (uf) {
    for (let i = 0; i < 4; i++) nimm("blatt-uferflecken", `ufer-rund-${i}`, i * 64, 0, 64, 64);
    for (let i = 0; i < 3; i++) nimm("blatt-uferflecken", `ufer-lang-${i}`, i * 96, 64, 96, 64);
    for (let i = 0; i < 5; i++) nimm("blatt-uferflecken", `ufer-bewuchs-${i}`, i * 64, 128, 64, 32);
  }

  // Bodenkacheln
  const boden = masse(scene, "blatt-boden");
  if (boden) {
    const zw = boden.h;
    for (let i = 0; i < Math.floor(boden.w / zw); i++) {
      nimm("blatt-boden", `boden-${i}`, i * zw, 0, zw, boden.h, { trimmen: false });
    }
  }

  // Wegflecken – vier runde, drei längliche, drei Trittsteine
  const wege = masse(scene, "blatt-wege");
  if (wege) {
    let x = 0, i = 0;
    for (const [anzahl, br] of [[4, 32], [3, 64], [3, 16]]) {
      for (let n = 0; n < anzahl; n++) {
        nimm("blatt-wege", `weg-${i++}`, x, 0, br, wege.h);
        x += br;
      }
    }
  }

  // Bramble – 4×5: Gehen vorn, Tragen, Gehen rechts, Gehen hinten, Arbeiten
  const biber = masse(scene, "blatt-biber");
  if (biber) {
    const zw = biber.w / 4, zh = 64;
    const reihen = ["beaver", "beaver-carry", "beaver-rechts", "beaver-hinten", "beaver-arbeit"];
    reihen.forEach((name, r) => {
      for (let i = 0; i < 4; i++) nimm("blatt-biber", `${name}-${i}`, i * zw, r * zh, zw, zh);
    });
  }

  // Cozywolf – Schlafen, Gehen
  const wolf = masse(scene, "blatt-wolf");
  if (wolf) {
    const zw = wolf.w / 4, zh = wolf.h / 2;
    for (let i = 0; i < 4; i++) nimm("blatt-wolf", `wolf-sleep-${i}`, i * zw, 0, zw, zh);
    nimm("blatt-wolf", "wolf-sleep", 0, 0, zw, zh);
    nimm("blatt-wolf", "wolf-stand", 0, zh, zw, zh);
  }

  return ersetzt;
}
