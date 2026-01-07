const server = Bun.serve({
  port: 3001,

  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Proxy endpoint for Yahoo Finance API (to avoid CORS)
    if (path === "/api/yahoo/chart") {
      const symbol = url.searchParams.get("symbol");
      const range = url.searchParams.get("range");
      const period1 = url.searchParams.get("period1");
      const period2 = url.searchParams.get("period2");
      const customInterval = url.searchParams.get("interval");

      if (!symbol) {
        return new Response(JSON.stringify({ error: "Symbol required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      let yahooUrl;

      if (period1 && period2) {
        // Custom date range mode using period1/period2 (unix timestamps)
        const interval = customInterval || "1d";
        yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;
      } else {
        // Predefined range mode
        const rangeValue = range || "1mo";
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
        const interval = intervalMap[rangeValue] || "1d";
        yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${rangeValue}&interval=${interval}`;
      }

      try {
        const response = await fetch(yahooUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Client-side routes - serve index.html for SPA routing
    const clientRoutes = [
      "/",
      "/dashboard",
      "/stocks",
      "/portfolio",
      "/history",
      "/settings",
    ];

    // Check if it's a client-side route or a stock detail page
    if (clientRoutes.includes(path) || path.startsWith("/stock/")) {
      const file = Bun.file("./index.html");
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Determine content type for static files
    const contentTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };

    const ext = path.substring(path.lastIndexOf("."));
    const contentType = contentTypes[ext] || "text/plain";

    try {
      const file = Bun.file(`.${path}`);
      const exists = await file.exists();

      if (!exists) {
        // If file not found, serve index.html (SPA fallback)
        const indexFile = Bun.file("./index.html");
        return new Response(indexFile, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      return new Response("Server fout", { status: 500 });
    }
  },
});

console.log(`Aandelending server draait op http://localhost:${server.port}`);
