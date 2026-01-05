// Portfolio and trading management

const Portfolio = {
  // Get current user data
  getUserData() {
    const username = Storage.getCurrentUser();
    if (!username) return null;
    return Storage.getUser(username);
  },

  // Save user data
  saveUserData(userData) {
    const username = Storage.getCurrentUser();
    if (username) {
      Storage.saveUser(username, userData);
    }
  },

  // Get balance
  getBalance() {
    const userData = this.getUserData();
    return userData ? userData.balance : 0;
  },

  // Get portfolio
  getPortfolio() {
    const userData = this.getUserData();
    return userData ? userData.portfolio : {};
  },

  // Get transactions
  getTransactions() {
    const userData = this.getUserData();
    return userData ? userData.transactions : [];
  },

  // Calculate portfolio value (needs current prices)
  async calculatePortfolioValue() {
    const portfolio = this.getPortfolio();
    const symbols = Object.keys(portfolio);

    if (symbols.length === 0) return 0;

    let totalValue = 0;
    for (const symbol of symbols) {
      try {
        const quote = await API.getQuote(symbol);
        const position = portfolio[symbol];
        totalValue += quote.currentPrice * position.quantity;
      } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error);
      }
    }
    return totalValue;
  },

  // Calculate total profit/loss
  async calculateProfitLoss() {
    const userData = this.getUserData();
    if (!userData) return 0;

    const portfolioValue = await this.calculatePortfolioValue();
    const totalValue = userData.balance + portfolioValue;
    return totalValue - userData.initialBalance;
  },

  // Buy stocks
  async buyStock(symbol, quantity, pricePerShare) {
    const userData = this.getUserData();
    if (!userData) throw new Error('Niet ingelogd');

    const fee = Settings.getFee(symbol);
    const subtotal = quantity * pricePerShare;
    const total = subtotal + fee;

    // Check if user has enough balance
    if (total > userData.balance) {
      throw new Error('Onvoldoende saldo');
    }

    // Update portfolio
    if (!userData.portfolio[symbol]) {
      userData.portfolio[symbol] = {
        quantity: 0,
        totalInvested: 0,
        averagePrice: 0,
      };
    }

    const position = userData.portfolio[symbol];
    const newQuantity = position.quantity + quantity;
    const newTotalInvested = position.totalInvested + subtotal;

    position.quantity = newQuantity;
    position.totalInvested = newTotalInvested;
    position.averagePrice = newTotalInvested / newQuantity;

    // Update balance
    userData.balance -= total;

    // Record transaction
    userData.transactions.unshift({
      id: Date.now(),
      type: 'buy',
      symbol,
      quantity,
      pricePerShare,
      fee,
      total,
      date: new Date().toISOString(),
    });

    this.saveUserData(userData);

    return {
      success: true,
      message: `${quantity}x ${symbol} gekocht voor ${Settings.formatCurrency(total)}`,
    };
  },

  // Sell stocks
  async sellStock(symbol, quantity, pricePerShare) {
    const userData = this.getUserData();
    if (!userData) throw new Error('Niet ingelogd');

    const position = userData.portfolio[symbol];
    if (!position || position.quantity < quantity) {
      throw new Error('Onvoldoende aandelen');
    }

    const fee = Settings.getFee(symbol);
    const subtotal = quantity * pricePerShare;
    const total = subtotal - fee;

    // Update portfolio
    position.quantity -= quantity;
    position.totalInvested -= quantity * position.averagePrice;

    // Remove position if quantity is 0
    if (position.quantity === 0) {
      delete userData.portfolio[symbol];
    }

    // Update balance
    userData.balance += total;

    // Record transaction
    userData.transactions.unshift({
      id: Date.now(),
      type: 'sell',
      symbol,
      quantity,
      pricePerShare,
      fee,
      total,
      date: new Date().toISOString(),
    });

    this.saveUserData(userData);

    return {
      success: true,
      message: `${quantity}x ${symbol} verkocht voor ${Settings.formatCurrency(total)}`,
    };
  },

  // Get position for a stock
  getPosition(symbol) {
    const portfolio = this.getPortfolio();
    return portfolio[symbol] || null;
  },

  // Get detailed portfolio with current values
  async getDetailedPortfolio() {
    const portfolio = this.getPortfolio();
    const symbols = Object.keys(portfolio);

    if (symbols.length === 0) return [];

    const detailed = [];
    for (const symbol of symbols) {
      const position = portfolio[symbol];
      try {
        const quote = await API.getQuote(symbol);
        const stockInfo = API.getStockInfo(symbol);
        const currentValue = quote.currentPrice * position.quantity;
        const profit = currentValue - position.totalInvested;
        const profitPercent = (profit / position.totalInvested) * 100;

        detailed.push({
          symbol,
          name: stockInfo.name,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          currentPrice: quote.currentPrice,
          currentValue,
          profit,
          profitPercent,
        });
      } catch (error) {
        console.error(`Failed to get details for ${symbol}:`, error);
        detailed.push({
          symbol,
          name: symbol,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          currentPrice: 0,
          currentValue: 0,
          profit: 0,
          profitPercent: 0,
        });
      }
    }

    return detailed;
  },
};
