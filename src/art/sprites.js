/**
 * Figuren als Zeichenraster.
 *
 * Cozywolf und die Bewohner folgen einer gemeinsamen Figurenregel:
 * fast schwarzer Umriss, höchstens fünf Farben, zwei Pixel Wangenröte,
 * großer Kopf. Was eine Figur unterscheidet, sind Silhouette und
 * Grundfarbe – nie der Detailgrad.
 */

const INK = "#181016";
const BLUSH = "#F0885E";

/* --------------------------------------------------------------- *
 * Cozywolf, stehend. Nur die linke Hälfte ist gezeichnet und wird
 * gespiegelt, damit die Figur über alle Frames identisch bleibt.
 * --------------------------------------------------------------- */
export const WOLF_HALF = [
  "...oo......", "..oiio.....", "..oiiFo....", ".oiiFFFo...", "ooiiFFFFo..",
  "oiFFFFFFFo.", "oFFFFFFFFFo", "oFFFFFFFFFF", "oFFFFFFFFFF", "oFFeeeeFFFF",
  "oFeFFFFeFFF", "oFFFFFFFFFF", "oFFFFFFLLLL", "oFBBFFLLLnn", "oFBBFFLLLnn",
  ".oFFFFLLLLm", ".oFFFFLLmmL", "..oFFFFmLLL", "..ooFFFFFFF", "...oooFFFFF",
  "..oAAoTTTTT", ".oAAAoTTTTT", ".oAAAoTbTTT", ".oAAAoTTTTT", ".oAAAoTTTTT",
  ".oAAAoTTTTT", "..oAAoTTTTT", "...oooDDDDD", "....oDDDDDD", "..oPPPoDDDD",
  "..oPPPPoDDD", "..oooooooDD"
];

export const WOLF_LIGHT = [
  "...........", "...........", "...........", "...........", "...........",
  ".H.........", "HH.........", "HH.........", "H..........", "...........",
  "...........", "...........", "...........", "...........", "...........",
  "...........", "...........", "...........", "...........", "...........",
  "...........", ".q.........", ".q.........", "...........", "...........",
  "...........", "...........", "...........", "...........", "...........",
  "...........", "..........."
];

export const WOLF_TAIL = [
  "...ooo..", "..offfo.", ".offfffo", ".ffFFffo", ".fFFFffo",
  ".fFFFfo.", "..fFffo.", "..offo..", "...oo..."
];

export const WOLF_PAL = {
  o: INK, F: "#F2609E", L: "#FF95C0", H: "#FFC2DC", q: "#4ABCC2",
  i: "#C43C74", e: "#2A1A2E", n: "#161E38", m: "#8E1C4E", B: BLUSH,
  T: "#2E8792", D: "#1D5E68", b: "#F0A93C", A: "#EE5896", P: "#FF95C0", f: "#FFAECB"
};

/** Cozywolf zusammengerollt, wie er im Nest schläft. */
export const WOLF_SLEEP = [
  "...D.......D..............",
  "..DFD.....DFD.............",
  "..DFHD...DFHD.............",
  ".DFHHFDDDFHHFD............",
  ".DFHHFFFFFHHFFD.DDDDDD....",
  "DFHccFFFFFccFFDDFFFFFFFDD.",
  "DFBFFFFFFBFFFDFFFFFFFFFFD.",
  "DFFFsssFFFFFFFFFFFFFFFFFFD",
  ".DFFFFFFOOOOOOOOOFFFFFFFFD",
  ".DDFFFFOOOOoOOOOOOFFFFFFFD",
  "..DDFFFOoOOOOOOOOOFFFFFFTD",
  "...DFFFOOOOOOOOOOOFFFFTffT",
  "...DFFFFOOOOOOOOOFFFFTfhff",
  "..DFFFFFFOOOOOOOFFFFTfhhff",
  "..DDFFFFFFFFFFFFFFTffhhffT",
  "...DDFFFFFFFFFFDDTffffffT.",
  "....DDDFFFFFFDDDTTffffTT..",
  "......DDDDDDDDDDTTTT......"
];

export const WOLF_SLEEP_PAL = {
  F: "#EE6A9E", H: "#FF97BE", D: INK, c: "#1B2233", s: "#B03C6C", B: BLUSH,
  f: "#FF9CC0", h: "#FFC4DA", T: "#B03C6C", O: "#2F8F96", o: "#F0BC58"
};

/* --------------------------------------------------------------- *
 * Bewohner
 * --------------------------------------------------------------- */
export const BEAVER = [
  [
    "...oooo...", "..oBBBBo..", "..oBkBko..", "..oLBnBLo.", ".ooBBBBoo.",
    "toBBBBBBo.", "ttBBBBBBo.", "toBBBBBBo.", ".oBBBBBBo.", "..oo..oo..",
    "..dd..dd.."
  ],
  [
    "...oooo...", "..oBBBBo..", "..oBkBko..", "..oLBnBLo.", ".ooBBBBoo.",
    "toBBBBBBo.", "ttBBBBBBo.", "toBBBBBBo.", ".oBBBBBBo.", "...oooo...",
    "..dd..dd.."
  ]
];

export const BEAVER_PAL = {
  o: INK, B: "#9A6E43", L: BLUSH, k: "#140D08",
  n: "#4A3018", t: "#54381F", d: "#2E1E10"
};

export const CRITTERS = {
  eichhoernchen: {
    rows: [
      "........TTT.", ".......TttT.", "..ooo..TttT.", ".oBBBo.TttT.",
      ".oBkBBoTttT.", ".oBBnBoTttT.", "..oBBBottT..", ".oBBBBBBtT..",
      ".oBLLLBBo...", ".oBLLLBBo...", "..oBBBBo....", "...oo.oo...."
    ],
    pal: { o: INK, B: "#C4783A", L: "#EFCBA0", k: "#140D08", n: BLUSH, T: INK, t: "#DFA560" },
    w: 12, h: 12
  },
  axolotl: {
    rows: [
      ".g.........g.", ".gg.PPPPP.gg.", "gggPppppppPgg", ".gPpkppppkpP.",
      ".gPppppppppP.", "..PppppppppPP", "...PPppppPP.P", ".....PPPP...."
    ],
    pal: { p: "#F2AEC4", P: INK, g: "#FBD2DF", k: "#2E1520" },
    w: 13, h: 8
  },
  biene: {
    rows: [
      "...ww.ww...", "..wwwwwww..", "...wwwww...", "..KYYKYYK..",
      ".KYYKYYKYK.", ".KYYKYYKYK.", "..KYYKYYK..", "...KKKKK..."
    ],
    pal: { Y: "#FBCB55", K: INK, w: "#D9EAF2" },
    w: 11, h: 8
  },
  maulwurf: {
    rows: [
      "....mmmm....", "..mmMMMMmm..", ".mMMMMMMMMm.", ".mMMkMMkMMm.",
      "nnMMMMMMMMm.", "nnmMMMMMMMm.", ".mMMMMMMMMm.", ".cmMMMMMMmc.",
      ".cc.mmmm.cc."
    ],
    pal: { m: INK, M: "#6F6067", k: "#140D08", n: BLUSH, c: "#DED4C6" },
    w: 12, h: 9
  }
};
