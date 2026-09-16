import { create } from "zustand";
import { defaultParams, PALETTE, PRESETS } from "./defaults";
import { sanitizeParams } from "./validation";
import type { CardData, FanParams, GlassParams, LayoutMode, MotionParams, MoshaParams, PresetId, SymbolName } from "./types";
const STORAGE_KEY = "mosha-studio-v1";
export type StudioState = MoshaParams & {
  layout: LayoutMode; hoverIndex: number | null; selectedIndex: number; pinned: boolean;
  presetId: PresetId | null; demo: boolean; demoPaused: boolean; hydrated: boolean;
  setGlass: (patch: Partial<GlassParams>) => void;
  setFan: (patch: Partial<FanParams>) => void;
  setMotion: (patch: Partial<MotionParams>) => void;
  setLayout: (layout: LayoutMode) => void; setHover: (index: number | null) => void;
  setSelected: (index: number) => void; setPinned: (on: boolean) => void; togglePin: () => void;
  setDemo: (on: boolean) => void; setDemoPaused: (on: boolean) => void;
  setCard: (index: number, patch: Partial<CardData>) => void; addCard: () => void; removeCard: (index: number) => void;
  applyPreset: (id: PresetId) => void; setBg: (bg: string) => void;
  reset: () => void; hydrate: () => void; persist: () => void;
};
export const useStudio = create<StudioState>((set, get) => {
  const validIndex = (i: number) => Number.isInteger(i) && i >= 0 && i < get().cards.length;
  const change = (patch: Partial<MoshaParams>, flags: Partial<StudioState> = {}) => {
    set({ ...sanitizeParams({ ...get(), ...patch }), presetId: null, demo: false, demoPaused: false, ...flags });
    get().persist();
  };
  return {
    ...defaultParams(), layout: "fan", hoverIndex: null, selectedIndex: 0, pinned: false,
    presetId: "original", demo: true, demoPaused: false, hydrated: false,
    setGlass: patch => change({ glass: { ...get().glass, ...patch } }),
    setFan: patch => change({ fan: { ...get().fan, ...patch } }),
    setMotion: patch => change({ motion: { ...get().motion, ...patch } }),
    setLayout: layout => { if (layout !== "fan" && layout !== "stack") return; set({layout}); if (!get().demo) get().persist(); },
    setHover: i => set({ hoverIndex: i !== null && validIndex(i) ? i : null }),
    setSelected: i => { if (validIndex(i)) set({ selectedIndex:i, pinned:true, demo:false, demoPaused:false, hoverIndex:null }); },
    setPinned: pinned => set({ pinned, ...(pinned ? { demo:false, demoPaused:false } : {}), hoverIndex:null }),
    togglePin: () => { const s=get(); if(s.pinned) s.setPinned(false); else s.setSelected(s.hoverIndex ?? s.selectedIndex); },
    setDemo: demo => set({demo, demoPaused:false, hoverIndex:null, ...(demo ? {pinned:false} : {})}),
    setDemoPaused: demoPaused => set({demoPaused}),
    setCard: (index, patch) => { if (validIndex(index)) change({cards:get().cards.map((c,i)=>i===index?{...c,...patch,id:c.id}:c)}); },
    addCard: () => {
      const s=get(); if(s.cards.length>=6) return;
      const n=s.cards.length; const symbols:SymbolName[]=["diamond","star","club","spade","heart"];
      change({ cards:[...s.cards,{id:`card-${crypto.randomUUID()}`, code:`${String(n+1).padStart(2,"0")} / NEW`,title:"Untitled",description:"A custom frosted glass card.",tint:PALETTE[n%PALETTE.length]!,symbol:symbols[n%symbols.length]!}] }, {selectedIndex:n,pinned:true,hoverIndex:null});
    },
    removeCard: index => {
      const s=get(); if(s.cards.length<=2 || !validIndex(index)) return;
      const cards=s.cards.filter((_,i)=>i!==index);
      const selectedIndex=Math.min(s.selectedIndex-(index<s.selectedIndex?1:0),cards.length-1);
      change({cards},{selectedIndex,hoverIndex:null,pinned:s.pinned});
    },
    applyPreset: id => {
      if(!Object.hasOwn(PRESETS,id)) return;
      const next=PRESETS[id].apply(), current=get().cards;
      change({...next,cards:id==="mono"?current.map(c=>({...c,tint:"#d8dce4"})):current},{presetId:id,hoverIndex:null});
    },
    setBg: bg => change({bg}),
    reset: () => { set({...defaultParams(),layout:"fan",hoverIndex:null,selectedIndex:0,pinned:false,presetId:"original",demo:true,demoPaused:false}); get().persist(); },
    hydrate: () => {
      if(typeof window==="undefined") return;
      try {
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw) {
          const parsed:unknown=JSON.parse(raw);
          const saved=parsed && typeof parsed==="object" ? parsed as Record<string,unknown> : {};
          set({...sanitizeParams(saved),layout:saved.layout==="stack"?"stack":"fan",selectedIndex:0,pinned:false,hoverIndex:null,presetId:null,demo:false,demoPaused:false});
        }
      } catch { /* Unavailable storage or malformed JSON: retain valid current defaults. */ }
      set({hydrated:true});
    },
    persist: () => {
      if(typeof window==="undefined") return;
      try { window.localStorage.setItem(STORAGE_KEY,JSON.stringify({...sanitizeParams(get()),layout:get().layout})); }
      catch { /* Storage may be unavailable; the in-memory editor remains usable. */ }
    },
  };
});
