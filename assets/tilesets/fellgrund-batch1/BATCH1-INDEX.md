# Fellgrund – Batch 5: große Lichtung und sichtbare Logistik

- `boden.png`: drei nahtlos selbstkachelnde Grasvarianten à 32×32; ohne Rand oder Weg.
- `wege.png`: vier runde 32×32-Wegflecken, drei längliche 64×32-Wegflecken und drei 16×16-Trittsteine. Flecken werden überlappend gestempelt.
- `waldrahmen_1_hinten.png`: 640×360; Wald oben, links und rechts, transparente organische Lichtung.
- `waldrahmen_1_vorn.png`: 640×360; ausschließlich die unterste Baum- und Buschreihe für die Verdeckung von Figuren.
- `hintergrund-vorschau.png`: Ebenennachweis Boden → Wege → Wald hinten → Figur → Wald vorn.
- `natur_64x96.png`: fünf 64×96-Zellen; zwei verschiedene Bäume, danach drei 32×32-Beerenstufen unten zentriert.
- `gebaeude_96x80.png`: offene Verladestation Stufe 1 mit genau zwei Kistenplätzen.
- `gueter_64x32.png`: vier 64×32-Zellen; Kiste 16×16, Schiene 32×32, Wagen A/B 48×32.
- `bewegt.png`: vier Wasserbilder à 32×32.
- `wasser_uferflecken.png`: 384×160. Zeile 1: vier runde 64×64-Flecken. Zeile 2: drei längliche 96×64-Flecken. Zeile 3: drei Schilf- und zwei Seerosenflecken à 64×32. Die Flecken werden überlappend gestempelt.
- `vorratsstand_1_128x96.png`: offener Vorratsstand mit drei leeren Regalbrettern.
- `nest_80x48.png` und `nest_rand_vorn_80x48.png`: Nestmulde und separat darüber gerenderter Vorderbogen.
- `laterne_32x64.png`: drei 32×64-Flackerstufen, hell → mittel → gedimmt.
- `herzknospe_32.png`: vier 32×32-Funkelbilder.
- `parzelle_80x48.png`: Moosparzelle mit Markiersteinen und erstem Trieb.
- `natur_batch2_32.png`: sechs 32×32-Zellen; Busch A/B, Findling A/B, Baumstumpf A/B.
- `verladestation_2_96x80.png`: Stufe 2 mit Vordach und genau vier leeren Kistenplätzen.
- `bewohner_biber.png`: 4×5 Zellen à 64×64; Gehen vorn, Tragen, Gehen rechts, Gehen hinten, Arbeiten.
- `cozywolf.png`: 4×2 Zellen à 64×64; Schlafen A-B-A-B und Gehen vorn.
- `vorschau.png`: Übersicht der übrigen Batch-1-Teile in Zielgröße.
- `batch2-vorschau.png`: Übersicht der neuen Batch-2-Teile in Zielgröße.

## Batch 3 – Zellaufbau

- `werkstatt_96x80.png`: 3×1 Zellen à 96×80; Stufe 1, Stufe 2, Stufe 3. Identische Grundfläche, sichtbar wachsender Ausbau.
- `nutzbaum_64x96.png`: 3×1 Zellen à 64×96; voll, halb abgeerntet, Stumpf.
- `holzkette_64x32.png`: 5×1 Zellen à 64×32; Holzscheit mittig, Holzstapel leer, halb, voll, Bretterstapel.
- `vorratsstand_2_128x96.png`: Stufe 2 mit zusätzlichen, vollständig leeren Regalbrettern.
- `bewohner_eichhoernchen.png`: 4×6 Zellen à 64×64. Zeilen: Gehen vorn, Gehen rechts, Gehen hinten, Arbeiten mit Sammelkorb, Tragen mit Sammelkorb, Ruhen. In der Ruhezeile sind nur Zelle 1–2 belegt.
- `bewohner_eule.png`: 4×5 Zellen à 64×64. Zeilen: Sitzen/Blinzeln, Kopf nach rechts und zurück, Auffliegen, Fliegen seitlich, Landen. In der Landezeile sind nur Zelle 1–3 belegt.
- `sitzstange_32.png`: einzelne 32×32-Zelle.
- `cozywolf_batch3.png`: 5×3 Zellen à 64×64. Zeile 1: Aufsetzen/Gähnen (5 Bilder). Zeile 2: Sitzen/Blinzeln (3 Bilder, Zellen 4–5 leer). Zeile 3: Freude (4 Bilder, Zelle 5 leer).
- `batch3-vorschau.png`: native 640×360-Übersicht der Batch-3-Teile; nicht als Laufzeit-Spritesheet gedacht.

## Batch 4 – Zellaufbau

- `gluehbeerenbusch_32.png`: 4×1 Zellen à 32×32; abgeerntet ohne Beeren, knospend, halbreif, reif mit deutlich leuchtenden goldenen Beeren.
- `verladestation_3_96x80.png`: einzelne 96×80-Zelle; Verladehof mit genau sechs vollständig leeren Kistenplätzen.
- `vorratsstand_3_128x96.png`: einzelne 128×96-Zelle; überdachter Lagerschuppen mit leeren Brettern. Die drei Kistenreihen bleiben bei y 35/59/83 im Bild und entsprechen damit den festen Spielhöhen.
- `rinne_32.png`: 4×1 Zellen à 32×32; gerade, diagonal, Einlauf am Becken, Auslauf über dem Beet.
- `batch4-vorschau.png`: native 640×360-Übersicht der Batch-4-Teile; nicht als Laufzeit-Spritesheet gedacht.

## Globale Farbkorrektur ab Batch 4

Die Cozywolf-Farben `#FF95C0`, `#F2609E` und `#C43C74` kommen ausschließlich in Dateien mit `cozywolf` im Dateinamen vor. Frühere unbeabsichtigte Fundstellen in Objekt-, Natur- und Vorschau-PNGs wurden durch Gold-/Holztöne aus der Projektpalette ersetzt. Die eigentlichen Cozywolf-Blätter wurden nicht verändert.

## Batch 5 – Zellaufbau

- `waldrahmen_2_hinten.png`: 1600×900; oberer und seitlicher Waldrahmen, organische transparente Lichtung.
- `waldrahmen_2_vorn.png`: 1600×900; ausschließlich die unterste Baumreihe als Vordergrundebene.
- `verladepunkt_64x32.png`: 3×1 Zellen à 64×32; leere Rampe, Kiste halb aufgeladen, Kiste auf Wagenseite.
- `signal_32.png`: 3×1 Zellen à 32×32; frei, belegt, gesperrt.
- `vorratsstand_1_128x96.png`, `vorratsstand_2_128x96.png`, `vorratsstand_3_128x96.png`: jeweils 6×1 Zellen à 128×96; leer, ⅕, ⅖, ⅗, ⅘, voll. Jede Kiste ist in das jeweilige Bild integriert; alle Fächer haben mindestens 18 px lichte Höhe.
- `verladestation_1_96x80.png`: 3×1 Zellen à 96×80; 0 bis 2 integrierte Kisten.
- `verladestation_2_96x80.png`: 5×1 Zellen à 96×80; 0 bis 4 integrierte Kisten.
- `verladestation_3_96x80.png`: 7×1 Zellen à 96×80; 0 bis 6 integrierte Kisten. Alle Stufen nutzen die volle 80-px-Höhe.
- `wurzelwagen_64x48.png`: 7×1 Zellen à 64×48; orthogonale Draufsicht, leer bis 6 integrierte Kisten, Ladefläche 20 px tief.
- `uferkante_64x32.png`: 6×1 Zellen à 64×32; sechs reine 6–8-px-Uferstreifen ohne Wasserfüllung: ruhig, konvex, konkav, steigend, fallend, S-Kurve.
- `dorfplatz_192x96.png`: gepflasterter Rund mit Randsteinen, Moosfugen und freier Nestmitte.
- `platzlaterne_32x64.png`: 3×1 Zellen à 32×64; drei Flackerstufen.
- `batch5-vorschau.png`: 1600×896-Kompositionsnachweis; nicht als Laufzeit-Spritesheet gedacht.
- `tools/zeichne-batch5.mjs`: reproduzierbare Konstruktion aller Batch-5-Dateien direkt im Zielraster.
