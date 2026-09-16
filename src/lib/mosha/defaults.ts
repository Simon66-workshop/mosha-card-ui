import type {
  CardData,
  FanParams,
  GlassParams,
  MotionParams,
  MoshaParams,
  PresetId,
} from "./types";

export const DEFAULT_CARDS: CardData[] = [
  {
    id: "energy",
    code: "01 / RED",
    title: "Energy",
    description: "A transparent red glass card with a glowing futuristic effect.",
    tint: "#c4453a",
    symbol: "diamond",
  },
  {
    id: "creative",
    code: "02 / YELLOW",
    title: "Creative",
    description: "Bright transparent yellow glass with a soft luminous glow.",
    tint: "#d4a017",
    symbol: "star",
  },
  {
    id: "nature",
    code: "03 / GREEN",
    title: "Nature",
    description: "Transparent green glass creating a premium liquid-like surface.",
    tint: "#2f9b6a",
    symbol: "club",
  },
  {
    id: "future",
    code: "04 / BLUE",
    title: "Future",
    description: "Deep blue transparent glass with cinematic reflections.",
    tint: "#2f7eb8",
    symbol: "spade",
  },
];

export const DEFAULT_GLASS: GlassParams = {
  blur: 22,
  saturate: 175,
  fill: 0.22,
  opacity: 1,
  border: 0.42,
  radius: 26,
  glow: 52,
  sheen: 0.5,
  iris: 0.9,
  grain: 0.1,
  refract: 0,
  bright: 100,
  contrast: 100,
  thickness: 0.22,
  chroma: 0.12,
};

export const DEFAULT_FAN: FanParams = {
  cardW: 214,
  cardH: 304,
  spread: 11.5,
  gap: 108,
  arc: 16,
  stack: 18,
};

export const DEFAULT_MOTION: MotionParams = {
  duration: 560,
  scale: 1.07,
  lift: 48,
  sibBlur: 14,
  sibOp: 0.28,
};

export const DEFAULT_BG = "#08080c";

export function cloneCards(cards: CardData[] = DEFAULT_CARDS): CardData[] {
  return cards.map((card) => ({ ...card }));
}

export function defaultParams(): MoshaParams {
  return {
    glass: { ...DEFAULT_GLASS },
    fan: { ...DEFAULT_FAN },
    motion: { ...DEFAULT_MOTION },
    cards: cloneCards(),
    bg: DEFAULT_BG,
  };
}

export const PRESETS: Record<
  PresetId,
  { label: string; hint: string; apply: () => MoshaParams }
> = {
  original: {
    label: "原片",
    hint: "视频同款",
    apply: () => defaultParams(),
  },
  mist: {
    label: "薄雾",
    hint: "更糊更透",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 32,
        fill: 0.16,
        opacity: 0.78,
        border: 0.28,
        glow: 28,
        sheen: 0.5,
        grain: 0.08,
        thickness: 0.12,
      },
    }),
  },
  prism: {
    label: "夜虹",
    hint: "虹彩描边",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 18,
        fill: 0.22,
        opacity: 0.96,
        iris: 1,
        glow: 58,
        sheen: 0.55,
        grain: 0.16,
        chroma: 0.82,
        thickness: 0.3,
        bright: 108,
      },
      motion: { ...DEFAULT_MOTION, sibBlur: 14, sibOp: 0.28 },
    }),
  },
  thick: {
    label: "厚玻璃",
    hint: "实体感",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 12,
        saturate: 140,
        fill: 0.42,
        opacity: 1,
        border: 0.5,
        glow: 24,
        sheen: 0.28,
        iris: 0.4,
        grain: 0.06,
        thickness: 0.88,
        contrast: 108,
        chroma: 0.08,
      },
    }),
  },
  mono: {
    label: "极简",
    hint: "白霜",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 22,
        saturate: 120,
        fill: 0.18,
        opacity: 0.92,
        border: 0.46,
        glow: 18,
        sheen: 0.48,
        iris: 0.35,
        grain: 0.1,
        chroma: 0,
        thickness: 0.18,
      },
      cards: cloneCards().map((card) => ({ ...card, tint: "#d8dce4" })),
    }),
  },
  liquid: {
    label: "液态",
    hint: "折射",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 3,
        saturate: 168,
        fill: 0.11,
        opacity: 0.96,
        border: 0.55,
        radius: 28,
        glow: 34,
        sheen: 0.64,
        iris: 0.7,
        grain: 0.04,
        refract: 26,
        bright: 108,
        contrast: 106,
        thickness: 0.48,
        chroma: 0.4,
      },
    }),
  },
  lens: {
    label: "透镜",
    hint: "厚边色散",
    apply: () => ({
      ...defaultParams(),
      glass: {
        ...DEFAULT_GLASS,
        blur: 7,
        saturate: 180,
        fill: 0.15,
        opacity: 0.97,
        border: 0.48,
        radius: 30,
        glow: 42,
        sheen: 0.58,
        iris: 0.85,
        grain: 0.06,
        refract: 16,
        bright: 112,
        contrast: 110,
        thickness: 0.78,
        chroma: 0.72,
      },
    }),
  },
};

export const PALETTE = [
  "#c4453a",
  "#d4a017",
  "#2f9b6a",
  "#2f7eb8",
  "#8a5a3c",
  "#6b7c93",
  "#b85c7a",
  "#3d8b8b",
];
