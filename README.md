# Fellgrund

Ein gemütliches 2D-Pixel-Automationsspiel. Man baut als erwachsener Cozywolf
seinen ersten eigenen Cozyplace von null auf – nicht durch direkte
Figursteuerung, sondern durch das Gestalten und Automatisieren einer
lebendigen Dorfwirtschaft.

## Starten

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` erzeugt eine statische Fassung in `dist/`.

## Was aktuell spielbar ist

Der erste Slice beweist den Kern-Loop. Alles darin ist sichtbar, nichts
passiert nur als Zahl:

1. **Bramble** läuft auf einem echten Weg zum Glühbeerenbeet und erntet.
2. Er trägt eine **Kiste** zurück und legt sie auf der **Verladestation** ab.
3. Ist die Station voll, fährt der **Wurzelwagen** auf der sichtbaren Schiene los.
4. Bei der **tatsächlichen Ankunft** wandern die Kisten ins Regal des
   Vorratsstands – erst dann steigt der Glühbeerenbestand.
5. **Cozywolf** hebt kurz das Ohr.
6. Nach drei Lieferungen wird das **Wagenlager** kaufbar: Die Station bekommt
   sichtbar ein Vordach, zwei zusätzliche Kistenplätze, der Wagen nimmt vier
   Kisten pro Fahrt, und am Nest öffnet sich eine neue Blüte.

Ein Klick auf ein Gebäude öffnet dessen Zustand und Ausbauten. Die Welt
arbeitet ansonsten selbstständig weiter. Der Spielstand liegt im
`localStorage` und wird alle fünf Sekunden gesichert.

In der Browser-Konsole: `fellgrund.zuruecksetzen()` startet von vorn.

## Aufbau

```
src/
  main.js              Phaser-Konfiguration, Einstiegspunkt
  game/config.js       Weltaufbau: Lichtung, Bauplätze, Wege, Regeln, Ausbauten
  game/state.js        Spielzustand, Ereignisse, Speichern und Laden
  scenes/BootScene.js  legt Texturen an, lädt den Spielstand
  scenes/GladeScene.js die Lichtung: Kette, Figuren, Tiefensortierung
  ui/hud.js            Ressourcenleiste, Statuszeile, Gebäude-Panel (HTML)
  art/pixels.js        Zeichen-Grundlagen und Palette
  art/sprites.js       Figuren als Zeichenraster
  art/textures.js      erzeugt alle Platzhaltertexturen  ← Austauschpunkt
assets/
  README.md            wie ein fertiges Tileset eingesetzt wird
```

Die gesamte Grafik entsteht in `src/art/`. Der Rest des Spiels kennt nur
Texturschlüssel – ein fertiges Tileset lässt sich einsetzen, ohne die
Spiellogik anzufassen. Siehe `assets/README.md`.

## Konzept

Das ausführliche Konzeptdokument liegt als `fellgrund-spielidee.html` im
Projekt und lässt sich direkt im Browser öffnen.
