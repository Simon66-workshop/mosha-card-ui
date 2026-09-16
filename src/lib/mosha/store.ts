import { create } from "zustand";
import { defaultParams, PALETTE } from "./defaults";
import type {
  CardData,
  FanParams,
  GlassParams,
  LayoutMode,
  MotionParams,
  MoshaParams,
  PresetId,
  SymbolName,
} from "./types";
import { PRESETS } from "./defaults";

const STORAGE_KEY = "mosha-studio-v1";

export type StudioState = MoshaParams & {
  layout: LayoutMode;
  hoverIndex: number | null;
  selectedIndex: number;
  pinned: boolean;
  presetId: PresetId | null;
  demo: boolean;
  demoPaused: boolean;
  hydrated: boolean;
  setGlass: (patch: Partial<GlassParams>) => void;
  setFan: (patch: Partial<FanParams>) => void;
  setMotion: (patch: Partial<MotionParams>) => void;
  setLayout: (layout: LayoutMode) => void;
  setHover: (index: number | null) => void;
  setSelected: (index: number) => void;
  setPinned: (on: boolean) => void;
  togglePin: () => void;
  setDemo: (on: boolean) => void;
  setDemoPaused: (on: boolean) => void;
  setCard: (index: number, patch: Partial<CardData>) => void;
  addCard: () => void;
  removeCard: (index: number) => void;
  applyPreset: (id: PresetId) => void;
  setBg: (bg: string) => void;
  reset: () => void;
  hydrate: () => void;
  persist: () => void;
};

function persistSlice(state: StudioState): MoshaParams {
  return {
    glass: state.glass,
    fan: state.fan,
    motion: state.motion,
    cards: state.cards,
    bg: state.bg,
  };
}

function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampOpacity(value: number | undefined): number {
  return clamp(value, 0.2, 1, 1);
}

function isCard(value: unknown): value is CardData {
  if (!value || typeof value !== "object") return false;
  const card = value as CardData;
  return typeof card.id === "string" && typeof card.title === "string" && typeof card.tint === "string";
}

export const useStudio = create<StudioState>((set, get) => ({
  ...defaultParams(),
  layout: "fan",
  hoverIndex: null,
  selectedIndex: 0,
  pinned: false,
  presetId: "original",
  demo: true,
  demoPaused: false,
  hydrated: false,
  setGlass: (patch) =>
    set((s) => ({
      glass: {
        ...s.glass,
        ...patch,
        ...(patch.opacity !== undefined ? { opacity: clampOpacity(patch.opacity) } : {}),
      },
      presetId: null,
      demo: false,
      demoPaused: false,
    })),
  setFan: (patch) =>
    set((s) => ({ fan: { ...s.fan, ...patch }, presetId: null, demo: false, demoPaused: false })),
  setMotion: (patch) =>
    set((s) => ({ motion: { ...s.motion, ...patch }, presetId: null, demo: false, demoPaused: false })),
  setLayout: (layout) => set({ layout }),
  setHover: (hoverIndex) => set({ hoverIndex }),
  setSelected: (selectedIndex) =>
    set({
      selectedIndex,
      pinned: true,
      demo: false,
      demoPaused: false,
      hoverIndex: null,
    }),
  setPinned: (pinned) =>
    set({
      pinned,
      demo: pinned ? false : get().demo,
      demoPaused: pinned ? false : get().demoPaused,
      hoverIndex: pinned ? null : get().hoverIndex,
    }),
  togglePin: () => {
    const { pinned, selectedIndex, hoverIndex } = get();
    if (pinned) {
      set({ pinned: false, hoverIndex: null });
      return;
    }
    set({
      pinned: true,
      selectedIndex: hoverIndex ?? selectedIndex,
      demo: false,
      demoPaused: false,
      hoverIndex: null,
    });
  },
  setDemo: (demo) =>
    set({
      demo,
      demoPaused: false,
      hoverIndex: demo ? get().hoverIndex : null,
      pinned: demo ? false : get().pinned,
    }),
  setDemoPaused: (demoPaused) => set({ demoPaused }),
  setCard: (index, patch) => {
    set((s) => ({
      cards: s.cards.map((card, i) => (i === index ? { ...card, ...patch } : card)),
    }));
    get().persist();
  },
  addCard: () => {
    set((s) => {
      if (s.cards.length >= 6) return s;
      const n = s.cards.length + 1;
      const tint = PALETTE[s.cards.length % PALETTE.length] ?? "#6b7c93";
      const symbols: SymbolName[] = ["diamond", "star", "club", "spade", "heart"];
      const card: CardData = {
        id: `card-${Date.now()}`,
        code: `${String(n).padStart(2, "0")} / NEW`,
        title: "Untitled",
        description: "A custom frosted glass card.",
        tint,
        symbol: symbols[s.cards.length % symbols.length] ?? "diamond",
      };
      return {
        cards: [...s.cards, card],
        selectedIndex: s.cards.length,
        pinned: true,
        demo: false,
        demoPaused: false,
        hoverIndex: null,
      };
    });
    get().persist();
  },
  removeCard: (index) => {
    set((s) => {
      if (s.cards.length <= 2) return s;
      const cards = s.cards.filter((_, i) => i !== index);
      const selectedIndex = Math.min(s.selectedIndex === index ? index : s.selectedIndex, cards.length - 1);
      return {
        cards,
        selectedIndex,
        hoverIndex: null,
        pinned: s.pinned,
      };
    });
    get().persist();
  },
  applyPreset: (id) => {
    const next = PRESETS[id].apply();
    const current = get().cards;
    const cards =
      id === "mono"
        ? current.map((card) => ({ ...card, tint: "#d8dce4" }))
        : current.length >= 2
          ? current
          : next.cards;
    set({
      glass: next.glass,
      fan: next.fan,
      motion: next.motion,
      bg: next.bg,
      cards,
      hoverIndex: null,
      presetId: id,
      demo: false,
      demoPaused: false,
    });
  },
  setBg: (bg) => set({ bg, presetId: null, demo: false, demoPaused: false }),
  reset: () =>
    set({
      ...defaultParams(),
      layout: "fan",
      hoverIndex: null,
      selectedIndex: 0,
      pinned: false,
      presetId: "original",
      demo: true,
      demoPaused: false,
    }),
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MoshaParams>;
        const base = defaultParams();
        const cards = Array.isArray(parsed.cards) && parsed.cards.length >= 2 && parsed.cards.every(isCard)
          ? parsed.cards
          : base.cards;
        set({
          glass: {
            ...base.glass,
            ...parsed.glass,
            opacity: clampOpacity(parsed.glass?.opacity ?? base.glass.opacity),
            blur: clamp(parsed.glass?.blur, 2, 40, base.glass.blur),
            refract: clamp(parsed.glass?.refract, 0, 42, base.glass.refract),
          },
          fan: { ...base.fan, ...parsed.fan },
          motion: { ...base.motion, ...parsed.motion },
          cards,
          bg: parsed.bg ?? base.bg,
          presetId: null,
        });
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true });
  },
  persist: () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistSlice(get())));
    } catch {
      /* ignore */
    }
  },
}));
