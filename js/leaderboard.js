// Leaderboard module - Local rankings + JSONBin.io online sync
const Leaderboard = {
  // JSONBin.io configuration
  JSONBIN_BIN_ID: "695c271c43b1c97be91b5e68",
  JSONBIN_ACCESS_KEY:
    "$2a$10$qSSkvyDSSjqZBDbuYzDmzeRd2c99NQBjs36SA8aHEtCeZnNYuhv5O",

  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  SHARE_COOLDOWN: 10 * 60 * 1000, // 10 minutes

  // Cache storage
  onlineScoresCache: null,
  onlineScoresCacheTime: null,
  lastShareTime: {}, // Per user: { username: timestamp }

  // Get all local users and their portfolio stats
  async getLocalRankings() {
    const users = Storage.getAllUsers();
    const rankings = [];

    for (const username of users) {
      const userData = Storage.getUser(username);
      if (!userData) continue;

      const settings = Settings.get();
      const startingBalance = settings.startingBalance || 10000;

      // Calculate current portfolio value
      let stockValue = 0;
      if (userData.portfolio && Object.keys(userData.portfolio).length > 0) {
        // Get current prices for all stocks
        for (const symbol of Object.keys(userData.portfolio)) {
          const position = userData.portfolio[symbol];
          try {
            const quote = await API.getQuote(symbol);
            if (quote && quote.currentPrice) {
              stockValue += quote.currentPrice * position.quantity;
            }
          } catch (e) {
            // Use last known price if API fails
            stockValue += position.averagePrice * position.quantity;
          }
        }
      }

      const portfolioValue = userData.balance + stockValue;
      const totalProfit = portfolioValue - startingBalance;
      const profitPercent = (portfolioValue / startingBalance - 1) * 100;

      rankings.push({
        username,
        portfolioValue,
        totalProfit,
        profitPercent,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Sort by profit percentage (highest first)
    rankings.sort((a, b) => b.profitPercent - a.profitPercent);

    return rankings;
  },

  // Get current user's score for uploading
  async getCurrentUserScore() {
    const username = Storage.getCurrentUser();
    if (!username) return null;

    const rankings = await this.getLocalRankings();
    return rankings.find((r) => r.username === username);
  },

  // Check if cache is still valid
  isCacheValid() {
    if (!this.onlineScoresCache || !this.onlineScoresCacheTime) {
      return false;
    }
    return Date.now() - this.onlineScoresCacheTime < this.CACHE_DURATION;
  },

  // Get cache age in minutes
  getCacheAgeMinutes() {
    if (!this.onlineScoresCacheTime) return null;
    return Math.floor((Date.now() - this.onlineScoresCacheTime) / 60000);
  },

  // Fetch online scores from JSONBin (with caching)
  async fetchOnlineScores(forceRefresh = false) {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      return this.onlineScoresCache;
    }

    try {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${this.JSONBIN_BIN_ID}/latest`,
        {
          headers: {
            "X-Access-Key": this.JSONBIN_ACCESS_KEY,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Kon online scores niet ophalen");
      }

      const data = await response.json();
      const scores = data.record.scores || [];

      // Sort by profit percentage
      scores.sort((a, b) => b.profitPercent - a.profitPercent);

      // Update cache
      this.onlineScoresCache = scores;
      this.onlineScoresCacheTime = Date.now();

      return scores;
    } catch (error) {
      console.error("Error fetching online scores:", error);
      throw error;
    }
  },

  // Check if user can share (cooldown check)
  canShare(username) {
    const lastShare = this.lastShareTime[username];
    if (!lastShare) return true;
    return Date.now() - lastShare >= this.SHARE_COOLDOWN;
  },

  // Get remaining cooldown time in minutes
  getShareCooldownMinutes(username) {
    const lastShare = this.lastShareTime[username];
    if (!lastShare) return 0;
    const remaining = this.SHARE_COOLDOWN - (Date.now() - lastShare);
    return Math.max(0, Math.ceil(remaining / 60000));
  },

  // Upload current user's score to JSONBin
  async uploadScore() {
    const username = Storage.getCurrentUser();
    if (!username) {
      throw new Error("Geen gebruiker ingelogd");
    }

    // Check cooldown
    if (!this.canShare(username)) {
      const minutes = this.getShareCooldownMinutes(username);
      throw new Error(
        `Je kunt pas over ${minutes} ${minutes === 1 ? "minuut" : "minuten"} opnieuw delen`,
      );
    }

    const userScore = await this.getCurrentUserScore();
    if (!userScore) {
      throw new Error("Kon score niet berekenen");
    }

    try {
      // First fetch current scores (force refresh to get latest)
      const currentScores = await this.fetchOnlineScores(true);

      // Update or add user's score
      const existingIndex = currentScores.findIndex(
        (s) => s.username === userScore.username,
      );
      if (existingIndex >= 0) {
        currentScores[existingIndex] = userScore;
      } else {
        currentScores.push(userScore);
      }

      // Upload updated scores
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${this.JSONBIN_BIN_ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Access-Key": this.JSONBIN_ACCESS_KEY,
          },
          body: JSON.stringify({ scores: currentScores }),
        },
      );

      if (!response.ok) {
        throw new Error("Kon score niet uploaden");
      }

      // Update cooldown timer
      this.lastShareTime[username] = Date.now();

      // Update cache with new data
      this.onlineScoresCache = currentScores;
      this.onlineScoresCacheTime = Date.now();

      return userScore;
    } catch (error) {
      console.error("Error uploading score:", error);
      throw error;
    }
  },

  // Format currency for display
  formatCurrency(value) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  },

  // Format percentage for display
  formatPercent(value) {
    const sign = value >= 0 ? "+" : "";
    return sign + value.toFixed(2) + "%";
  },

  // Remove a user from the online scoreboard
  async removeFromOnline(username) {
    try {
      // First fetch current scores (force refresh)
      const currentScores = await this.fetchOnlineScores(true);

      // Filter out the user
      const updatedScores = currentScores.filter(
        (s) => s.username !== username,
      );

      // If no change, nothing to do
      if (updatedScores.length === currentScores.length) {
        return; // User wasn't on the online scoreboard
      }

      // Upload updated scores
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${this.JSONBIN_BIN_ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Access-Key": this.JSONBIN_ACCESS_KEY,
          },
          body: JSON.stringify({ scores: updatedScores }),
        },
      );

      if (!response.ok) {
        throw new Error("Kon score niet verwijderen van online ranglijst");
      }

      // Update cache
      this.onlineScoresCache = updatedScores;
      this.onlineScoresCacheTime = Date.now();

      return true;
    } catch (error) {
      console.error("Error removing from online scoreboard:", error);
      // Don't throw - this is a "nice to have", shouldn't block account deletion
      return false;
    }
  },

  // Render leaderboard table with last update time
  renderTable(scores, containerId, isOnline = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (scores.length === 0) {
      container.innerHTML = `<p class="no-data">${isOnline ? "Nog geen online scores. Deel je score!" : "Nog geen spelers."}</p>`;
      return;
    }

    const currentUser = Storage.getCurrentUser();

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Naam</th>
            <th>Waarde</th>
            <th>Winst/Verlies</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
    `;

    scores.forEach((score, index) => {
      const isCurrentUser = score.username === currentUser;
      const profitClass = score.totalProfit >= 0 ? "profit" : "loss";
      const rowClass = isCurrentUser ? "current-user" : "";

      html += `
        <tr class="${rowClass}">
          <td class="position">${index + 1}</td>
          <td class="username">${score.username}${isCurrentUser ? " (jij)" : ""}</td>
          <td class="value">${this.formatCurrency(score.portfolioValue)}</td>
          <td class="profit-loss ${profitClass}">${this.formatCurrency(score.totalProfit)}</td>
          <td class="percent ${profitClass}">${this.formatPercent(score.profitPercent)}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";

    // Add last update time for online scores
    if (isOnline && this.onlineScoresCacheTime) {
      const ageMinutes = this.getCacheAgeMinutes();
      let ageText;
      if (ageMinutes === 0) {
        ageText = "zojuist";
      } else if (ageMinutes === 1) {
        ageText = "1 minuut geleden";
      } else {
        ageText = `${ageMinutes} minuten geleden`;
      }
      html += `<p class="last-update">Laatst bijgewerkt: ${ageText}</p>`;
    }

    container.innerHTML = html;
  },
};
