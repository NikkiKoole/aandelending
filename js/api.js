const API = {
  cache: new Map(),
  CACHE_DURATION: 5 * 60000, // 5 minute cache

  // Detect if running locally or on GitHub Pages
  isLocal() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  },

  // Pre-populated stocks (US-listed symbols)
  popularStocks: [
    {
      symbol: "ASML",
      name: "ASML Holding",
      description: "Chipmachines (NL)",
      market: "EU",
    },
    {
      symbol: "SHEL",
      name: "Shell",
      description: "Olie & Gas (NL/UK)",
      market: "EU",
    },
    {
      symbol: "ING",
      name: "ING Groep",
      description: "Bank (NL)",
      market: "EU",
    },
    {
      symbol: "PHG",
      name: "Philips",
      description: "Gezondheidstechnologie (NL)",
      market: "EU",
    },
    {
      symbol: "UL",
      name: "Unilever",
      description: "Consumentenproducten (NL/UK)",
      market: "EU",
    },
    {
      symbol: "NVO",
      name: "Novo Nordisk",
      description: "Farmaceutisch (DK)",
      market: "EU",
    },
    { symbol: "AAPL", name: "Apple", description: "iPhone, Mac", market: "US" },
    {
      symbol: "MSFT",
      name: "Microsoft",
      description: "Windows, Xbox",
      market: "US",
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      description: "Elektrische auto's",
      market: "US",
    },
    { symbol: "AMZN", name: "Amazon", description: "Webwinkel", market: "US" },
    {
      symbol: "NVDA",
      name: "Nvidia",
      description: "Grafische kaarten, AI",
      market: "US",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet (Google)",
      description: "Zoekmachine",
      market: "US",
    },
    {
      symbol: "META",
      name: "Meta",
      description: "Facebook, Instagram",
      market: "US",
    },
    { symbol: "NFLX", name: "Netflix", description: "Streaming", market: "US" },
    {
      symbol: "DIS",
      name: "Disney",
      description: "Disney+, Marvel, Star Wars",
      market: "US",
    },
    { symbol: "SBUX", name: "Starbucks", description: "Koffie", market: "US" },
    {
      symbol: "NKE",
      name: "Nike",
      description: "Sneakers, sport",
      market: "US",
    },
    {
      symbol: "MCD",
      name: "McDonald's",
      description: "Fast food",
      market: "US",
    },
    { symbol: "KO", name: "Coca-Cola", description: "Frisdrank", market: "US" },
    {
      symbol: "PEP",
      name: "PepsiCo",
      description: "Pepsi, Lay's, Doritos",
      market: "US",
    },
    {
      symbol: "SPOT",
      name: "Spotify",
      description: "Muziek streaming (Zweeds)",
      market: "US",
    },
    {
      symbol: "RBLX",
      name: "Roblox",
      description: "Gaming platform",
      market: "US",
    },
    {
      symbol: "EA",
      name: "Electronic Arts",
      description: "FIFA, games",
      market: "US",
    },
    { symbol: "SONY", name: "Sony", description: "PlayStation", market: "US" },
    {
      symbol: "NTDOY",
      name: "Nintendo",
      description: "Switch, Mario, Pokemon",
      market: "US",
    },
    { symbol: "UBER", name: "Uber", description: "Taxi app", market: "US" },
    {
      symbol: "ABNB",
      name: "Airbnb",
      description: "Vakantiehuizen",
      market: "US",
    },
    {
      symbol: "WBD",
      name: "Warner Bros Discovery",
      description: "HBO Max, CNN",
      market: "US",
    },
    {
      symbol: "PARA",
      name: "Paramount",
      description: "Paramount+, MTV",
      market: "US",
    },
    {
      symbol: "ADDYY",
      name: "Adidas",
      description: "Sportkleding (Duits)",
      market: "US",
    },
    {
      symbol: "MBGYY",
      name: "Mercedes-Benz",
      description: "Luxe auto's (Duits)",
      market: "US",
    },
    {
      symbol: "BMWYY",
      name: "BMW",
      description: "Luxe auto's (Duits)",
      market: "US",
    },
    {
      symbol: "RACE",
      name: "Ferrari",
      description: "Sportwagens (Italiaans)",
      market: "US",
    },
    {
      symbol: "PYPL",
      name: "PayPal",
      description: "Online betalen",
      market: "US",
    },
    {
      symbol: "XOM",
      name: "Exxon Mobil",
      description: "Olie & Gas (Amerikaans)",
      market: "US",
    },
    {
      symbol: "BP",
      name: "BP",
      description: "Olie & Gas (Brits)",
      market: "US",
    },
  ],

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  },

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  },

  async getYahooData(symbol, range = "1d") {
    const cacheKey = `yahoo_${symbol}_${range}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Determine interval based on range
    const intervalMap = {
      "1d": "5m",
      "5d": "15m",
      "1mo": "1d",
      "6mo": "1d",
      ytd: "1d",
      "1y": "1d",
      "5y": "1wk",
      max: "1mo",
    };
    const interval = intervalMap[range] || "1d";

    let url;
    if (this.isLocal()) {
      // Use local Bun server proxy
      url = `/api/yahoo/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`;
    } else {
      // Use corsproxy.io for GitHub Pages
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
      url = `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.chart?.result?.[0]) {
      throw new Error("No data returned");
    }

    const result = data.chart.result[0];
    const meta = result.meta || {};
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};

    const candles = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open?.[i] != null && quote.close?.[i] != null) {
        candles.push({
          time: timestamps[i],
          open: quote.open[i],
          high: quote.high[i],
          low: quote.low[i],
          close: quote.close[i],
          volume: quote.volume?.[i] || 0,
        });
      }
    }

    const quoteData = {
      symbol,
      currentPrice: meta.regularMarketPrice || 0,
      previousClose: meta.previousClose || meta.chartPreviousClose || 0,
      change:
        (meta.regularMarketPrice || 0) -
        (meta.previousClose || meta.chartPreviousClose || 0),
      percentChange: meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) /
            meta.previousClose) *
          100
        : 0,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      open: meta.regularMarketOpen || 0,
      candles,
    };

    this.setCache(cacheKey, quoteData);
    return quoteData;
  },

  async getQuote(symbol) {
    const data = await this.getYahooData(symbol, "1d");
    return {
      symbol: data.symbol,
      currentPrice: data.currentPrice,
      change: data.change,
      percentChange: data.percentChange,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose,
    };
  },

  async getCandles(symbol, range = "1mo") {
    const data = await this.getYahooData(symbol, range);
    return data.candles;
  },

  async searchStocks(query) {
    const q = query.toLowerCase();
    return this.popularStocks
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
      .slice(0, 10)
      .map((s) => ({
        symbol: s.symbol,
        name: s.name,
        description: s.description,
      }));
  },

  async getMultipleQuotes(symbols) {
    const quotes = [];
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        quotes.push(quote);
      } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error);
        quotes.push({ symbol, currentPrice: 0, change: 0, percentChange: 0 });
      }
    }
    return quotes;
  },

  async getPopularStocksWithPrices() {
    const symbols = this.popularStocks.map((s) => s.symbol);
    const quotes = await this.getMultipleQuotes(symbols);
    return this.popularStocks.map((stock, index) => ({
      ...stock,
      ...quotes[index],
    }));
  },

  getStockInfo(symbol) {
    return (
      this.popularStocks.find((s) => s.symbol === symbol) || {
        symbol,
        name: symbol,
        description: "",
        market: symbol.includes(".") ? "EU" : "US",
      }
    );
  },

  // Finnhub API key
  FINNHUB_API_KEY: "d5e0941r01qjckl11vkgd5e0941r01qjckl11vl0",

  // Finnhub rate limit tracking
  finnhubRateLimited: false,
  finnhubRateLimitReset: null,

  // Check if Finnhub is rate limited
  isFinnhubRateLimited() {
    if (!this.finnhubRateLimited) return false;
    if (this.finnhubRateLimitReset && Date.now() > this.finnhubRateLimitReset) {
      this.finnhubRateLimited = false;
      this.finnhubRateLimitReset = null;
      return false;
    }
    return true;
  },

  // Get general market news from Finnhub
  async getMarketNews() {
    // Check rate limit
    if (this.isFinnhubRateLimited()) {
      return { rateLimited: true };
    }

    const cacheKey = "market_news";
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `https://finnhub.io/api/v1/news?category=general&token=${this.FINNHUB_API_KEY}`;

      const response = await fetch(url);

      // Handle rate limiting (429)
      if (response.status === 429) {
        this.finnhubRateLimited = true;
        this.finnhubRateLimitReset = Date.now() + 60000; // Reset after 1 minute
        return { rateLimited: true };
      }

      if (!response.ok) {
        throw new Error(`Finnhub news error: ${response.status}`);
      }

      const news = await response.json();

      // Take only the first 5 news items
      const limitedNews = news.slice(0, 5).map((item) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime,
        image: item.image,
      }));

      this.setCache(cacheKey, limitedNews);
      return limitedNews;
    } catch (error) {
      console.error("Error fetching market news:", error);
      return [];
    }
  },

  // Get analyst recommendations from Finnhub
  async getRecommendations(symbol) {
    // Check rate limit
    if (this.isFinnhubRateLimited()) {
      return { rateLimited: true };
    }

    const cacheKey = `recommendations_${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${this.FINNHUB_API_KEY}`;

      const response = await fetch(url);

      // Handle rate limiting (429)
      if (response.status === 429) {
        this.finnhubRateLimited = true;
        this.finnhubRateLimitReset = Date.now() + 60000; // Reset after 1 minute
        return { rateLimited: true };
      }

      if (!response.ok) {
        throw new Error(`Finnhub recommendations error: ${response.status}`);
      }

      const recommendations = await response.json();

      // Get the most recent recommendation
      if (recommendations.length > 0) {
        const latest = recommendations[0];
        const result = {
          buy: latest.buy || 0,
          hold: latest.hold || 0,
          sell: latest.sell || 0,
          strongBuy: latest.strongBuy || 0,
          strongSell: latest.strongSell || 0,
          period: latest.period,
        };
        this.setCache(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return null;
    }
  },
};
