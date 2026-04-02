# Morgenroutine — Trading Dashboard

Täglicher Startpunkt für Marktanalyse und Trading.

**URL:** https://dna-dieter.github.io/morgenroutine/

## Module

- **Nacht-Batch Status** — Grün/Rot-Anzeige der Nachtroutinen (03:00 + 04:00 Uhr)
- **Trading-Ampel** — VIX-Regime, Positionsgröße, Marktphase
- **Markt-Übersicht** — SPY, QQQ, IWM, VIX, DXY, TNX, GLD, BTC
- **Marktbreite** — Breadth-Indikatoren (200-MA, 50-MA, A/D, Volume)
- **Watchlist** — Aktuelle Fokus-Titel mit Setup-Typ und Weinstein-Phase
- **Setup-Signale** — Aktive Trading-Signale (Undercut, VCP, Maur, etc.)
- **Offene Positionen** — P&L, Stopps, Setup-Typen
- **Discord Feiertag** — Letzte Nachrichten von Olli & Christian
- **Kalender** — Earnings, Fed, Wirtschaftsdaten (5 Tage)
- **Morgen-Checkliste** — 7-Punkte Trading-Vorbereitung

## Architektur

Statische GitHub Pages Site. Daten kommen aus JSON-Files in `/data/`, die per Nacht-Batch (Scheduled Task + launchd) aktualisiert und committed werden.

```
morgenroutine/
├── index.html          ← Dashboard (Hauptseite)
├── nachtbatch.html     ← Nacht-Batch Detailstatistik
└── data/
    ├── nachtbatch.json ← Job-Status der Nachtroutinen
    ├── ampel.json      ← Trading-Ampel (VIX, Phase, Sizing)
    ├── market.json     ← Indizes und Kurse
    ├── breadth.json    ← Marktbreite-Indikatoren
    ├── watchlist.json  ← Aktuelle Watchlist
    ├── setups.json     ← Aktive Setup-Signale
    ├── positions.json  ← Offene Positionen
    ├── discord.json    ← Discord-Nachrichten
    └── calendar.json   ← Earnings/Events Kalender
```
