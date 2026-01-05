# Aandelending - Handoff Document

Dit document beschrijft de technische details voor toekomstig onderhoud.

## Architectuur Overzicht

De app is een client-side single-page application (SPA) gebouwd met vanilla JavaScript. Alle data wordt opgeslagen in localStorage.

### Belangrijke Bestanden

| Bestand | Doel |
|---------|------|
| `js/app.js` | Hoofdlogica, routing, UI updates |
| `js/api.js` | Alle API calls (Yahoo Finance, Finnhub) |
| `js/storage.js` | localStorage wrapper voor gebruikers |
| `js/leaderboard.js` | Online ranglijst via JSONBin.io |
| `js/charts.js` | Grafiek rendering (Lightweight Charts + custom) |
| `server.js` | Lokale dev server met CORS proxy |

### Data Flow

```
Gebruiker -> app.js -> api.js -> Yahoo Finance / Finnhub
                    -> storage.js -> localStorage
                    -> leaderboard.js -> JSONBin.io
```

## API Keys & Configuratie

### Finnhub (nieuws & aanbevelingen)
- **Key**: `d5e0941r01qjckl11vkgd5e0941r01qjckl11vl0`
- **Locatie**: `js/api.js` (regel ~180)
- **Limiet**: 60 requests/minuut
- **Rate limiting**: Automatisch afgehandeld, toont "tijdelijk niet beschikbaar"

### JSONBin.io (online ranglijst)
- **Bin ID**: `695c271c43b1c97be91b5e68`
- **Access Key**: `$2a$10$qSSkvyDSSjqZBDbuYzDmzeRd2c99NQBjs36SA8aHEtCeZnNYuhv5O`
- **Locatie**: `js/leaderboard.js` (regel 3-5)
- **Limiet**: 10.000 requests/maand
- **Safeguards**: 5 min cache, 10 min cooldown tussen shares

### Yahoo Finance
- **Geen API key nodig**
- **Lokaal**: Proxy via `server.js` (poort 3001)
- **GitHub Pages**: Proxy via `corsproxy.io`

## Deployment

### GitHub Pages (productie)
- Automatisch via GitHub Actions (`.github/workflows/deploy.yml`)
- Push naar `main` branch triggert deployment
- Live op: https://nikkikoole.github.io/aandelending/

### Lokaal ontwikkelen
```bash
bun run server.js  # Start op http://localhost:3001
```

## Bekende Beperkingen

1. **Europese aandelen**: We gebruiken US-listed ADRs (bijv. ASML in plaats van ASML.AS) omdat Yahoo Finance betere data geeft voor US stocks.

2. **Lightweight Charts versie**: Gepind op v4.1.3 omdat v5 breaking changes heeft. Zie `index.html` regel ~653.

3. **CORS op GitHub Pages**: Gebruikt `corsproxy.io` als proxy. Als deze dienst stopt, moet een alternatief gevonden worden.

4. **localStorage limieten**: ~5MB per domein. Bij heel veel transacties kan dit vol raken.

## Admin Functies

### Online ranglijst beheren
In `js/leaderboard.js`:
```javascript
ADMIN_MODE: true,  // Zet op true om delete knoppen te zien
```

### Gebruiker resetten
Gebruikers kunnen zelf hun account resetten via Instellingen. Dit verwijdert ook automatisch hun score van de online ranglijst.

## Toekomstige Verbeteringen (ideeën)

- [ ] Achievements/badges systeem
- [ ] Portfolio waarde grafiek over tijd
- [ ] Favoriete aandelen
- [ ] Donkere modus
- [ ] Dividend simulatie
- [ ] Wekelijkse competities

## Troubleshooting

### "Nieuws tijdelijk niet beschikbaar"
Finnhub rate limit bereikt. Wacht 1 minuut, data is gecached.

### Candlestick grafiek werkt niet
Check of Lightweight Charts geladen is. Versie moet 4.x zijn, niet 5.x.

### Online ranglijst laadt niet
Check JSONBin.io status en of het maandelijkse limiet niet bereikt is.

### Aandelenprijzen laden niet
- Lokaal: Is `server.js` actief op poort 3001?
- GitHub Pages: Werkt `corsproxy.io` nog?

## Contact

Gebouwd door Claude (AI) in samenwerking met de gebruiker.
