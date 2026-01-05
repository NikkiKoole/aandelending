// Main application logic

const App = {
  // Current state
  currentView: "dashboard",
  currentStock: null,
  stockCandles: null,

  // Initialize the application
  init() {
    this.checkLogin();
    this.bindEvents();
    this.initRouter();
  },

  // Initialize browser routing
  initRouter() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      if (e.state) {
        this.handleRouteChange(e.state, false);
      } else {
        // No state, go to dashboard
        this.handleRouteChange({ view: "dashboard" }, false);
      }
    });

    // Handle initial URL on page load
    this.handleInitialRoute();
  },

  // Handle initial route from URL
  handleInitialRoute() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Parse route from URL
    if (path.startsWith("/stock/")) {
      const symbol = path.replace("/stock/", "").toUpperCase();
      if (symbol) {
        // Replace current state so we have proper history
        history.replaceState(
          { view: "stocks", stock: symbol },
          "",
          `/stock/${symbol}`,
        );
        // Navigate after login check completes
        setTimeout(() => {
          if (Storage.getCurrentUser()) {
            this.navigateTo("stocks", false);
            this.showStockDetail(symbol, false);
          }
        }, 100);
        return;
      }
    }

    // Map path to view
    const viewMap = {
      "/": "dashboard",
      "/dashboard": "dashboard",
      "/stocks": "stocks",
      "/portfolio": "portfolio",
      "/history": "history",
      "/leaderboard": "leaderboard",
      "/settings": "settings",
    };

    const view = viewMap[path] || "dashboard";
    history.replaceState({ view }, "", path === "/" ? "/" : `/${view}`);
  },

  // Handle route change (from popstate or navigation)
  handleRouteChange(state, updateHistory = true) {
    if (!Storage.getCurrentUser()) return;

    const { view, stock } = state;

    if (view === "stocks" && stock) {
      this.navigateTo("stocks", false);
      this.showStockDetail(stock, false);
    } else {
      this.navigateTo(view, false);
      // If going back from stock detail to stocks list, hide stock detail
      if (view === "stocks" && !stock) {
        document.getElementById("stock-detail").style.display = "none";
        document.getElementById("stocks-list-card").style.display = "block";
        document.getElementById("company-info-card").style.display = "none";
        document.getElementById("recommendations-card").style.display = "none";
        this.currentStock = null;
      }
    }
  },

  // Update browser URL
  pushRoute(view, stock = null) {
    let url, state;

    if (stock) {
      url = `/stock/${stock}`;
      state = { view, stock };
    } else {
      url = view === "dashboard" ? "/" : `/${view}`;
      state = { view };
    }

    history.pushState(state, "", url);
  },

  // Check if user is logged in
  checkLogin() {
    const username = Storage.getCurrentUser();
    if (username) {
      const userData = Storage.getUser(username);
      if (userData) {
        this.showApp();
        this.loadDashboard();
        return;
      }
    }
    this.showLogin();
  },

  // Show login screen
  showLogin() {
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("app").style.display = "none";
    this.loadUserList();
  },

  // Show main app
  showApp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    this.updateHeaderBalance();
  },

  // Load list of existing users
  loadUserList() {
    const users = Storage.getUsers();
    const usernames = Object.keys(users);
    const container = document.getElementById("existing-users");
    const list = document.getElementById("user-list");

    if (usernames.length > 0) {
      container.style.display = "block";
      list.innerHTML = usernames
        .map(
          (username) => `
        <li data-username="${username}">${username}</li>
      `,
        )
        .join("");
    } else {
      container.style.display = "none";
    }
  },

  // Bind all event listeners
  bindEvents() {
    // Login form
    document.getElementById("new-user-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      if (username) {
        this.login(username);
      }
    });

    // Existing user selection
    document.getElementById("user-list").addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        const username = e.target.dataset.username;
        this.login(username, false);
      }
    });

    // Logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      Storage.clearCurrentUser();
      this.showLogin();
    });

    // Navigation
    document.querySelectorAll(".nav-list a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = e.target.dataset.view;
        this.navigateTo(view);
      });
    });

    // Stock search
    const searchInput = document.getElementById("stock-search");
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      if (query.length >= 1) {
        searchTimeout = setTimeout(() => this.searchStocks(query), 300);
      } else {
        document.getElementById("search-results").classList.remove("active");
      }
    });

    // Close search results on click outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        document.getElementById("search-results").classList.remove("active");
      }
    });

    // Chart toggle
    document.querySelectorAll(".chart-toggle button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".chart-toggle button")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        const type = e.target.dataset.chart;
        if (this.stockCandles) {
          const range = this.currentChartRange || "1mo";
          if (type === "simple") {
            Charts.renderSimpleChart(this.stockCandles, range);
          } else {
            Charts.renderCandlestickChart(this.stockCandles, range);
          }
        }
      });
    });

    // Stock sort dropdown
    document.getElementById("stock-sort").addEventListener("change", (e) => {
      this.renderPopularStocks(e.target.value);
    });

    // Trade quantity input
    document.getElementById("trade-quantity").addEventListener("input", () => {
      this.updateTradeSummary();
    });

    // Buy button
    document.getElementById("btn-buy").addEventListener("click", () => {
      this.executeTrade("buy");
    });

    // Sell button
    document.getElementById("btn-sell").addEventListener("click", () => {
      this.executeTrade("sell");
    });

    // Settings
    document.getElementById("save-settings").addEventListener("click", () => {
      this.saveSettings();
    });

    document.getElementById("reset-account").addEventListener("click", () => {
      this.showConfirmModal(
        "Account resetten",
        "Weet je zeker dat je je account wilt resetten? Al je aandelen en transacties worden verwijderd.",
        async () => {
          const username = Storage.getCurrentUser();
          Storage.resetUser(username);
          // Remove from online scoreboard (score will be outdated)
          await Leaderboard.removeFromOnline(username);
          this.loadDashboard();
          this.showToast("Account gereset", "success");
        },
      );
    });

    document.getElementById("delete-account").addEventListener("click", () => {
      this.showConfirmModal(
        "Account verwijderen",
        "Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
        async () => {
          const username = Storage.getCurrentUser();
          // Remove from online scoreboard first
          await Leaderboard.removeFromOnline(username);
          Storage.deleteUser(username);
          Storage.clearCurrentUser();
          this.showLogin();
          this.showToast("Account verwijderd", "success");
        },
      );
    });

    // Modal
    document.getElementById("modal-cancel").addEventListener("click", () => {
      this.hideConfirmModal();
    });

    // Leaderboard toggle
    document.querySelectorAll(".leaderboard-toggle button").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        document
          .querySelectorAll(".leaderboard-toggle button")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");

        const type = e.target.dataset.leaderboard;
        document.getElementById("leaderboard-local").style.display =
          type === "local" ? "block" : "none";
        document.getElementById("leaderboard-online").style.display =
          type === "online" ? "block" : "none";

        if (type === "local") {
          await this.loadLocalRankings();
        } else {
          await this.loadOnlineRankings();
        }
      });
    });

    // Share score button
    document
      .getElementById("share-score")
      .addEventListener("click", async (e) => {
        const btn = e.target;
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = "Bezig...";
        try {
          await this.shareScore();
        } finally {
          btn.disabled = false;
          btn.textContent = "Score Delen";
        }
      });

    // Refresh online button
    document.getElementById("refresh-online").addEventListener("click", () => {
      this.loadOnlineRankings();
    });
  },

  // Login or create user
  login(username, isNew = true) {
    let userData = Storage.getUser(username);
    if (!userData && isNew) {
      userData = Storage.createUser(username);
    }
    if (userData) {
      Storage.setCurrentUser(username);
      this.showApp();
      this.loadDashboard();
    }
  },

  // Navigate to a view
  navigateTo(view, updateHistory = true) {
    this.currentView = view;

    // Update browser URL if needed
    if (updateHistory) {
      this.pushRoute(view);
    }

    // Update nav
    document.querySelectorAll(".nav-list a").forEach((link) => {
      link.classList.toggle("active", link.dataset.view === view);
    });

    // Update views
    document.querySelectorAll(".view").forEach((v) => {
      v.classList.toggle("active", v.id === `view-${view}`);
    });

    // Load view data
    switch (view) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "stocks":
        this.loadStocks();
        break;
      case "portfolio":
        this.loadPortfolio();
        break;
      case "history":
        this.loadHistory();
        break;
      case "settings":
        this.loadSettings();
        break;
      case "leaderboard":
        this.loadLeaderboard();
        break;
    }
  },

  // Update header balance
  updateHeaderBalance() {
    const balance = Portfolio.getBalance();
    document.getElementById("header-balance").textContent =
      Settings.formatCurrency(balance);
  },

  // Load dashboard
  async loadDashboard() {
    this.updateHeaderBalance();

    const balance = Portfolio.getBalance();
    document.getElementById("stat-balance").textContent =
      Settings.formatCurrency(balance);

    // Load portfolio value
    try {
      const portfolioValue = await Portfolio.calculatePortfolioValue();
      document.getElementById("stat-portfolio").textContent =
        Settings.formatCurrency(portfolioValue);

      const totalValue = balance + portfolioValue;
      document.getElementById("stat-total").textContent =
        Settings.formatCurrency(totalValue);

      const profitLoss = await Portfolio.calculateProfitLoss();
      const profitEl = document.getElementById("stat-profit");
      profitEl.textContent = Settings.formatCurrency(profitLoss);
      profitEl.className =
        "stat-value " + (profitLoss >= 0 ? "positive" : "negative");
    } catch (error) {
      console.error("Failed to calculate portfolio:", error);
    }

    // Load popular stocks
    this.loadPopularStocks();

    // Load market news
    this.loadMarketNews();
  },

  // Cached stocks for sorting
  cachedPopularStocks: null,

  // Load popular stocks
  async loadPopularStocks() {
    const container = document.getElementById("popular-stocks");
    container.innerHTML =
      '<li class="loading"><span class="spinner"></span> Laden...</li>';

    try {
      const stocks = await API.getPopularStocksWithPrices();
      this.cachedPopularStocks = stocks;

      // Get current sort option
      const sortSelect = document.getElementById("stock-sort");
      const sortBy = sortSelect ? sortSelect.value : "alphabetical";

      this.renderPopularStocks(sortBy);
    } catch (error) {
      container.innerHTML =
        '<li class="loading">Fout bij laden van aandelen</li>';
      console.error("Failed to load popular stocks:", error);
    }
  },

  // Sort and render popular stocks
  renderPopularStocks(sortBy) {
    const container = document.getElementById("popular-stocks");
    if (!this.cachedPopularStocks) return;

    let stocks = [...this.cachedPopularStocks];

    // Sort stocks based on selection
    switch (sortBy) {
      case "alphabetical":
        stocks.sort((a, b) => a.name.localeCompare(b.name));
        container.innerHTML = stocks
          .map((stock) => this.renderStockItem(stock))
          .join("");
        break;

      case "change":
        stocks.sort((a, b) => (b.percentChange || 0) - (a.percentChange || 0));
        container.innerHTML = stocks
          .map((stock) => this.renderStockItem(stock))
          .join("");
        break;

      case "sector":
        // Group by sector
        const sectors = {};
        stocks.forEach((stock) => {
          const companyInfo = getCompanyInfo(stock.symbol);
          const sector = companyInfo?.sector || "Overig";
          if (!sectors[sector]) sectors[sector] = [];
          sectors[sector].push(stock);
        });

        // Sort sectors by predefined order
        const sortedSectors = Object.keys(sectors).sort((a, b) => {
          return getSectorOrder(a) - getSectorOrder(b);
        });

        // Render with sector headers
        let html = "";
        sortedSectors.forEach((sector) => {
          html += `<li class="sector-header">${sector}</li>`;
          sectors[sector].forEach((stock) => {
            html += this.renderStockItem(stock);
          });
        });
        container.innerHTML = html;
        break;
    }

    // Add click handlers
    container.querySelectorAll(".stock-item").forEach((item) => {
      item.addEventListener("click", () => {
        const symbol = item.dataset.symbol;
        this.navigateTo("stocks");
        this.showStockDetail(symbol);
      });
    });
  },

  // Render a stock item
  renderStockItem(stock) {
    const changeClass = stock.percentChange >= 0 ? "positive" : "negative";
    const changeSign = stock.percentChange >= 0 ? "+" : "";
    const companyInfo = getCompanyInfo(stock.symbol);
    const logoHtml =
      companyInfo && companyInfo.logo
        ? `<img src="${companyInfo.logo}" alt="${stock.symbol}" class="stock-logo">`
        : '<div class="stock-logo-placeholder"></div>';
    return `
      <li class="stock-item" data-symbol="${stock.symbol}">
        ${logoHtml}
        <div class="stock-info">
          <span class="stock-symbol">${stock.symbol}</span>
          <span class="stock-name">${stock.name}${stock.description ? " - " + stock.description : ""}</span>
        </div>
        <div class="stock-price">
          <div class="stock-current-price">${Settings.formatCurrency(stock.currentPrice)}</div>
          <div class="stock-change ${changeClass}">${changeSign}${stock.percentChange?.toFixed(2) || 0}%</div>
        </div>
      </li>
    `;
  },

  // Load stocks view
  async loadStocks() {
    const container = document.getElementById("all-stocks");
    container.innerHTML =
      '<li class="loading"><span class="spinner"></span> Laden...</li>';

    try {
      const stocks = await API.getPopularStocksWithPrices();
      container.innerHTML = stocks
        .map((stock) => this.renderStockItem(stock))
        .join("");

      container.querySelectorAll(".stock-item").forEach((item) => {
        item.addEventListener("click", () => {
          const symbol = item.dataset.symbol;
          this.showStockDetail(symbol);
        });
      });
    } catch (error) {
      container.innerHTML =
        '<li class="loading">Fout bij laden van aandelen</li>';
    }
  },

  // Search stocks
  async searchStocks(query) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML =
      '<div class="loading"><span class="spinner"></span> Zoeken...</div>';
    resultsContainer.classList.add("active");

    try {
      // First check popular stocks
      const popular = API.popularStocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase()),
      );

      // Then search API
      const apiResults = await API.searchStocks(query);

      // Combine results, prioritizing popular stocks
      const combined = [
        ...popular,
        ...apiResults.filter(
          (r) => !popular.some((p) => p.symbol === r.symbol),
        ),
      ].slice(0, 10);

      if (combined.length === 0) {
        resultsContainer.innerHTML =
          '<div class="loading">Geen resultaten gevonden</div>';
        return;
      }

      resultsContainer.innerHTML = combined
        .map(
          (stock) => `
        <div class="stock-item" data-symbol="${stock.symbol}">
          <div class="stock-info">
            <span class="stock-symbol">${stock.symbol}</span>
            <span class="stock-name">${stock.name || stock.description || ""}</span>
          </div>
        </div>
      `,
        )
        .join("");

      resultsContainer.querySelectorAll(".stock-item").forEach((item) => {
        item.addEventListener("click", () => {
          const symbol = item.dataset.symbol;
          this.showStockDetail(symbol);
          resultsContainer.classList.remove("active");
          document.getElementById("stock-search").value = "";
        });
      });
    } catch (error) {
      resultsContainer.innerHTML = '<div class="loading">Fout bij zoeken</div>';
    }
  },

  // Load chart for specific range
  async loadChartForRange(range) {
    if (!this.currentStock) return;

    try {
      const candles = await API.getCandles(this.currentStock, range);
      this.stockCandles = candles;
      this.currentChartRange = range;

      if (candles && candles.length > 0) {
        // Update the change percentage based on the range
        this.updateChangeForRange(candles, range);

        if (Charts.currentType === "simple") {
          Charts.renderSimpleChart(candles, range);
        } else {
          Charts.renderCandlestickChart(candles, range);
        }
      } else {
        this.showChartUnavailable();
      }
    } catch (chartError) {
      console.log("Chart data not available:", chartError);
      this.showChartUnavailable();
    }
  },

  // Update change percentage based on selected range
  updateChangeForRange(candles, range) {
    if (!candles || candles.length < 2) return;

    const firstPrice = candles[0].close;
    const lastPrice = candles[candles.length - 1].close;
    const change = lastPrice - firstPrice;
    const percentChange = (change / firstPrice) * 100;

    // Get range label in Dutch
    const rangeLabels = {
      "1d": "vandaag",
      "5d": "deze week",
      "1mo": "deze maand",
      "6mo": "6 maanden",
      ytd: "dit jaar",
      "1y": "1 jaar",
      "5y": "5 jaar",
      max: "totaal",
    };
    const rangeLabel = rangeLabels[range] || "";

    const changeEl = document.getElementById("detail-change");
    const changeClass = percentChange >= 0 ? "positive" : "negative";
    const sign = percentChange >= 0 ? "+" : "";
    changeEl.textContent = `${sign}${percentChange.toFixed(2)}% ${rangeLabel}`;
    changeEl.className = "stock-change " + changeClass;
  },

  // Show chart unavailable message
  showChartUnavailable() {
    const container = document.getElementById("stock-chart");
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #807973; font-family: var(--font-sans); text-align: center; padding: 20px;">
        <div>
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div>Grafiek niet beschikbaar</div>
          <div style="font-size: 0.85rem; margin-top: 8px;">De gratis API ondersteunt geen historische data</div>
        </div>
      </div>
    `;
    this.stockCandles = null;
  },

  // Show stock detail
  async showStockDetail(symbol, updateHistory = true) {
    this.currentStock = symbol;

    document.getElementById("stock-detail").style.display = "block";
    document.getElementById("stocks-list-card").style.display = "none";

    // Update browser URL
    if (updateHistory) {
      this.pushRoute("stocks", symbol);
    }

    // Initialize chart container
    Charts.init("stock-chart");

    // Set up range change callback
    Charts.setRangeChangeCallback(async (range) => {
      await this.loadChartForRange(range);
    });

    // Load stock info
    const stockInfo = API.getStockInfo(symbol);
    document.getElementById("detail-symbol").textContent = symbol;
    document.getElementById("detail-name").textContent = stockInfo.name;

    // Load company info if available
    const companyInfo = getCompanyInfo(symbol);

    // Set logo in header
    const detailLogo = document.getElementById("detail-logo");
    if (companyInfo && companyInfo.logo) {
      detailLogo.src = companyInfo.logo;
      detailLogo.alt = companyInfo.name;
      detailLogo.style.display = "block";
    } else {
      detailLogo.style.display = "none";
    }
    const companyCard = document.getElementById("company-info-card");
    if (companyInfo) {
      companyCard.style.display = "block";
      document.getElementById("company-logo").src = companyInfo.logo;
      document.getElementById("company-logo").alt = companyInfo.name;
      document.getElementById("company-name").textContent = companyInfo.name;
      document.getElementById("company-country").textContent =
        companyInfo.country;
      document.getElementById("company-founded").textContent =
        companyInfo.founded;
      document.getElementById("company-description").textContent =
        companyInfo.description;
    } else {
      companyCard.style.display = "none";
    }

    try {
      // Get quote
      const quote = await API.getQuote(symbol);
      document.getElementById("detail-price").textContent =
        Settings.formatCurrency(quote.currentPrice);

      const changeEl = document.getElementById("detail-change");
      const changeClass = quote.percentChange >= 0 ? "positive" : "negative";
      changeEl.textContent = Settings.formatPercent(quote.percentChange);
      changeEl.className = "stock-change " + changeClass;

      // Update trade summary
      this.updateTradeSummary();

      // Load chart with default range
      await this.loadChartForRange("1mo");

      // Reset chart toggle
      document.querySelectorAll(".chart-toggle button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.chart === "simple");
      });

      // Load recommendations (don't await, load in background)
      this.loadRecommendations(symbol);
    } catch (error) {
      console.error("Failed to load stock details:", error);
      this.showToast("Fout bij laden van aandeel", "error");
    }
  },

  // Load market news for dashboard
  async loadMarketNews() {
    const content = document.getElementById("market-news-content");
    if (!content) return;

    content.innerHTML =
      '<div class="loading"><span class="spinner"></span> Laden...</div>';

    try {
      const news = await API.getMarketNews();

      if (news.rateLimited) {
        content.innerHTML =
          '<p class="unavailable-message">Nieuws tijdelijk niet beschikbaar (te veel verzoeken)</p>';
        return;
      }

      if (!news || news.length === 0) {
        content.innerHTML =
          '<p class="unavailable-message">Geen recent nieuws gevonden</p>';
        return;
      }

      content.innerHTML = `
        <ul class="news-list">
          ${news
            .map((item) => {
              const date = new Date(item.datetime * 1000);
              const timeAgo = this.getTimeAgo(date);
              return `
              <li class="news-item">
                <a href="${item.url}" target="_blank" rel="noopener">
                  <div class="news-headline">${item.headline}</div>
                  <div class="news-meta">${item.source} · ${timeAgo}</div>
                </a>
              </li>
            `;
            })
            .join("")}
        </ul>
      `;
    } catch (error) {
      console.error("Failed to load market news:", error);
      content.innerHTML =
        '<p class="unavailable-message">Kon nieuws niet laden</p>';
    }
  },

  // Load analyst recommendations
  async loadRecommendations(symbol) {
    const card = document.getElementById("recommendations-card");
    const content = document.getElementById("recommendations-content");

    card.style.display = "block";
    content.innerHTML =
      '<div class="loading"><span class="spinner"></span> Laden...</div>';

    try {
      const rec = await API.getRecommendations(symbol);

      if (rec && rec.rateLimited) {
        content.innerHTML =
          '<p class="unavailable-message">Aanbevelingen tijdelijk niet beschikbaar (te veel verzoeken)</p>';
        return;
      }

      if (!rec) {
        content.innerHTML =
          '<p class="unavailable-message">Geen aanbevelingen beschikbaar</p>';
        return;
      }

      const total =
        rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
      if (total === 0) {
        content.innerHTML =
          '<p class="unavailable-message">Geen aanbevelingen beschikbaar</p>';
        return;
      }

      // Calculate percentages
      const pctStrongBuy = (rec.strongBuy / total) * 100;
      const pctBuy = (rec.buy / total) * 100;
      const pctHold = (rec.hold / total) * 100;
      const pctSell = (rec.sell / total) * 100;
      const pctStrongSell = (rec.strongSell / total) * 100;

      content.innerHTML = `
        <div class="recommendations-bar">
          ${pctStrongBuy > 0 ? `<div class="segment strong-buy" style="width: ${pctStrongBuy}%">${rec.strongBuy}</div>` : ""}
          ${pctBuy > 0 ? `<div class="segment buy" style="width: ${pctBuy}%">${rec.buy}</div>` : ""}
          ${pctHold > 0 ? `<div class="segment hold" style="width: ${pctHold}%">${rec.hold}</div>` : ""}
          ${pctSell > 0 ? `<div class="segment sell" style="width: ${pctSell}%">${rec.sell}</div>` : ""}
          ${pctStrongSell > 0 ? `<div class="segment strong-sell" style="width: ${pctStrongSell}%">${rec.strongSell}</div>` : ""}
        </div>
        <div class="recommendations-legend">
          <span><div class="legend-dot" style="background: #0a6e0a"></div> Sterk kopen (${rec.strongBuy})</span>
          <span><div class="legend-dot" style="background: var(--ft-green)"></div> Kopen (${rec.buy})</span>
          <span><div class="legend-dot" style="background: #f0ad4e"></div> Houden (${rec.hold})</span>
          <span><div class="legend-dot" style="background: #e07070"></div> Verkopen (${rec.sell})</span>
          <span><div class="legend-dot" style="background: var(--ft-red)"></div> Sterk verkopen (${rec.strongSell})</span>
        </div>
        <div style="margin-top: var(--spacing-md); text-align: right;">
          <a href="https://finance.yahoo.com/quote/${symbol}/analysis" target="_blank" rel="noopener" style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--ft-blue);">Meer op Yahoo Finance &rarr;</a>
        </div>
      `;
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      content.innerHTML =
        '<p class="unavailable-message">Kon aanbevelingen niet laden</p>';
    }
  },

  // Get time ago string in Dutch
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "zojuist";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `${minutes} ${minutes === 1 ? "minuut" : "minuten"} geleden`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "uur" : "uur"} geleden`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ${days === 1 ? "dag" : "dagen"} geleden`;

    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weken"} geleden`;
  },

  // Update trade summary
  async updateTradeSummary() {
    if (!this.currentStock) return;

    const quantity =
      parseInt(document.getElementById("trade-quantity").value) || 0;

    try {
      const quote = await API.getQuote(this.currentStock);
      const price = quote.currentPrice;
      const fee = Settings.getFee(this.currentStock);
      const subtotal = quantity * price;
      const total = subtotal + fee;

      document.getElementById("summary-price").textContent =
        Settings.formatCurrency(price);
      document.getElementById("summary-quantity").textContent = quantity;
      document.getElementById("summary-subtotal").textContent =
        Settings.formatCurrency(subtotal);
      document.getElementById("summary-fee").textContent =
        Settings.formatCurrency(fee);
      document.getElementById("summary-total").textContent =
        Settings.formatCurrency(total);
    } catch (error) {
      console.error("Failed to update trade summary:", error);
    }
  },

  // Execute trade
  async executeTrade(type) {
    if (!this.currentStock) return;

    const quantity =
      parseInt(document.getElementById("trade-quantity").value) || 0;
    if (quantity <= 0) {
      this.showToast("Voer een geldig aantal in", "error");
      return;
    }

    try {
      const quote = await API.getQuote(this.currentStock);
      const price = quote.currentPrice;

      let result;
      if (type === "buy") {
        result = await Portfolio.buyStock(this.currentStock, quantity, price);
      } else {
        result = await Portfolio.sellStock(this.currentStock, quantity, price);
      }

      this.showToast(result.message, "success");
      this.updateHeaderBalance();
      this.updateTradeSummary();
    } catch (error) {
      this.showToast(error.message, "error");
    }
  },

  // Load portfolio view
  async loadPortfolio() {
    const emptyEl = document.getElementById("portfolio-empty");
    const contentEl = document.getElementById("portfolio-content");
    const listEl = document.getElementById("portfolio-list");

    const portfolio = Portfolio.getPortfolio();
    const hasStocks = Object.keys(portfolio).length > 0;

    emptyEl.style.display = hasStocks ? "none" : "block";
    contentEl.style.display = hasStocks ? "block" : "none";

    if (!hasStocks) return;

    listEl.innerHTML =
      '<div class="loading"><span class="spinner"></span> Laden...</div>';

    try {
      const detailed = await Portfolio.getDetailedPortfolio();
      listEl.innerHTML = detailed
        .map((item) => {
          const profitClass = item.profit >= 0 ? "positive" : "negative";
          return `
          <div class="portfolio-item" data-symbol="${item.symbol}">
            <div class="stock-info">
              <span class="stock-symbol">${item.symbol}</span>
              <span class="stock-name">${item.name}</span>
            </div>
            <div>${item.quantity}</div>
            <div>${Settings.formatCurrency(item.averagePrice)}</div>
            <div>${Settings.formatCurrency(item.currentValue)}</div>
            <div class="${profitClass}">
              ${Settings.formatCurrency(item.profit)}
              <br>
              <small>${Settings.formatPercent(item.profitPercent)}</small>
            </div>
          </div>
        `;
        })
        .join("");

      // Add click handlers
      listEl.querySelectorAll(".portfolio-item").forEach((item) => {
        item.addEventListener("click", () => {
          const symbol = item.dataset.symbol;
          this.navigateTo("stocks");
          this.showStockDetail(symbol);
        });
      });
    } catch (error) {
      listEl.innerHTML =
        '<div class="loading">Fout bij laden van portefeuille</div>';
    }
  },

  // Load history view
  loadHistory() {
    const transactions = Portfolio.getTransactions();
    const emptyEl = document.getElementById("history-empty");
    const tableEl = document.getElementById("history-table");
    const bodyEl = document.getElementById("history-body");

    if (transactions.length === 0) {
      emptyEl.style.display = "block";
      tableEl.style.display = "none";
      return;
    }

    emptyEl.style.display = "none";
    tableEl.style.display = "table";

    bodyEl.innerHTML = transactions
      .map((t) => {
        const typeLabel = t.type === "buy" ? "Koop" : "Verkoop";
        const typeClass = t.type === "buy" ? "negative" : "positive";
        return `
        <tr>
          <td>${Settings.formatDate(t.date)}</td>
          <td class="${typeClass}">${typeLabel}</td>
          <td>${t.symbol}</td>
          <td>${t.quantity}</td>
          <td>${Settings.formatCurrency(t.pricePerShare)}</td>
          <td>${Settings.formatCurrency(t.fee)}</td>
          <td class="${typeClass}">${Settings.formatCurrency(t.total)}</td>
        </tr>
      `;
      })
      .join("");
  },

  // Load settings view
  loadSettings() {
    const settings = Settings.get();
    const username = Storage.getCurrentUser();
    document.getElementById("settings-username").textContent = username;
    document.getElementById("fee-eu").value = settings.fees.eu;
    document.getElementById("fee-us").value = settings.fees.us;
    document.getElementById("starting-balance").value =
      settings.startingBalance;
  },

  // Save settings
  saveSettings() {
    const feeEu = parseFloat(document.getElementById("fee-eu").value) || 0;
    const feeUs = parseFloat(document.getElementById("fee-us").value) || 0;
    const startingBalance =
      parseFloat(document.getElementById("starting-balance").value) || 10000;

    Settings.save({
      fees: { eu: feeEu, us: feeUs },
      startingBalance,
    });

    this.showToast("Instellingen opgeslagen", "success");
  },

  // Show confirmation modal
  showConfirmModal(title, message, onConfirm) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-message").textContent = message;
    document.getElementById("confirm-modal").classList.add("active");

    const confirmBtn = document.getElementById("modal-confirm");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", () => {
      onConfirm();
      this.hideConfirmModal();
    });
  },

  // Hide confirmation modal
  hideConfirmModal() {
    document.getElementById("confirm-modal").classList.remove("active");
  },

  // Show toast notification
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  // Load leaderboard view
  async loadLeaderboard() {
    // Load local rankings by default
    await this.loadLocalRankings();
  },

  // Load local rankings
  async loadLocalRankings() {
    const container = document.getElementById("local-rankings");
    container.innerHTML =
      '<div class="loading"><span class="spinner"></span> Laden...</div>';

    try {
      const rankings = await Leaderboard.getLocalRankings();
      Leaderboard.renderTable(rankings, "local-rankings", false);
    } catch (error) {
      container.innerHTML =
        '<p class="no-data">Fout bij laden van ranglijst</p>';
      console.error("Failed to load local rankings:", error);
    }
  },

  // Load online rankings
  async loadOnlineRankings() {
    const container = document.getElementById("online-rankings");
    container.innerHTML =
      '<div class="loading"><span class="spinner"></span> Laden...</div>';

    try {
      const rankings = await Leaderboard.fetchOnlineScores();
      Leaderboard.renderTable(rankings, "online-rankings", true);
    } catch (error) {
      container.innerHTML =
        '<p class="no-data">Fout bij laden van online scores. Controleer je internetverbinding.</p>';
      console.error("Failed to load online rankings:", error);
    }
  },

  // Share score online
  async shareScore() {
    try {
      const score = await Leaderboard.uploadScore();
      this.showToast(
        `Score gedeeld! Portefeuille: ${Leaderboard.formatCurrency(score.portfolioValue)}`,
        "success",
      );
      // Refresh online rankings
      await this.loadOnlineRankings();
    } catch (error) {
      this.showToast(error.message || "Fout bij delen van score", "error");
      console.error("Failed to share score:", error);
    }
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
