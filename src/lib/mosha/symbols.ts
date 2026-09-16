import type { SymbolName } from "./types";

export const SYMBOL_PATHS: Record<SymbolName, string> = {
  diamond: "M12 2.2 21.2 12 12 21.8 2.8 12 12 2.2Z",
  star: "M12 1.6 14.35 9.4 22.4 12 14.35 14.6 12 22.4 9.65 14.6 1.6 12 9.65 9.4Z",
  club:
    "M12 3.2c-2.1 0-3.8 1.6-3.8 3.55 0 .7.2 1.35.55 1.9C7.2 8.3 5.8 9.7 5.8 11.5c0 2 1.6 3.5 3.7 3.5.7 0 1.35-.18 1.9-.5v2.7H8.4v1.6h7.2v-1.6h-3V14.5c.55.32 1.2.5 1.9.5 2.1 0 3.7-1.5 3.7-3.5 0-1.8-1.4-3.2-2.95-3.85.35-.55.55-1.2.55-1.9 0-1.95-1.7-3.55-3.8-3.55Z",
  spade:
    "M12 2.4C8.2 7.1 5.2 10.2 5.2 13.1c0 2.35 1.7 4.1 4 4.1.7 0 1.35-.18 1.9-.5v2.5H8.2v1.6h7.6v-1.6h-2.9v-2.5c.55.32 1.2.5 1.9.5 2.3 0 4-1.75 4-4.1 0-2.9-3-6-6.8-10.7Z",
  heart:
    "M12 20.6S3.4 14.4 3.4 8.9C3.4 6.1 5.5 4.2 8.2 4.2c1.7 0 3.15.9 3.8 2.25C12.65 5.1 14.1 4.2 15.8 4.2c2.7 0 4.8 1.9 4.8 4.7 0 5.5-8.6 11.7-8.6 11.7Z",
};

export const SYMBOL_LABEL: Record<SymbolName, string> = {
  diamond: "方片",
  star: "星芒",
  club: "梅花",
  spade: "黑桃",
  heart: "红心",
};

export function symbolSvg(name: SymbolName, size = 44): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="currentColor"><path d="${SYMBOL_PATHS[name]}"/></svg>`;
}
