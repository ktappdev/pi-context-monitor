/**
 * pi-context-monitor
 *
 * Monitors context token usage and shows color-coded status in the footer.
 * Gradient from faint red at 70k to bright red at 100k+.
 *
 * Author: Ken Taylor (ktappdev)
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

const THRESHOLD_START = 70_000;
const THRESHOLD_END = 100_000;
const STATUS_KEY = "context-monitor";

function fmt(n: number): string {
  if (n < 1000) return `${n}`;
  return `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`;
}

/**
 * Interpolate from faint red (70k) to bright red (100k+).
 */
function colorForRatio(ratio: number): string {
  const clamped = Math.min(1, Math.max(0, ratio));
  // r stays 255, g and b fade from 200 down to 0
  const gb = Math.round(200 * (1 - clamped));
  return `\x1b[38;2;255;${gb};${gb}m`;
}

function updateStatus(_event: unknown, ctx: ExtensionContext): void {
  const usage = ctx.getContextUsage();
  if (!usage || usage.tokens == null) {
    ctx.ui.setStatus(STATUS_KEY, undefined);
    return;
  }

  const tokens = usage.tokens;

  // Below threshold – hide
  if (tokens < THRESHOLD_START) {
    ctx.ui.setStatus(STATUS_KEY, undefined);
    return;
  }

  const ratio = (tokens - THRESHOLD_START) / (THRESHOLD_END - THRESHOLD_START);
  const color = colorForRatio(ratio);
  const reset = "\x1b[0m";
  const text = `Context: ${fmt(tokens)}`;

  ctx.ui.setStatus(STATUS_KEY, `${color}${text}${reset}`);
}

export default function (pi: ExtensionAPI): void {
  pi.on("session_start", updateStatus);
  pi.on("turn_end", updateStatus);
  pi.on("session_compact", updateStatus);

  // Clean up on shutdown so status doesn't linger if extension reloads
  pi.on("session_shutdown", (_event, ctx) => {
    ctx.ui.setStatus(STATUS_KEY, undefined);
  });
}
