#!/bin/bash
cd "$(dirname "$0")"
echo "Dashboard startet auf http://localhost:8787"
echo "Zum Beenden: Ctrl+C oder dieses Fenster schliessen"
echo ""
python3 dashboard_server.py &
sleep 1
open "http://localhost:8787"
wait
