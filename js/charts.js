// Chart rendering

const Charts = {
  // Current chart instance
  chartInstance: null,
  currentType: "simple",
  currentRange: "1mo",
  candles: null,
  onRangeChange: null,
  showTrendlines: false,
  // Indicator settings
  indicators: {
    ma5: false,
    ma20: false,
    ma50: false,
    ma200: false,
    ema20: false,
    bollinger: false,
  },
  // Store indicator series references for cleanup
  indicatorSeries: {},

  // Colors
  colors: {
    line: "#0D7680",
    up: "#0A8A0A",
    down: "#CC0000",
    background: "#FFFFFF",
    grid: "#E8E8E8",
    gridLight: "#F5F5F5",
    text: "#807973",
    textDark: "#333333",
    trendUp: "#0A8A0A", // Green for uptrend support
    trendDown: "#CC0000", // Red for downtrend resistance
    ma5: "#4CAF50", // Green for 5-day MA
    ma20: "#FF9800", // Orange for 20-day MA
    ma50: "#2196F3", // Blue for 50-day MA
    ma200: "#9C27B0", // Purple for 200-day MA
    ema20: "#E91E63", // Pink for 20-day EMA
    bollingerUpper: "#78909C", // Blue-grey for Bollinger upper
    bollingerLower: "#78909C", // Blue-grey for Bollinger lower
    bollingerFill: "rgba(120, 144, 156, 0.1)", // Light fill between bands
  },

  // Find local minimums (troughs) in price data
  findTroughs(candles, windowSize = 5) {
    const troughs = [];
    for (let i = windowSize; i < candles.length - windowSize; i++) {
      const low = candles[i].low;
      let isTrough = true;
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && candles[j].low < low) {
          isTrough = false;
          break;
        }
      }
      if (isTrough) {
        troughs.push({ index: i, price: low, time: candles[i].time });
      }
    }
    return troughs;
  },

  // Find local maximums (peaks) in price data
  findPeaks(candles, windowSize = 5) {
    const peaks = [];
    for (let i = windowSize; i < candles.length - windowSize; i++) {
      const high = candles[i].high;
      let isPeak = true;
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && candles[j].high > high) {
          isPeak = false;
          break;
        }
      }
      if (isPeak) {
        peaks.push({ index: i, price: high, time: candles[i].time });
      }
    }
    return peaks;
  },

  // Calculate trendline using two points
  calculateTrendline(point1, point2, totalCandles) {
    const slope = (point2.price - point1.price) / (point2.index - point1.index);
    const intercept = point1.price - slope * point1.index;

    // Calculate start and end points for the line
    const startY = intercept;
    const endY = slope * (totalCandles - 1) + intercept;

    return {
      startIndex: 0,
      endIndex: totalCandles - 1,
      startPrice: startY,
      endPrice: endY,
      slope,
      intercept,
    };
  },

  // Find best uptrend line (connecting lows)
  findUptrendLine(candles) {
    if (candles.length < 10) return null;

    const windowSize = Math.max(3, Math.floor(candles.length / 20));
    const troughs = this.findTroughs(candles, windowSize);

    if (troughs.length < 2) return null;

    // Find two significant troughs that form an upward slope
    // Start from earlier troughs and find a valid uptrend
    let bestLine = null;
    let bestScore = -Infinity;

    for (let i = 0; i < troughs.length - 1; i++) {
      for (let j = i + 1; j < troughs.length; j++) {
        const t1 = troughs[i];
        const t2 = troughs[j];

        // Must be upward sloping
        if (t2.price <= t1.price) continue;

        const line = this.calculateTrendline(t1, t2, candles.length);

        // Check if line stays below most candles (valid support)
        let validSupport = true;
        let touchCount = 0;

        for (let k = 0; k < candles.length; k++) {
          const linePrice = line.slope * k + line.intercept;
          const candleLow = candles[k].low;

          // Line should not be above the lows (with small tolerance)
          if (linePrice > candleLow * 1.02) {
            validSupport = false;
            break;
          }

          // Count touches (within 2% of the line)
          if (Math.abs(candleLow - linePrice) / linePrice < 0.02) {
            touchCount++;
          }
        }

        if (validSupport && touchCount >= 2) {
          const score = touchCount + (t2.index - t1.index) / candles.length;
          if (score > bestScore) {
            bestScore = score;
            bestLine = line;
          }
        }
      }
    }

    return bestLine;
  },

  // Find best downtrend line (connecting highs)
  findDowntrendLine(candles) {
    if (candles.length < 10) return null;

    const windowSize = Math.max(3, Math.floor(candles.length / 20));
    const peaks = this.findPeaks(candles, windowSize);

    if (peaks.length < 2) return null;

    let bestLine = null;
    let bestScore = -Infinity;

    for (let i = 0; i < peaks.length - 1; i++) {
      for (let j = i + 1; j < peaks.length; j++) {
        const p1 = peaks[i];
        const p2 = peaks[j];

        // Must be downward sloping
        if (p2.price >= p1.price) continue;

        const line = this.calculateTrendline(p1, p2, candles.length);

        // Check if line stays above most candles (valid resistance)
        let validResistance = true;
        let touchCount = 0;

        for (let k = 0; k < candles.length; k++) {
          const linePrice = line.slope * k + line.intercept;
          const candleHigh = candles[k].high;

          // Line should not be below the highs (with small tolerance)
          if (linePrice < candleHigh * 0.98) {
            validResistance = false;
            break;
          }

          // Count touches
          if (Math.abs(candleHigh - linePrice) / linePrice < 0.02) {
            touchCount++;
          }
        }

        if (validResistance && touchCount >= 2) {
          const score = touchCount + (p2.index - p1.index) / candles.length;
          if (score > bestScore) {
            bestScore = score;
            bestLine = line;
          }
        }
      }
    }

    return bestLine;
  },

  // Detect overall trend direction
  detectTrend(candles) {
    if (candles.length < 2) return "neutral";
    const firstPrice = candles[0].close;
    const lastPrice = candles[candles.length - 1].close;
    const change = (lastPrice - firstPrice) / firstPrice;

    if (change > 0.02) return "up";
    if (change < -0.02) return "down";
    return "neutral";
  },

  // Calculate Simple Moving Average for chart overlay
  // Returns array of { time, value } for Lightweight Charts line series
  calculateSMA(candles, period) {
    const result = [];
    let sum = 0;
    const window = [];

    for (let i = 0; i < candles.length; i++) {
      const close = candles[i].close;
      window.push(close);
      sum += close;

      if (window.length > period) {
        sum -= window.shift();
      }

      if (window.length === period) {
        result.push({
          time: candles[i].time,
          value: sum / period,
        });
      }
    }
    return result;
  },

  // Calculate Exponential Moving Average for chart overlay
  // EMA gives more weight to recent prices
  calculateEMA(candles, period) {
    const result = [];
    const k = 2 / (period + 1); // Smoothing factor
    let ema = null;

    for (let i = 0; i < candles.length; i++) {
      const close = candles[i].close;

      if (ema === null) {
        // Seed with first value
        ema = close;
      } else {
        // EMA = (Close - Previous EMA) * k + Previous EMA
        ema = close * k + ema * (1 - k);
      }

      // Only start outputting after we have enough data points
      if (i >= period - 1) {
        result.push({
          time: candles[i].time,
          value: ema,
        });
      }
    }
    return result;
  },

  // Get the interval for a given range
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

  // Convert a "trading days" period to the appropriate candle count for the current interval
  // E.g., MA20 (20 trading days) on weekly data = 4 candles
  getAdjustedPeriod(tradingDaysPeriod, range) {
    const interval = this.getIntervalForRange(range);

    // How many trading days does each candle represent?
    const daysPerCandle = {
      "5m": 1 / 78, // ~78 5-min candles per trading day
      "15m": 1 / 26, // ~26 15-min candles per trading day
      "1d": 1, // 1 candle = 1 trading day
      "1wk": 5, // 1 candle = 5 trading days
      "1mo": 21, // 1 candle = ~21 trading days
    };

    const multiplier = daysPerCandle[interval] || 1;
    const adjustedPeriod = Math.round(tradingDaysPeriod / multiplier);

    // Return at least 2 (minimum for a meaningful average)
    return Math.max(2, adjustedPeriod);
  },

  // Check if MAs should be enabled for the current range
  // Disable for intraday views where MAs don't make sense
  areMAsEnabledForRange(range) {
    const interval = this.getIntervalForRange(range);
    // Disable for intraday intervals
    return interval !== "5m" && interval !== "15m";
  },

  // Calculate Bollinger Bands (SMA20 with upper and lower bands at 2 standard deviations)
  calculateBollingerBands(candles, period = 20, stdDev = 2) {
    const upper = [];
    const lower = [];
    const middle = [];

    for (let i = period - 1; i < candles.length; i++) {
      // Get the window of closes
      const windowCloses = [];
      for (let j = i - period + 1; j <= i; j++) {
        windowCloses.push(candles[j].close);
      }

      // Calculate SMA (middle band)
      const sma = windowCloses.reduce((a, b) => a + b, 0) / period;

      // Calculate standard deviation
      const squaredDiffs = windowCloses.map((c) => Math.pow(c - sma, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);

      const time = candles[i].time;
      middle.push({ time, value: sma });
      upper.push({ time, value: sma + stdDev * std });
      lower.push({ time, value: sma - stdDev * std });
    }

    return { upper, middle, lower };
  },

  // Time ranges
  ranges: [
    { key: "1d", label: "1D", interval: "5m" },
    { key: "5d", label: "5D", interval: "15m" },
    { key: "1mo", label: "1M", interval: "1d" },
    { key: "6mo", label: "6M", interval: "1d" },
    { key: "ytd", label: "YTD", interval: "1d" },
    { key: "1y", label: "1J", interval: "1d" },
    { key: "5y", label: "5J", interval: "1wk" },
    { key: "max", label: "Max", interval: "1mo" },
  ],

  // Initialize chart container
  init(containerId) {
    this.container = document.getElementById(containerId);
  },

  // Set range change callback
  setRangeChangeCallback(callback) {
    this.onRangeChange = callback;
  },

  // Clear existing chart
  clear() {
    if (this.chartInstance) {
      if (this.chartInstance.remove) {
        this.chartInstance.remove();
      }
      this.chartInstance = null;
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  },

  // Format date based on range
  formatDateForRange(timestamp, range) {
    const date = new Date(timestamp * 1000);
    const options = { month: "short", day: "numeric" };

    if (range === "1d" || range === "5d") {
      return date.toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (range === "5y" || range === "max") {
      return date.toLocaleDateString("nl-NL", {
        month: "short",
        year: "2-digit",
      });
    }
    return date.toLocaleDateString("nl-NL", options);
  },

  // Format full date for tooltip
  formatFullDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  // Render simple line chart with range selector and tooltip
  renderSimpleChart(candles, range = "1mo") {
    this.clear();
    this.currentType = "simple";
    this.currentRange = range;
    this.candles = candles;

    if (!candles || candles.length === 0) {
      this.container.innerHTML =
        '<div class="loading">Geen data beschikbaar</div>';
      return;
    }

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "display: flex; flex-direction: column; height: 100%;";

    // Create range selector
    const rangeSelector = document.createElement("div");
    rangeSelector.style.cssText =
      "display: flex; gap: 4px; padding: 8px 0; border-bottom: 1px solid #E8E8E8; margin-bottom: 8px;";

    this.ranges.forEach((r) => {
      const btn = document.createElement("button");
      btn.textContent = r.label;
      btn.dataset.range = r.key;
      const isActive = r.key === range;
      btn.style.cssText = `
        padding: 6px 12px;
        border: none;
        background: ${isActive ? "#F0F0F0" : "transparent"};
        color: ${isActive ? "#0D7680" : "#807973"};
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: ${isActive ? "600" : "400"};
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
      `;
      if (isActive) {
        btn.style.borderBottom = "2px solid #0D7680";
      }
      btn.addEventListener("click", () => {
        if (this.onRangeChange) {
          this.onRangeChange(r.key);
        }
      });
      btn.addEventListener("mouseenter", () => {
        if (r.key !== this.currentRange) {
          btn.style.background = "#F5F5F5";
        }
      });
      btn.addEventListener("mouseleave", () => {
        if (r.key !== this.currentRange) {
          btn.style.background = "transparent";
        }
      });
      rangeSelector.appendChild(btn);
    });

    wrapper.appendChild(rangeSelector);

    // Create chart container
    const chartWrapper = document.createElement("div");
    chartWrapper.style.cssText = "flex: 1; position: relative; min-height: 0;";

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width: 100%; height: 100%;";
    chartWrapper.appendChild(canvas);

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #E8E8E8;
      border-radius: 4px;
      padding: 8px 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 10;
    `;
    chartWrapper.appendChild(tooltip);

    // Create hover dot
    const hoverDot = document.createElement("div");
    hoverDot.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      transform: translate(-50%, -50%);
    `;
    chartWrapper.appendChild(hoverDot);

    // Create vertical line
    const verticalLine = document.createElement("div");
    verticalLine.style.cssText = `
      position: absolute;
      width: 1px;
      background: #CCCCCC;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
    `;
    chartWrapper.appendChild(verticalLine);

    wrapper.appendChild(chartWrapper);
    this.container.appendChild(wrapper);

    // Setup canvas
    const ctx = canvas.getContext("2d");
    const rect = chartWrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 70, bottom: 35, left: 10 };
    const width = rect.width - padding.left - padding.right;
    const height = rect.height - padding.top - padding.bottom;

    // Get price range with some padding
    const prices = candles.map((c) => c.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const pricePadding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05;
    const adjustedMin = minPrice - pricePadding;
    const adjustedMax = maxPrice + pricePadding;
    const priceRange = adjustedMax - adjustedMin;

    // Calculate scale
    const xScale = width / (candles.length - 1 || 1);
    const yScale = height / priceRange;

    // Determine if up or down
    const isUp = prices[prices.length - 1] >= prices[0];
    const lineColor = isUp ? this.colors.up : this.colors.down;

    // Draw background
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw horizontal grid lines (dashed)
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + width, y);
      ctx.stroke();

      // Price labels on the right
      const price = adjustedMax - (priceRange / gridLines) * i;
      ctx.fillStyle = this.colors.text;
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(this.formatPrice(price), padding.left + width + 8, y + 4);
    }
    ctx.setLineDash([]);

    // Calculate points for the line
    const points = candles.map((candle, i) => ({
      x: padding.left + i * xScale,
      y: padding.top + (adjustedMax - candle.close) * yScale,
      candle: candle,
    }));

    // Draw gradient fill under line
    const gradient = ctx.createLinearGradient(
      0,
      padding.top,
      0,
      padding.top + height,
    );
    if (isUp) {
      gradient.addColorStop(0, "rgba(10, 138, 10, 0.15)");
      gradient.addColorStop(1, "rgba(10, 138, 10, 0.02)");
    } else {
      gradient.addColorStop(0, "rgba(204, 0, 0, 0.15)");
      gradient.addColorStop(1, "rgba(204, 0, 0, 0.02)");
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point, i) => {
      if (i > 0) ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + height);
    ctx.lineTo(points[0].x, padding.top + height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw Trendline
    if (this.showTrendlines && candles.length >= 10) {
      const trend = this.detectTrend(candles);
      let trendline = null;
      let trendColor = null;

      if (trend === "up") {
        trendline = this.findUptrendLine(candles);
        trendColor = this.colors.trendUp;
      } else if (trend === "down") {
        trendline = this.findDowntrendLine(candles);
        trendColor = this.colors.trendDown;
      }

      if (trendline) {
        ctx.strokeStyle = trendColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        const startX = padding.left + trendline.startIndex * xScale;
        const startY =
          padding.top + (adjustedMax - trendline.startPrice) * yScale;
        const endX = padding.left + trendline.endIndex * xScale;
        const endY = padding.top + (adjustedMax - trendline.endPrice) * yScale;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw date labels
    ctx.fillStyle = this.colors.text;
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";

    const labelCount = Math.min(6, candles.length);
    const step = Math.max(1, Math.floor(candles.length / labelCount));
    for (let i = 0; i < candles.length; i += step) {
      const x = padding.left + i * xScale;
      const label = this.formatDateForRange(candles[i].time, range);
      ctx.fillText(label, x, rect.height - 8);
    }
    // Always show last date
    if (candles.length > 1) {
      const lastX = padding.left + (candles.length - 1) * xScale;
      const lastLabel = this.formatDateForRange(
        candles[candles.length - 1].time,
        range,
      );
      ctx.fillText(lastLabel, lastX, rect.height - 8);
    }

    // Draw legend for trendline
    if (this.showTrendlines && candles.length >= 10) {
      const trend = this.detectTrend(candles);
      if (trend !== "neutral") {
        const legendY = padding.top + 12;
        const trendColor =
          trend === "up" ? this.colors.trendUp : this.colors.trendDown;
        const trendLabel = trend === "up" ? "Steun" : "Weerstand";

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = trendColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, legendY - 3);
        ctx.lineTo(padding.left + 20, legendY - 3);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = this.colors.text;
        ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(trendLabel, padding.left + 25, legendY);
      }
    }

    // Mouse interaction
    const handleMouseMove = (e) => {
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Find closest point
      let closestPoint = null;
      let closestDist = Infinity;
      let closestIndex = -1;

      points.forEach((point, i) => {
        const dist = Math.abs(mouseX - point.x);
        if (dist < closestDist) {
          closestDist = dist;
          closestPoint = point;
          closestIndex = i;
        }
      });

      if (closestPoint && closestDist < 50) {
        // Show tooltip
        const priceText = Settings.formatCurrency(closestPoint.candle.close);
        const dateText = this.formatFullDate(closestPoint.candle.time);
        tooltip.innerHTML = `<strong>${priceText}</strong><br><span style="color: #807973;">${dateText}</span>`;

        // Position tooltip
        let tooltipX = closestPoint.x + 15;
        let tooltipY = closestPoint.y - 40;

        // Keep tooltip in bounds
        if (tooltipX + 120 > rect.width) {
          tooltipX = closestPoint.x - 130;
        }
        if (tooltipY < 10) {
          tooltipY = closestPoint.y + 15;
        }

        tooltip.style.left = tooltipX + "px";
        tooltip.style.top = tooltipY + "px";
        tooltip.style.opacity = "1";

        // Show and position dot
        hoverDot.style.left = closestPoint.x + "px";
        hoverDot.style.top = closestPoint.y + "px";
        hoverDot.style.backgroundColor = lineColor;
        hoverDot.style.opacity = "1";

        // Show vertical line
        verticalLine.style.left = closestPoint.x + "px";
        verticalLine.style.top = padding.top + "px";
        verticalLine.style.height = height + "px";
        verticalLine.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      tooltip.style.opacity = "0";
      hoverDot.style.opacity = "0";
      verticalLine.style.opacity = "0";
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Store instance reference for cleanup
    this.chartInstance = {
      remove: () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        wrapper.remove();
      },
    };
  },

  // Format price without currency symbol for axis
  formatPrice(price) {
    if (price >= 1000) {
      return price.toLocaleString("nl-NL", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  // Render candlestick chart (using Lightweight Charts if available, else fallback)
  renderCandlestickChart(candles, range = "1mo") {
    this.clear();
    this.currentType = "candlestick";
    this.currentRange = range;
    this.candles = candles;

    if (!candles || candles.length === 0) {
      this.container.innerHTML =
        '<div class="loading">Geen data beschikbaar</div>';
      return;
    }

    // Create wrapper with range selector
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "display: flex; flex-direction: column; height: 100%;";

    // Create range selector (same as simple chart)
    const rangeSelector = document.createElement("div");
    rangeSelector.style.cssText =
      "display: flex; gap: 4px; padding: 8px 0; border-bottom: 1px solid #E8E8E8; margin-bottom: 8px;";

    this.ranges.forEach((r) => {
      const btn = document.createElement("button");
      btn.textContent = r.label;
      btn.dataset.range = r.key;
      const isActive = r.key === range;
      btn.style.cssText = `
        padding: 6px 12px;
        border: none;
        background: ${isActive ? "#F0F0F0" : "transparent"};
        color: ${isActive ? "#0D7680" : "#807973"};
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: ${isActive ? "600" : "400"};
        cursor: pointer;
        border-radius: 4px;
      `;
      btn.addEventListener("click", () => {
        if (this.onRangeChange) {
          this.onRangeChange(r.key);
        }
      });
      rangeSelector.appendChild(btn);
    });

    wrapper.appendChild(rangeSelector);

    // Create chart container
    const chartContainer = document.createElement("div");
    chartContainer.style.cssText = "flex: 1; min-height: 0;";
    wrapper.appendChild(chartContainer);

    this.container.appendChild(wrapper);

    // Check if LightweightCharts is available
    if (typeof LightweightCharts !== "undefined") {
      this.renderWithLightweightCharts(candles, chartContainer);
    } else {
      this.renderCanvasCandlestick(candles, chartContainer);
    }
  },

  // Render using Lightweight Charts library
  renderWithLightweightCharts(candles, container) {
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: this.colors.background },
        textColor: "#807973",
      },
      grid: {
        vertLines: { color: this.colors.gridLight },
        horzLines: { color: this.colors.grid },
      },
      rightPriceScale: {
        borderColor: this.colors.grid,
      },
      timeScale: {
        borderColor: this.colors.grid,
        timeVisible: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: this.colors.up,
      downColor: this.colors.down,
      borderUpColor: this.colors.up,
      borderDownColor: this.colors.down,
      wickUpColor: this.colors.up,
      wickDownColor: this.colors.down,
    });

    candlestickSeries.setData(candles);

    // Add Trendline as line series
    if (this.showTrendlines && candles.length >= 10) {
      const trend = this.detectTrend(candles);
      let trendline = null;
      let trendColor = null;
      let trendLabel = "";

      if (trend === "up") {
        trendline = this.findUptrendLine(candles);
        trendColor = this.colors.trendUp;
        trendLabel = "Steun";
      } else if (trend === "down") {
        trendline = this.findDowntrendLine(candles);
        trendColor = this.colors.trendDown;
        trendLabel = "Weerstand";
      }

      if (trendline) {
        const trendSeries = chart.addLineSeries({
          color: trendColor,
          lineWidth: 2,
          lineStyle: 1, // Dashed
          title: trendLabel,
        });

        // Create line data from start to end
        const trendData = [
          { time: candles[0].time, value: trendline.startPrice },
          { time: candles[candles.length - 1].time, value: trendline.endPrice },
        ];
        trendSeries.setData(trendData);
      }
    }

    // Clear previous indicator series references
    this.indicatorSeries = {};

    // Only show indicators if MAs make sense for this timeframe
    const masEnabled = this.areMAsEnabledForRange(this.currentRange);

    if (masEnabled) {
      // Get adjusted periods based on candle interval
      const period5 = this.getAdjustedPeriod(5, this.currentRange);
      const period20 = this.getAdjustedPeriod(20, this.currentRange);
      const period50 = this.getAdjustedPeriod(50, this.currentRange);
      const period200 = this.getAdjustedPeriod(200, this.currentRange);

      // Add MA5 line if enabled (skip if period too small to be useful)
      if (this.indicators.ma5 && period5 >= 2 && candles.length >= period5) {
        const maData = this.calculateSMA(candles, period5);
        this.indicatorSeries.ma5 = chart.addLineSeries({
          color: this.colors.ma5,
          lineWidth: 2,
          title: "MA5",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        this.indicatorSeries.ma5.setData(maData);
      }

      // Add MA20 line if enabled
      if (this.indicators.ma20 && period20 >= 2 && candles.length >= period20) {
        const maData = this.calculateSMA(candles, period20);
        this.indicatorSeries.ma20 = chart.addLineSeries({
          color: this.colors.ma20,
          lineWidth: 2,
          title: "MA20",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        this.indicatorSeries.ma20.setData(maData);
      }

      // Add MA50 line if enabled
      if (this.indicators.ma50 && period50 >= 2 && candles.length >= period50) {
        const maData = this.calculateSMA(candles, period50);
        this.indicatorSeries.ma50 = chart.addLineSeries({
          color: this.colors.ma50,
          lineWidth: 2,
          title: "MA50",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        this.indicatorSeries.ma50.setData(maData);
      }

      // Add MA200 line if enabled
      if (
        this.indicators.ma200 &&
        period200 >= 2 &&
        candles.length >= period200
      ) {
        const maData = this.calculateSMA(candles, period200);
        this.indicatorSeries.ma200 = chart.addLineSeries({
          color: this.colors.ma200,
          lineWidth: 2,
          title: "MA200",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        this.indicatorSeries.ma200.setData(maData);
      }

      // Add EMA20 line if enabled
      if (
        this.indicators.ema20 &&
        period20 >= 2 &&
        candles.length >= period20
      ) {
        const emaData = this.calculateEMA(candles, period20);
        this.indicatorSeries.ema20 = chart.addLineSeries({
          color: this.colors.ema20,
          lineWidth: 2,
          title: "EMA20",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        this.indicatorSeries.ema20.setData(emaData);
      }

      // Add Bollinger Bands if enabled
      // Use a minimum period of 20 for Bollinger Bands to avoid erratic "spiky" bands
      // on long-term views where adjusted periods become very small
      const bollingerPeriod = Math.max(20, period20);
      if (this.indicators.bollinger && candles.length >= bollingerPeriod) {
        const bands = this.calculateBollingerBands(candles, bollingerPeriod, 2);

        // Don't let Bollinger Bands affect the price scale
        const bollingerOptions = {
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          autoscaleInfoProvider: () => null, // Prevent affecting scale
        };

        // Upper band
        this.indicatorSeries.bollingerUpper = chart.addLineSeries({
          ...bollingerOptions,
          color: this.colors.bollingerUpper,
          title: "BB Upper",
        });
        this.indicatorSeries.bollingerUpper.setData(bands.upper);

        // Lower band
        this.indicatorSeries.bollingerLower = chart.addLineSeries({
          ...bollingerOptions,
          color: this.colors.bollingerLower,
          title: "BB Lower",
        });
        this.indicatorSeries.bollingerLower.setData(bands.lower);
      }
    }

    chart.timeScale().fitContent();

    this.chartInstance = chart;

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });
    resizeObserver.observe(container);
  },

  // Fallback canvas-based candlestick chart
  renderCanvasCandlestick(candles, container) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const padding = { top: 20, right: 70, bottom: 35, left: 10 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;

    // Get price range
    const allPrices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const pricePadding = (maxPrice - minPrice) * 0.1;
    const adjustedMin = minPrice - pricePadding;
    const adjustedMax = maxPrice + pricePadding;
    const priceRange = adjustedMax - adjustedMin;

    // Calculate scale
    const candleWidth = Math.max(3, width / candles.length - 2);
    const xScale = width / candles.length;
    const yScale = height / priceRange;

    // Draw background
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + width, y);
      ctx.stroke();

      const price = adjustedMax - (priceRange / 5) * i;
      ctx.fillStyle = this.colors.text;
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(this.formatPrice(price), padding.left + width + 8, y + 4);
    }
    ctx.setLineDash([]);

    // Draw candles
    candles.forEach((candle, i) => {
      const x = padding.left + i * xScale + xScale / 2;
      const isUp = candle.close >= candle.open;
      const color = isUp ? this.colors.up : this.colors.down;

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padding.top + (adjustedMax - candle.high) * yScale);
      ctx.lineTo(x, padding.top + (adjustedMax - candle.low) * yScale);
      ctx.stroke();

      // Draw body
      const bodyTop =
        padding.top +
        (adjustedMax - Math.max(candle.open, candle.close)) * yScale;
      const bodyHeight = Math.abs(candle.close - candle.open) * yScale || 1;

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw date labels
    ctx.fillStyle = this.colors.text;
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";

    const labelCount = Math.min(6, candles.length);
    const step = Math.max(1, Math.floor(candles.length / labelCount));
    for (let i = 0; i < candles.length; i += step) {
      const x = padding.left + i * xScale + xScale / 2;
      const label = this.formatDateForRange(candles[i].time, this.currentRange);
      ctx.fillText(label, x, canvas.height - 8);
    }

    this.chartInstance = { remove: () => canvas.remove() };
  },

  // Toggle between chart types
  toggle(candles) {
    if (this.currentType === "simple") {
      this.renderCandlestickChart(candles, this.currentRange);
    } else {
      this.renderSimpleChart(candles, this.currentRange);
    }
  },
};
