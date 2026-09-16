import { defaultParams } from "./defaults";
import type { MoshaParams, SymbolName } from "./types";

type Bounds<T> = { [K in keyof T]: readonly [number, number] };
export const GLASS_BOUNDS: Bounds<MoshaParams["glass"]> = {
  blur: [2,40], saturate: [100,220], fill: [.08,.55], opacity: [.2,1],
  border: [.08,.8], radius: [8,40], glow: [0,90], sheen: [0,.7], iris: [0,1],
  grain: [0,.35], refract: [0,42], bright: [90,130], contrast: [90,130], thickness: [0,1], chroma: [0,1],
};
export const FAN_BOUNDS: Bounds<MoshaParams["fan"]> = { cardW:[160,280], cardH:[230,380], spread:[0,22], gap:[40,150], arc:[0,36], stack:[4,40] };
export const MOTION_BOUNDS: Bounds<MoshaParams["motion"]> = { duration:[200,1400], scale:[1,1.18], lift:[0,72], sibBlur:[0,22], sibOp:[.1,.8] };
export const SYMBOL_NAMES: SymbolName[] = ["diamond","star","club","spade","heart"];
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function normalizeColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) return "#" + s.slice(1).split("").map(c => c+c).join("").toLowerCase();
  return null;
}
function numbers<T extends object>(value: unknown, base: T, bounds: Bounds<T>): T {
  const source = record(value); const result = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const n = source[String(key)]; const [min,max] = bounds[key];
    result[key] = (typeof n === "number" && Number.isFinite(n) ? Math.min(max,Math.max(min,n)) : base[key]) as T[keyof T];
  }
  return result;
}
function text(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback;
  const clipped = value.slice(0,max);
  // Keep the documented UTF-16 limit without leaving half of a surrogate pair.
  return clipped.length < value.length && /[\uD800-\uDBFF]$/.test(clipped) ? clipped.slice(0,-1) : clipped;
}
/** Single boundary for untrusted persisted data and all generated source. */
export function sanitizeParams(value: unknown): MoshaParams {
  const input = record(value), base = defaultParams();
  const rawCards = Array.isArray(input.cards) && input.cards.length >= 2 ? input.cards.slice(0,6) : base.cards;
  const seen = new Set<string>();
  const cards = Array.from(rawCards, (raw, i) => {
    const card = record(raw), fallback = base.cards[i % base.cards.length]!;
    let id = text(card.id, `card-${i}`, 80);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id)) id = `restored-${i}`;
    while (seen.has(id)) id += "-";
    seen.add(id);
    return { id, code: text(card.code,fallback.code,80), title: text(card.title,fallback.title,120), description: text(card.description,fallback.description,1000), tint: normalizeColor(card.tint) ?? fallback.tint, symbol: SYMBOL_NAMES.includes(card.symbol as SymbolName) ? card.symbol as SymbolName : fallback.symbol };
  });
  return { glass:numbers(input.glass,base.glass,GLASS_BOUNDS), fan:numbers(input.fan,base.fan,FAN_BOUNDS), motion:numbers(input.motion,base.motion,MOTION_BOUNDS), cards, bg: normalizeColor(input.bg) ?? base.bg };
}
