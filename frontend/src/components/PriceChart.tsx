"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";

export interface Candle {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DecisionMarker {
  date: string;
  rating: string;
  id: string;
}

interface Props {
  candles: Candle[];
  markers?: DecisionMarker[];
}

const RATING_TONE: Record<string, { color: string; shape: "circle" | "arrowUp" | "arrowDown"; position: "aboveBar" | "belowBar" }> = {
  "Strong Buy": { color: "#0a84ff", shape: "arrowUp", position: "belowBar" },
  Buy: { color: "#30d158", shape: "arrowUp", position: "belowBar" },
  Hold: { color: "#ff9f0a", shape: "circle", position: "aboveBar" },
  Sell: { color: "#ff453a", shape: "arrowDown", position: "aboveBar" },
  "Strong Sell": { color: "#ff3b30", shape: "arrowDown", position: "aboveBar" },
};

function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function PriceChart({ candles, markers = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const dark = isDarkMode();

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: dark ? "rgba(235,235,245,0.62)" : "rgba(60,60,67,0.7)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: dark ? "rgba(84,84,88,0.18)" : "rgba(60,60,67,0.06)" },
        horzLines: { color: dark ? "rgba(84,84,88,0.18)" : "rgba(60,60,67,0.06)" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: dark ? "rgba(235,235,245,0.36)" : "rgba(60,60,67,0.5)", labelBackgroundColor: "#0a84ff" },
        horzLine: { color: dark ? "rgba(235,235,245,0.36)" : "rgba(60,60,67,0.5)", labelBackgroundColor: "#0a84ff" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#30d158",
      downColor: "#ff453a",
      borderVisible: false,
      wickUpColor: "#30d158",
      wickDownColor: "#ff453a",
    });

    candleSeries.setData(
      candles.map((c) => ({
        time: c.date as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.date as Time,
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(48, 209, 88, 0.45)"
            : "rgba(255, 69, 58, 0.45)",
      }))
    );

    if (markers.length > 0) {
      const sm: SeriesMarker<Time>[] = markers
        .map((m) => {
          const tone = RATING_TONE[m.rating] ?? RATING_TONE.Hold;
          return {
            time: m.date as Time,
            position: tone.position,
            color: tone.color,
            shape: tone.shape,
            text: m.rating,
            id: m.id,
          } as SeriesMarker<Time>;
        })
        .sort((a, b) => String(a.time).localeCompare(String(b.time)));
      createSeriesMarkers(candleSeries, sm);
    }

    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [candles, markers]);

  return <div ref={containerRef} className="h-[480px] w-full" />;
}
