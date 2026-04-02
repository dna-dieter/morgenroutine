#!/usr/bin/env python3
"""
Mantelroutine — Spreadsheet- und TOML-gesteuerter Job-Runner
=============================================================
Wird taeglich um 00:00 via launchd gestartet.

Ablauf:
  1. schedule_matrix.xlsx lesen → Startzeit + aktive Jobs fuer heute
  2. Bis zur Startzeit schlafen (sleep)
  3. Wochentag-TOML laden → Job-Details (Modul, Abhaengigkeiten)
  4. Jobs ausfuehren, Ergebnisse als JSON schreiben

Die xlsx ist die Steuerungstabelle (WANN + WAS).
Die TOML-Dateien liefern die technischen Details (WIE).

Exit-Codes:
  0 = Erfolg (auch bei leerem Schedule)
  1 = Mindestens ein Job fehlgeschlagen (retry-wuerdig fuer launchd)
  2 = Fataler Fehler (Config nicht lesbar, etc.)

Autor: AI Artifakte
"""