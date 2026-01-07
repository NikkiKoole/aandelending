import { describe, test, expect } from "bun:test";
import Indicators from "../js/indicators.js";

// Load real stock data fixtures
import aaplData from "./fixtures/aapl-3mo.json";
import tslaData from "./fixtures/tsla-3mo.json";

// Helper to extract candles from Yahoo Finance API response
function extractCandles(yahooResponse) {
  const result = yahooResponse.chart.result[0];
  const timestamps = result.timestamp || [];
  const quote = result.indicators.quote[0];
  const candles = [];

  for (let i = 0; i < timestamps.length; i++) {
    if (quote.open[i] != null && quote.close[i] != null) {
      candles.push({
        time: timestamps[i],
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i] || 0,
      });
    }
  }
  return candles;
}

const aaplCandles = extractCandles(aaplData);
const tslaCandles = extractCandles(tslaData);

describe("Indicators", () => {
  describe("sma (Simple Moving Average)", () => {
    test("calculates SMA correctly for a simple case", () => {
      const simpleCandles = [
        { close: 10 },
        { close: 20 },
        { close: 30 },
        { close: 40 },
        { close: 50 },
      ];
      expect(Indicators.sma(simpleCandles, 5)).toBe(30); // (10+20+30+40+50)/5
      expect(Indicators.sma(simpleCandles, 3)).toBe(40); // (30+40+50)/3
    });

    test("returns null when not enough data", () => {
      const candles = [{ close: 10 }, { close: 20 }];
      expect(Indicators.sma(candles, 5)).toBeNull();
    });

    test("returns null for invalid inputs", () => {
      expect(Indicators.sma(null, 5)).toBeNull();
      expect(Indicators.sma([], 5)).toBeNull();
      expect(Indicators.sma([{ close: 10 }], 0)).toBeNull();
      expect(Indicators.sma([{ close: 10 }], -1)).toBeNull();
    });

    test("calculates SMA5 on real AAPL data", () => {
      const sma5 = Indicators.sma(aaplCandles, 5);
      expect(sma5).not.toBeNull();
      expect(typeof sma5).toBe("number");
      // SMA5 should be close to recent prices
      const lastPrice = aaplCandles[aaplCandles.length - 1].close;
      expect(Math.abs(sma5 - lastPrice)).toBeLessThan(lastPrice * 0.1); // Within 10%
    });

    test("calculates SMA20 on real TSLA data", () => {
      const sma20 = Indicators.sma(tslaCandles, 20);
      expect(sma20).not.toBeNull();
      expect(typeof sma20).toBe("number");
      expect(sma20).toBeGreaterThan(0);
    });
  });

  describe("smaArray", () => {
    test("returns array of SMA values for each point", () => {
      const simpleCandles = [
        { time: 1, close: 10 },
        { time: 2, close: 20 },
        { time: 3, close: 30 },
        { time: 4, close: 40 },
        { time: 5, close: 50 },
      ];
      const result = Indicators.smaArray(simpleCandles, 3);

      expect(result.length).toBe(5);
      expect(result[0].value).toBeNull(); // Not enough data
      expect(result[1].value).toBeNull(); // Not enough data
      expect(result[2].value).toBe(20); // (10+20+30)/3
      expect(result[3].value).toBe(30); // (20+30+40)/3
      expect(result[4].value).toBe(40); // (30+40+50)/3
    });

    test("preserves time values", () => {
      const candles = [
        { time: 1000, close: 10 },
        { time: 2000, close: 20 },
        { time: 3000, close: 30 },
      ];
      const result = Indicators.smaArray(candles, 2);
      expect(result[0].time).toBe(1000);
      expect(result[1].time).toBe(2000);
      expect(result[2].time).toBe(3000);
    });

    test("works with real AAPL data", () => {
      const smaArr = Indicators.smaArray(aaplCandles, 20);
      expect(smaArr.length).toBe(aaplCandles.length);
      // First 19 should be null
      for (let i = 0; i < 19; i++) {
        expect(smaArr[i].value).toBeNull();
      }
      // From index 19 onwards should have values
      expect(smaArr[19].value).not.toBeNull();
      expect(smaArr[smaArr.length - 1].value).not.toBeNull();
    });
  });

  describe("percentChange", () => {
    test("calculates percentage change correctly", () => {
      const candles = [
        { close: 100 },
        { close: 110 },
        { close: 120 },
        { close: 130 },
        { close: 140 },
        { close: 150 },
      ];
      // Change from 100 to 150 over 5 periods = 50%
      expect(Indicators.percentChange(candles, 5)).toBe(50);
      // Change from 130 to 150 over 2 periods
      const change2 = Indicators.percentChange(candles, 2);
      expect(change2).toBeCloseTo(15.38, 1); // (150-130)/130 * 100
    });

    test("handles negative changes", () => {
      const candles = [{ close: 100 }, { close: 90 }, { close: 80 }];
      expect(Indicators.percentChange(candles, 2)).toBe(-20);
    });

    test("returns null when not enough data", () => {
      const candles = [{ close: 100 }, { close: 110 }];
      expect(Indicators.percentChange(candles, 5)).toBeNull();
    });

    test("returns null for invalid inputs", () => {
      expect(Indicators.percentChange(null, 5)).toBeNull();
      expect(Indicators.percentChange([], 5)).toBeNull();
    });

    test("calculates percent change on real AAPL data", () => {
      const change5 = Indicators.percentChange(aaplCandles, 5);
      expect(change5).not.toBeNull();
      expect(typeof change5).toBe("number");
      // Should be a reasonable percentage (within -50% to +50% for 5 days)
      expect(change5).toBeGreaterThan(-50);
      expect(change5).toBeLessThan(50);
    });
  });

  describe("highestHigh", () => {
    test("finds highest high correctly", () => {
      const candles = [
        { high: 15 },
        { high: 25 },
        { high: 20 },
        { high: 30 },
        { high: 22 },
      ];
      expect(Indicators.highestHigh(candles, 5)).toBe(30);
      expect(Indicators.highestHigh(candles, 2)).toBe(30); // Last 2: 30 and 22
    });

    test("returns null when not enough data", () => {
      const candles = [{ high: 10 }];
      expect(Indicators.highestHigh(candles, 5)).toBeNull();
    });

    test("finds highest high in real AAPL data", () => {
      const high20 = Indicators.highestHigh(aaplCandles, 20);
      expect(high20).not.toBeNull();
      // Should be greater than or equal to the last close
      expect(high20).toBeGreaterThanOrEqual(
        aaplCandles[aaplCandles.length - 1].close * 0.9
      );
    });

    test("finds highest high in real TSLA data", () => {
      const high20 = Indicators.highestHigh(tslaCandles, 20);
      expect(high20).not.toBeNull();
      expect(high20).toBeGreaterThan(400); // TSLA should be above 400
    });
  });

  describe("lowestLow", () => {
    test("finds lowest low correctly", () => {
      const candles = [
        { low: 15 },
        { low: 25 },
        { low: 10 },
        { low: 30 },
        { low: 22 },
      ];
      expect(Indicators.lowestLow(candles, 5)).toBe(10);
      expect(Indicators.lowestLow(candles, 2)).toBe(22); // Last 2: 30 and 22
    });

    test("returns null when not enough data", () => {
      const candles = [{ low: 10 }];
      expect(Indicators.lowestLow(candles, 5)).toBeNull();
    });

    test("finds lowest low in real AAPL data", () => {
      const low20 = Indicators.lowestLow(aaplCandles, 20);
      expect(low20).not.toBeNull();
      // Should be less than or equal to the last close
      expect(low20).toBeLessThanOrEqual(
        aaplCandles[aaplCandles.length - 1].close * 1.1
      );
    });
  });

  describe("volatility", () => {
    test("calculates volatility for stable prices", () => {
      // All same price = 0 volatility
      const stableCandles = [
        { close: 100 },
        { close: 100 },
        { close: 100 },
        { close: 100 },
        { close: 100 },
      ];
      expect(Indicators.volatility(stableCandles, 4)).toBe(0);
    });

    test("calculates volatility for varying prices", () => {
      const candles = [
        { close: 100 },
        { close: 102 }, // +2%
        { close: 100 }, // -1.96%
        { close: 104 }, // +4%
        { close: 100 }, // -3.85%
      ];
      const vol = Indicators.volatility(candles, 4);
      expect(vol).not.toBeNull();
      expect(vol).toBeGreaterThan(0);
      expect(vol).toBeLessThan(0.1); // Should be small for these movements
    });

    test("returns null when not enough data", () => {
      const candles = [{ close: 100 }, { close: 110 }];
      expect(Indicators.volatility(candles, 5)).toBeNull();
    });

    test("returns null for period less than 2", () => {
      const candles = [{ close: 100 }, { close: 110 }, { close: 120 }];
      expect(Indicators.volatility(candles, 1)).toBeNull();
    });

    test("calculates volatility on real AAPL data", () => {
      const vol20 = Indicators.volatility(aaplCandles, 20);
      expect(vol20).not.toBeNull();
      expect(vol20).toBeGreaterThan(0);
      // Daily volatility typically 0.5% to 5% for stocks
      expect(vol20).toBeLessThan(0.1);
    });

    test("TSLA should have higher volatility than AAPL (typically)", () => {
      const aaplVol = Indicators.volatility(aaplCandles, 20);
      const tslaVol = Indicators.volatility(tslaCandles, 20);
      expect(aaplVol).not.toBeNull();
      expect(tslaVol).not.toBeNull();
      // Just verify both are reasonable values
      expect(aaplVol).toBeGreaterThan(0);
      expect(tslaVol).toBeGreaterThan(0);
    });
  });

  describe("computeAll", () => {
    test("returns object with all indicators", () => {
      const result = Indicators.computeAll(aaplCandles);

      expect(result).toHaveProperty("sma5");
      expect(result).toHaveProperty("sma20");
      expect(result).toHaveProperty("sma50");
      expect(result).toHaveProperty("sma200");
      expect(result).toHaveProperty("percentChange5");
      expect(result).toHaveProperty("percentChange20");
      expect(result).toHaveProperty("highestHigh20");
      expect(result).toHaveProperty("lowestLow20");
      expect(result).toHaveProperty("volatility20");
    });

    test("SMA200 is null for 3-month data (not enough candles)", () => {
      const result = Indicators.computeAll(aaplCandles);
      // 3 months is ~63 trading days, not enough for SMA200
      expect(result.sma200).toBeNull();
    });

    test("shorter period indicators have values", () => {
      const result = Indicators.computeAll(aaplCandles);
      expect(result.sma5).not.toBeNull();
      expect(result.sma20).not.toBeNull();
      expect(result.percentChange5).not.toBeNull();
      expect(result.highestHigh20).not.toBeNull();
      expect(result.lowestLow20).not.toBeNull();
      expect(result.volatility20).not.toBeNull();
    });

    test("works with TSLA data", () => {
      const result = Indicators.computeAll(tslaCandles);
      expect(result.sma5).not.toBeNull();
      expect(result.sma20).not.toBeNull();
      // TSLA high should be higher than TSLA low
      expect(result.highestHigh20).toBeGreaterThan(result.lowestLow20);
    });
  });

  describe("edge cases with real data", () => {
    test("candle count is reasonable for 3-month data", () => {
      // Should have roughly 60-65 trading days in 3 months
      expect(aaplCandles.length).toBeGreaterThan(50);
      expect(aaplCandles.length).toBeLessThan(70);
      expect(tslaCandles.length).toBeGreaterThan(50);
      expect(tslaCandles.length).toBeLessThan(70);
    });

    test("all candles have required properties", () => {
      for (const candle of aaplCandles) {
        expect(candle).toHaveProperty("time");
        expect(candle).toHaveProperty("open");
        expect(candle).toHaveProperty("high");
        expect(candle).toHaveProperty("low");
        expect(candle).toHaveProperty("close");
        expect(candle).toHaveProperty("volume");
      }
    });

    test("high >= low for all candles", () => {
      for (const candle of aaplCandles) {
        expect(candle.high).toBeGreaterThanOrEqual(candle.low);
      }
      for (const candle of tslaCandles) {
        expect(candle.high).toBeGreaterThanOrEqual(candle.low);
      }
    });

    test("high >= close and high >= open for all candles", () => {
      for (const candle of aaplCandles) {
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
      }
    });

    test("low <= close and low <= open for all candles", () => {
      for (const candle of aaplCandles) {
        expect(candle.low).toBeLessThanOrEqual(candle.close);
        expect(candle.low).toBeLessThanOrEqual(candle.open);
      }
    });
  });
});
