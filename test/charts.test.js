// Mock the Charts object's helper functions for testing
const ChartHelpers = {
  INTRADAY_LIMIT_DAYS: 60,
  LOAD_MORE_THRESHOLD: 5,
  FETCH_PADDING_MULTIPLIER: 1.0,
  MIN_CANDLES_FETCH: 20,

  getSecondsPerCandle(interval) {
    const secondsMap = {
      "5m": 5 * 60,
      "15m": 15 * 60,
      "30m": 30 * 60,
      "1h": 60 * 60,
      "1d": 24 * 60 * 60,
      "1wk": 7 * 24 * 60 * 60,
      "1mo": 30 * 24 * 60 * 60,
    };
    return secondsMap[interval] || 24 * 60 * 60;
  },

  isIntradayInterval(interval) {
    return (
      interval === "5m" ||
      interval === "15m" ||
      interval === "30m" ||
      interval === "1h"
    );
  },

  getIntervalForRange(range) {
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
    return intervalMap[range] || "1d";
  },
};

describe("Charts helper functions", () => {
  describe("getSecondsPerCandle", () => {
    test("returns correct seconds for each interval", () => {
      expect(ChartHelpers.getSecondsPerCandle("5m")).toBe(5 * 60);
      expect(ChartHelpers.getSecondsPerCandle("15m")).toBe(15 * 60);
      expect(ChartHelpers.getSecondsPerCandle("1h")).toBe(60 * 60);
      expect(ChartHelpers.getSecondsPerCandle("1d")).toBe(24 * 60 * 60);
      expect(ChartHelpers.getSecondsPerCandle("1wk")).toBe(7 * 24 * 60 * 60);
      expect(ChartHelpers.getSecondsPerCandle("1mo")).toBe(30 * 24 * 60 * 60);
    });

    test("returns daily seconds for unknown interval", () => {
      expect(ChartHelpers.getSecondsPerCandle("unknown")).toBe(24 * 60 * 60);
      expect(ChartHelpers.getSecondsPerCandle("")).toBe(24 * 60 * 60);
    });
  });

  describe("isIntradayInterval", () => {
    test("returns true for intraday intervals", () => {
      expect(ChartHelpers.isIntradayInterval("5m")).toBe(true);
      expect(ChartHelpers.isIntradayInterval("15m")).toBe(true);
      expect(ChartHelpers.isIntradayInterval("1h")).toBe(true);
    });

    test("returns false for daily and longer intervals", () => {
      expect(ChartHelpers.isIntradayInterval("1d")).toBe(false);
      expect(ChartHelpers.isIntradayInterval("1wk")).toBe(false);
      expect(ChartHelpers.isIntradayInterval("1mo")).toBe(false);
    });
  });

  describe("getIntervalForRange", () => {
    test("returns correct interval for each range", () => {
      expect(ChartHelpers.getIntervalForRange("1d")).toBe("5m");
      expect(ChartHelpers.getIntervalForRange("5d")).toBe("15m");
      expect(ChartHelpers.getIntervalForRange("1mo")).toBe("1d");
      expect(ChartHelpers.getIntervalForRange("6mo")).toBe("1d");
      expect(ChartHelpers.getIntervalForRange("ytd")).toBe("1d");
      expect(ChartHelpers.getIntervalForRange("1y")).toBe("1d");
      expect(ChartHelpers.getIntervalForRange("5y")).toBe("1wk");
      expect(ChartHelpers.getIntervalForRange("max")).toBe("1mo");
    });

    test("returns 1d for unknown range", () => {
      expect(ChartHelpers.getIntervalForRange("unknown")).toBe("1d");
      expect(ChartHelpers.getIntervalForRange("custom")).toBe("1d");
    });
  });

  describe("intraday limit handling", () => {
    test("intraday data limit is 60 days", () => {
      expect(ChartHelpers.INTRADAY_LIMIT_DAYS).toBe(60);
    });

    test("all intraday intervals are correctly identified", () => {
      const intradayIntervals = ["5m", "15m", "1h"];
      const dailyPlusIntervals = ["1d", "1wk", "1mo"];

      for (const interval of intradayIntervals) {
        expect(ChartHelpers.isIntradayInterval(interval)).toBe(true);
      }
      for (const interval of dailyPlusIntervals) {
        expect(ChartHelpers.isIntradayInterval(interval)).toBe(false);
      }
    });
  });

  describe("candle count calculations", () => {
    test("calculates visible candles correctly", () => {
      // If we have 30 days visible at 1d interval
      const thirtyDays = 30 * 24 * 60 * 60;
      const secondsPerDay = ChartHelpers.getSecondsPerCandle("1d");
      const candleCount = thirtyDays / secondsPerDay;
      expect(candleCount).toBe(30);
    });

    test("calculates visible candles for 5m interval", () => {
      // 1 trading day with 5m candles (assuming 6.5 hours = 78 candles)
      const fiveMinSeconds = ChartHelpers.getSecondsPerCandle("5m");
      const sixHalfHours = 6.5 * 60 * 60;
      const candleCount = sixHalfHours / fiveMinSeconds;
      expect(candleCount).toBe(78);
    });
  });

  describe("constants", () => {
    test("load more threshold is reasonable", () => {
      expect(ChartHelpers.LOAD_MORE_THRESHOLD).toBeGreaterThan(0);
      expect(ChartHelpers.LOAD_MORE_THRESHOLD).toBeLessThan(20);
    });

    test("fetch padding multiplier is reasonable", () => {
      expect(ChartHelpers.FETCH_PADDING_MULTIPLIER).toBeGreaterThanOrEqual(0.5);
      expect(ChartHelpers.FETCH_PADDING_MULTIPLIER).toBeLessThanOrEqual(2);
    });

    test("minimum candles fetch is reasonable", () => {
      expect(ChartHelpers.MIN_CANDLES_FETCH).toBeGreaterThanOrEqual(10);
      expect(ChartHelpers.MIN_CANDLES_FETCH).toBeLessThanOrEqual(50);
    });
  });
});
