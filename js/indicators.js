/**
 * Technical indicators computed from candle data.
 * Each candle has: { time, open, high, low, close, volume }
 */
const Indicators = {
  /**
   * Simple Moving Average (SMA) over the last N candles.
   * Returns the average of closing prices for the last N candles.
   * @param {Array} candles - Array of candle objects with 'close' property
   * @param {number} period - Number of candles to average (e.g., 5, 20, 50, 200)
   * @returns {number|null} - The SMA value, or null if not enough data
   */
  sma(candles, period) {
    if (!candles || candles.length < period || period < 1) {
      return null;
    }
    const slice = candles.slice(-period);
    const sum = slice.reduce((acc, c) => acc + c.close, 0);
    return sum / period;
  },

  /**
   * Calculate SMA for each point in the candle array.
   * Useful for plotting MA lines on charts.
   * @param {Array} candles - Array of candle objects
   * @param {number} period - MA period
   * @returns {Array} - Array of { time, value } objects (null values where not enough data)
   */
  smaArray(candles, period) {
    if (!candles || period < 1) {
      return [];
    }
    return candles.map((candle, index) => {
      if (index < period - 1) {
        return { time: candle.time, value: null };
      }
      const slice = candles.slice(index - period + 1, index + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return { time: candle.time, value: sum / period };
    });
  },

  /**
   * Percentage change over the last N candles.
   * Compares the current close to the close N candles ago.
   * @param {Array} candles - Array of candle objects
   * @param {number} period - Number of candles to look back
   * @returns {number|null} - Percentage change (e.g., 5.25 for +5.25%), or null if not enough data
   */
  percentChange(candles, period) {
    if (!candles || candles.length < period + 1 || period < 1) {
      return null;
    }
    const currentPrice = candles[candles.length - 1].close;
    const pastPrice = candles[candles.length - 1 - period].close;
    if (pastPrice === 0) {
      return null;
    }
    return ((currentPrice - pastPrice) / pastPrice) * 100;
  },

  /**
   * Highest price (high) over the last N candles.
   * @param {Array} candles - Array of candle objects
   * @param {number} period - Number of candles to look back
   * @returns {number|null} - Highest high, or null if not enough data
   */
  highestHigh(candles, period) {
    if (!candles || candles.length < period || period < 1) {
      return null;
    }
    const slice = candles.slice(-period);
    return Math.max(...slice.map((c) => c.high));
  },

  /**
   * Lowest price (low) over the last N candles.
   * @param {Array} candles - Array of candle objects
   * @param {number} period - Number of candles to look back
   * @returns {number|null} - Lowest low, or null if not enough data
   */
  lowestLow(candles, period) {
    if (!candles || candles.length < period || period < 1) {
      return null;
    }
    const slice = candles.slice(-period);
    return Math.min(...slice.map((c) => c.low));
  },

  /**
   * Volatility: Standard deviation of daily returns over the last N candles.
   * Returns are calculated as (close - previous close) / previous close.
   * @param {Array} candles - Array of candle objects
   * @param {number} period - Number of candles to calculate volatility over
   * @returns {number|null} - Volatility as a decimal (e.g., 0.02 for 2%), or null if not enough data
   */
  volatility(candles, period) {
    if (!candles || candles.length < period + 1 || period < 2) {
      return null;
    }
    // Get the last (period + 1) candles so we can compute (period) returns
    const slice = candles.slice(-(period + 1));
    const returns = [];
    for (let i = 1; i < slice.length; i++) {
      const prevClose = slice[i - 1].close;
      if (prevClose === 0) continue;
      const dailyReturn = (slice[i].close - prevClose) / prevClose;
      returns.push(dailyReturn);
    }
    if (returns.length < 2) {
      return null;
    }
    // Calculate standard deviation
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
    return Math.sqrt(variance);
  },

  /**
   * Compute all indicators for a given candle array.
   * Useful for bots that want a snapshot of all metrics.
   * @param {Array} candles - Array of candle objects
   * @returns {Object} - Object containing all computed indicators
   */
  computeAll(candles) {
    return {
      sma5: this.sma(candles, 5),
      sma20: this.sma(candles, 20),
      sma50: this.sma(candles, 50),
      sma200: this.sma(candles, 200),
      percentChange5: this.percentChange(candles, 5),
      percentChange20: this.percentChange(candles, 20),
      highestHigh20: this.highestHigh(candles, 20),
      lowestLow20: this.lowestLow(candles, 20),
      volatility20: this.volatility(candles, 20),
    };
  },
};

// Export for both browser and Node.js/Bun environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = Indicators;
}
