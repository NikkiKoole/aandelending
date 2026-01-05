# Aandelending - Beursspel voor Kinderen

Een educatief aandelenhandelspel voor kinderen om te leren over de beurs met nepgeld en echte (vertraagde) aandelenprijzen.

## Features

- **Handelen met nepgeld** - Start met €10.000 virtueel geld
- **Echte aandelenprijzen** - 15 minuten vertraagde data via Yahoo Finance
- **Nederlandse en Amerikaanse aandelen** - ASML, Shell, Apple, Tesla, etc.
- **Grafieken** - Eenvoudige lijngrafiek of geavanceerde candlestick chart
- **Portefeuille tracking** - Bekijk je bezittingen en winst/verlies
- **Transactiekosten** - Simuleert Degiro-achtige kosten
- **Marktnieuws** - Actueel financieel nieuws op het dashboard
- **Analisten aanbevelingen** - Koop/houd/verkoop adviezen per aandeel
- **Ranglijst** - Lokaal en online competitie met vrienden
- **Nederlandse interface** - Volledig in het Nederlands

## Live Demo

https://nikkikoole.github.io/aandelending/

## Lokaal draaien

```bash
# Installeer Bun (als je dat nog niet hebt)
curl -fsSL https://bun.sh/install | bash

# Clone de repo
git clone https://github.com/nikkikoole/aandelending.git
cd aandelending

# Start de server
bun run server.js

# Open http://localhost:3001 in je browser
```

## Tech Stack

- **Runtime**: Bun
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Storage**: localStorage (geen database nodig)
- **Charts**: Lightweight Charts (TradingView)
- **APIs**: 
  - Yahoo Finance (aandelenprijzen)
  - Finnhub (nieuws & aanbevelingen)
  - JSONBin.io (online ranglijst)

## Design

Geïnspireerd door de Financial Times:
- Zalm-roze achtergrond (#FFF1E5)
- Serif fonts (Georgia)
- Professionele, "volwassen" uitstraling

## Project Structuur

```
aandelending/
├── index.html          # Hoofdpagina
├── server.js           # Bun server met Yahoo Finance proxy
├── css/
│   └── styles.css      # FT-geïnspireerde styling
├── js/
│   ├── app.js          # Hoofdapplicatie logica
│   ├── api.js          # Yahoo Finance & Finnhub API
│   ├── storage.js      # localStorage wrapper
│   ├── settings.js     # Gebruikersinstellingen
│   ├── portfolio.js    # Portefeuille beheer
│   ├── charts.js       # Grafiek rendering
│   ├── companies.js    # Bedrijfsinformatie
│   └── leaderboard.js  # Ranglijst (lokaal & online)
├── images/
│   └── logos/          # Bedrijfslogo's (SVG)
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## API Limieten

- **Yahoo Finance**: Geen strikte limiet (via CORS proxy)
- **Finnhub**: 60 requests/minuut (gratis tier)
- **JSONBin.io**: 10.000 requests/maand (gratis tier)

## Licentie

MIT
