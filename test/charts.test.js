// Tests for Charts helper functions used in zoom/pan functionality

// Mock the Charts object's helper functions for testing
const ChartHelpers = {
  INTRADAY_LIMIT_DAYS: 60,
  LOAD_MORE_THRESHOLD: 5,
  FETCH_PADDING_MULTIPLIER: 1.0,
  MIN_CANDLES_FETCH: 20,

  intervalOrder: ["5m", "15m", "1h", "1d", "1wk", "1mo"],

  getIntervalIndex(interval) {
    return this.intervalOrder.indexOf(interval);
  },

  getBestIntervalForTimespan(visibleSeconds) {
    const visibleDays = visibleSeconds / (24 * 60 * 60);
    if (visibleDays <= 2) return "5m";
    if (visibleDays <= 10) return "15m";
    if (visibleDays <= 60) return "1h";
    if (visibleDays <= 400) return "1d";
    if (visibleDays <= 2000) return "1wk";
    return "1mo";
  },

  // Thresholds with hysteresis to prevent flip-flopping
  thresholds: {
    "5m": { upper: 4 },
    "15m": { lower: 1, upper: 20 },
    "1h": { lower: 5, upper: 120 },
    "1d": { lower: 14, upper: 800 },
    "1wk": { lower: 200, upper: 4000 },
    "1mo": { lower: 1000 },
  },

  shouldSwitchInterval(currentInterval, bestInterval, visibleSeconds) {
    const currentIdx = this.getIntervalIndex(currentInterval);
    const bestIdx = this.getIntervalIndex(bestInterval);

    if (currentIdx === -1 || bestIdx === -1) return false;
    if (currentIdx === bestIdx) return false;

    const visibleDays = visibleSeconds / (24 * 60 * 60);
    const currentThresholds = this.thresholds[currentInterval];
    if (!currentThresholds) return false;

    // Check if we should zoom OUT (switch to coarser interval)
    if (
      bestIdx > currentIdx &&
      currentThresholds.upper &&
      visibleDays > currentThresholds.upper
    ) {
      return true;
    }

    // Check if we should zoom IN (switch to finer interval)
    if (
      bestIdx < currentIdx &&
      currentThresholds.lower &&
      visibleDays < currentThresholds.lower
    ) {
      return true;
    }

    return false;
  },

  getSecondsPerCandle(interval) {
    const secondsMap = {
      "5m": 5 * 60,
      "15m": 15 * 60,
      "1h": 60 * 60,
      "1d": 24 * 60 * 60,
      "1wk": 7 * 24 * 60 * 60,
      "1mo": 30 * 24 * 60 * 60,
    };
    return secondsMap[interval] || 24 * 60 * 60;
  },

  isIntradayInterval(interval) {
    return interval === "5m" || interval === "15m" || interval === "1h";
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

describe("Charts zoom/pan helpers", () => {
  describe("getBestIntervalForTimespan", () => {
    test("returns 5m for up to 2 days", () => {
      const twoDays = 2 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(twoDays)).toBe("5m");
      expect(ChartHelpers.getBestIntervalForTimespan(twoDays - 1)).toBe("5m");
      expect(ChartHelpers.getBestIntervalForTimespan(1 * 24 * 60 * 60)).toBe(
        "5m",
      );
    });

    test("returns 15m for 2-10 days", () => {
      const threeDays = 3 * 24 * 60 * 60;
      const tenDays = 10 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(threeDays)).toBe("15m");
      expect(ChartHelpers.getBestIntervalForTimespan(tenDays)).toBe("15m");
    });

    test("returns 1h for 10-60 days", () => {
      const fifteenDays = 15 * 24 * 60 * 60;
      const sixtyDays = 60 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(fifteenDays)).toBe("1h");
      expect(ChartHelpers.getBestIntervalForTimespan(sixtyDays)).toBe("1h");
    });

    test("returns 1d for 60-400 days", () => {
      const ninetyDays = 90 * 24 * 60 * 60;
      const fourHundredDays = 400 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(ninetyDays)).toBe("1d");
      expect(ChartHelpers.getBestIntervalForTimespan(fourHundredDays)).toBe(
        "1d",
      );
    });

    test("returns 1wk for 400-2000 days", () => {
      const fiveHundredDays = 500 * 24 * 60 * 60;
      const twoThousandDays = 2000 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(fiveHundredDays)).toBe(
        "1wk",
      );
      expect(ChartHelpers.getBestIntervalForTimespan(twoThousandDays)).toBe(
        "1wk",
      );
    });

    test("returns 1mo for more than 2000 days", () => {
      const threeThousandDays = 3000 * 24 * 60 * 60;
      expect(ChartHelpers.getBestIntervalForTimespan(threeThousandDays)).toBe(
        "1mo",
      );
    });
  });

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

  describe("interval transitions during zoom", () => {
    test("zooming out increases interval granularity", () => {
      // Simulate zooming out: visible time increases
      const intervals = [];
      const timeSpans = [
        1 * 24 * 60 * 60, // 1 day
        5 * 24 * 60 * 60, // 5 days
        30 * 24 * 60 * 60, // 30 days
        200 * 24 * 60 * 60, // 200 days
        1000 * 24 * 60 * 60, // 1000 days
        3000 * 24 * 60 * 60, // 3000 days
      ];

      for (const span of timeSpans) {
        intervals.push(ChartHelpers.getBestIntervalForTimespan(span));
      }

      expect(intervals).toEqual(["5m", "15m", "1h", "1d", "1wk", "1mo"]);
    });

    test("zooming in decreases interval granularity", () => {
      // Simulate zooming in: visible time decreases
      const intervals = [];
      const timeSpans = [
        3000 * 24 * 60 * 60, // 3000 days
        1000 * 24 * 60 * 60, // 1000 days
        200 * 24 * 60 * 60, // 200 days
        30 * 24 * 60 * 60, // 30 days
        5 * 24 * 60 * 60, // 5 days
        1 * 24 * 60 * 60, // 1 day
      ];

      for (const span of timeSpans) {
        intervals.push(ChartHelpers.getBestIntervalForTimespan(span));
      }

      expect(intervals).toEqual(["1mo", "1wk", "1d", "1h", "15m", "5m"]);
    });
  });

  describe("shouldSwitchInterval - directional threshold logic", () => {
    const days = (n) => n * 24 * 60 * 60;

    test("does not switch when current equals best", () => {
      expect(ChartHelpers.shouldSwitchInterval("1d", "1d", days(100))).toBe(
        false,
      );
    });

    test("does not switch from 1d to 1h when zooming OUT (20 days visible)", () => {
      // This was the bug: 20 days visible, best=1h, but we're at 1d
      // Zooming OUT should NOT go to finer interval
      const visibleSeconds = days(20);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1h"); // Best says 1h
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "1h", visibleSeconds),
      ).toBe(false); // But we should NOT switch
    });

    test("switches from 1d to 1wk when zooming OUT past threshold (900 days)", () => {
      const visibleSeconds = days(900);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1wk");
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "1wk", visibleSeconds),
      ).toBe(true); // Should switch to coarser (>800)
    });

    test("does not switch from 1d to 1wk when below threshold (700 days)", () => {
      const visibleSeconds = days(700);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1wk"); // Best says 1wk
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "1wk", visibleSeconds),
      ).toBe(false); // But threshold not met (need >800)
    });

    test("switches from 1d to 1h when zooming IN past threshold (10 days)", () => {
      const visibleSeconds = days(10);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("15m");
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "1h", visibleSeconds),
      ).toBe(true); // Should switch to finer (below 14 days)
    });

    test("does not switch from 1d to 1h when above threshold (50 days)", () => {
      const visibleSeconds = days(50);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1h"); // Best says 1h
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "1h", visibleSeconds),
      ).toBe(false); // But threshold not met (need <14)
    });

    test("switches from 1h to 1d when zooming OUT past threshold (150 days)", () => {
      const visibleSeconds = days(150);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1d");
      expect(
        ChartHelpers.shouldSwitchInterval("1h", "1d", visibleSeconds),
      ).toBe(true); // Should switch (>120 days)
    });

    test("switches from 1wk to 1mo when zooming OUT past threshold (4500 days)", () => {
      const visibleSeconds = days(4500);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1mo");
      expect(
        ChartHelpers.shouldSwitchInterval("1wk", "1mo", visibleSeconds),
      ).toBe(true); // (>4000 days)
    });

    test("switches from 1wk to 1d when zooming IN past threshold (150 days)", () => {
      const visibleSeconds = days(150);
      const best = ChartHelpers.getBestIntervalForTimespan(visibleSeconds);
      expect(best).toBe("1d");
      expect(
        ChartHelpers.shouldSwitchInterval("1wk", "1d", visibleSeconds),
      ).toBe(true); // Should switch (<200 days)
    });

    test("handles unknown intervals gracefully", () => {
      expect(
        ChartHelpers.shouldSwitchInterval("unknown", "1d", days(100)),
      ).toBe(false);
      expect(
        ChartHelpers.shouldSwitchInterval("1d", "unknown", days(100)),
      ).toBe(false);
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
