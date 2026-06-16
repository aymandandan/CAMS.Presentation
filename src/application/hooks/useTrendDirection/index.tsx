import { useMemo } from "react";

type TrendDirection = "up" | "down" | "neutral";

interface TrendResult {
  direction: TrendDirection;
  percentChange: number | null;
}

/**
 * Computes trend direction and percent change using a simple linear regression slope.
 * If the slope is significantly positive/negative, returns "up"/"down", else "neutral".
 */
export function useTrendDirection(data: number[]): TrendResult {
  return useMemo(() => {
    if (!data || data.length < 2) {
      return { direction: "neutral", percentChange: null };
    }

    // Simple linear regression slope
    const n = data.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((acc, x, i) => acc + x * data[i], 0);
    const sumX2 = indices.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Percent change from first to last value
    const first = data[0];
    const last = data[data.length - 1];
    const percentChange =
      first !== 0 ? ((last - first) / Math.abs(first)) * 100 : null;

    // Determine direction based on slope and percent change
    let direction: TrendDirection = "neutral";
    if (slope > 0.1 && (percentChange ?? 0) > 5) direction = "up";
    else if (slope < -0.1 && (percentChange ?? 0) < -5) direction = "down";

    return { direction, percentChange };
  }, [data]);
}
