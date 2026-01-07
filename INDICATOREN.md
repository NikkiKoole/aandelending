# Technische Indicatoren

Dit spel bevat technische indicatoren die je kunt activeren op de geavanceerde (candlestick) grafiek. Deze indicatoren helpen bij het analyseren van aandelenkoersen.

## Beschikbare Indicatoren

### Moving Averages (Voortschrijdende Gemiddelden)

| Indicator | Kleur | Beschrijving |
|-----------|-------|--------------|
| **MA5** | Groen | 5-daags gemiddelde. Reageert snel op prijsveranderingen. |
| **MA20** | Oranje | 20-daags gemiddelde. Standaard voor korte termijn trends. |
| **MA50** | Blauw | 50-daags gemiddelde. Toont middellange termijn trend. |
| **MA200** | Paars | 200-daags gemiddelde. De belangrijkste indicator voor lange termijn trends. |
| **EMA20** | Roze | Exponentieel 20-daags gemiddelde. Geeft meer gewicht aan recente prijzen. |

### Bollinger Bands

| Indicator | Kleur | Beschrijving |
|-----------|-------|--------------|
| **BB Upper/Lower** | Grijs-blauw | Banden rond het 20-daags gemiddelde (2 standaarddeviaties). Tonen volatiliteit. |

## Hoe Werken Ze?

### Simple Moving Average (SMA)
Het gemiddelde van de slotkoersen over een bepaalde periode. Een MA20 berekent het gemiddelde van de laatste 20 slotkoersen.

```
SMA = (Prijs₁ + Prijs₂ + ... + Prijsₙ) / n
```

### Exponential Moving Average (EMA)
Vergelijkbaar met SMA, maar geeft meer gewicht aan recente prijzen. Reageert daardoor sneller op prijsveranderingen.

```
EMA = Prijs × k + EMA_vorige × (1 - k)
waarbij k = 2 / (periode + 1)
```

### Bollinger Bands
Twee banden rond een SMA die de volatiliteit tonen:
- **Bovenkant**: SMA + (2 × standaarddeviatie)
- **Onderkant**: SMA - (2 × standaarddeviatie)

Wanneer de banden ver uit elkaar staan is er veel volatiliteit. Wanneer ze dicht bij elkaar staan is de koers stabiel.

## Tijdschaal Aanpassingen

De indicatoren passen zich automatisch aan op basis van de geselecteerde tijdschaal:

| Tijdschaal | Interval | MA20 wordt |
|------------|----------|------------|
| 1D | 5 minuten | Uitgeschakeld (niet zinvol) |
| 5D | 15 minuten | Uitgeschakeld (niet zinvol) |
| 1M - 1J | Dagelijks | 20 candles |
| 5J | Wekelijks | 4 candles (= 20 dagen) |
| Max | Maandelijks | 20 candles (minimum) |

## Handige Signalen

### Golden Cross & Death Cross
- **Golden Cross**: MA50 kruist boven MA200 = bullish signaal
- **Death Cross**: MA50 kruist onder MA200 = bearish signaal

### Bollinger Band Squeeze
Wanneer de banden heel dicht bij elkaar komen, volgt vaak een grote prijsbeweging.

### Prijs vs MA200
- Prijs boven MA200 = opwaartse trend
- Prijs onder MA200 = neerwaartse trend

## Broncode

De berekeningen zijn gebaseerd op standaard financiele formules. Zie de implementatie:

- **Indicator berekeningen (voor bots)**: [`js/indicators.js`](js/indicators.js)
- **Chart overlay berekeningen**: [`js/charts.js`](js/charts.js)

### Externe Bronnen

- [Lightweight Charts (TradingView)](https://github.com/tradingview/lightweight-charts) - De charting library die we gebruiken
- [Lightweight Charts Indicator Examples](https://github.com/tradingview/lightweight-charts/tree/master/indicator-examples) - Officiële voorbeelden van indicatoren
- [Bollinger Bands - Wikipedia](https://en.wikipedia.org/wiki/Bollinger_Bands) - Uitleg over Bollinger Bands
- [Moving Average - Investopedia](https://www.investopedia.com/terms/m/movingaverage.asp) - Uitleg over Moving Averages

## Toekomstige Indicatoren

Geplande uitbreidingen:
- RSI (Relative Strength Index)
- Volume indicator
- MACD (Moving Average Convergence Divergence)
