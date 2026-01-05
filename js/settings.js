// Settings management

const Settings = {
  // Default settings
  defaults: {
    startingBalance: 10000,
    fees: {
      eu: 3.00,  // €3 for EU stocks (Degiro style)
      us: 2.00,  // €2 for US stocks
    },
    currency: 'EUR',
  },

  // Get defaults
  getDefaults() {
    return { ...this.defaults };
  },

  // Get current settings (or defaults if not set)
  get() {
    const saved = Storage.getSettings();
    if (saved) {
      return { ...this.defaults, ...saved };
    }
    return this.getDefaults();
  },

  // Save settings
  save(newSettings) {
    const current = this.get();
    const updated = { ...current, ...newSettings };
    Storage.saveSettings(updated);
    return updated;
  },

  // Get fee for a stock based on market
  getFee(symbol) {
    const settings = this.get();
    // Simple logic: if symbol ends with .AS, .DE, .PA etc. it's EU
    // Otherwise assume US
    const euSuffixes = ['.AS', '.DE', '.PA', '.L', '.MI', '.MC', '.SW'];
    const isEU = euSuffixes.some(suffix => symbol.toUpperCase().endsWith(suffix));
    return isEU ? settings.fees.eu : settings.fees.us;
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  },

  // Format percentage
  formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
  },

  // Format date
  formatDate(dateString) {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  },

  // Format short date
  formatShortDate(dateString) {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(dateString));
  },
};
