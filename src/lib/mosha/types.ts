export type SymbolName = "diamond" | "star" | "club" | "spade" | "heart";

export type LayoutMode = "fan" | "stack";

export type GlassParams = {
  blur: number;
  saturate: number;
  fill: number;
  opacity: number;
  border: number;
  radius: number;
  glow: number;
  sheen: number;
  iris: number;
  grain: number;
  refract: number;
  bright: number;
  contrast: number;
  thickness: number;
  chroma: number;
};

export type FanParams = {
  cardW: number;
  cardH: number;
  spread: number;
  gap: number;
  arc: number;
  stack: number;
};

export type MotionParams = {
  duration: number;
  scale: number;
  lift: number;
  sibBlur: number;
  sibOp: number;
};

export type CardData = {
  id: string;
  code: string;
  title: string;
  description: string;
  tint: string;
  symbol: SymbolName;
};

export type MoshaParams = {
  glass: GlassParams;
  fan: FanParams;
  motion: MotionParams;
  cards: CardData[];
  bg: string;
};

export type PresetId = "original" | "mist" | "prism" | "thick" | "mono" | "liquid" | "lens";
