import { CARD_LAYER_NAMES, MOSHA_RECIPE, generateMoshaCss, cardIndexVar, moshaLensMarkup, stageVars } from "./recipe";
import { symbolSvg, SYMBOL_PATHS } from "./symbols";
import { sanitizeParams } from "./validation";
import type { LayoutMode, MoshaParams } from "./types";

const LAYERS = CARD_LAYER_NAMES.map(name => `<span class="${name}" aria-hidden="true"></span>`).join("\n");
const layoutName = (layout: LayoutMode) => layout === "stack" ? "stack" : "fan";
const sourceJson = (value: unknown) => JSON.stringify(value).replaceAll("<","\\u003c").replaceAll(">","\\u003e").replaceAll("&","\\u0026");
function escapeHtml(value: string): string {
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
export function cardMarkup(input: MoshaParams): string {
  const p=sanitizeParams(input), n=p.cards.length;
  return p.cards.map((c,i)=>`<article class="mosha-card" data-index="${i}" style="--i:${cardIndexVar(i,n)};--tint:${c.tint};--z:${i+1}" aria-hidden="true">
<span class="mosha-card-cast" aria-hidden="true"></span><div class="mosha-card-spin">${LAYERS}
<div class="mosha-card-body"><p class="mosha-card-code">${escapeHtml(c.code)}</p><div class="mosha-card-symbol">${symbolSvg(c.symbol)}</div><div class="mosha-card-copy"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.description)}</p></div></div></div></article>`).join("\n")+
    p.cards.map((c,i)=>`<button type="button" class="mosha-card-hit" data-index="${i}" style="--i:${cardIndexVar(i,n)};--z:${i+1}" aria-label="${escapeHtml(`${c.title}. ${c.description}`)}" aria-pressed="false"></button>`).join("\n");
}
export function generateSnippet(input: MoshaParams, layout: LayoutMode): string {
  const p=sanitizeParams(input), id=`mosha-lens-${crypto.randomUUID()}`;
  const vars={...stageVars(p),"--mosha-lens-filter":`url(#${id})`};
  const style=Object.entries(vars).map(([k,v])=>`${k}:${v}`).join(";");
  return `<section class="mosha-stage" data-refract="${p.glass.refract>0?1:0}" style="${escapeHtml(style)}">
${moshaLensMarkup(p.glass.refract,id)}<div class="mosha-ambient" aria-hidden="true"></div><div class="mosha-hand-scale"><div class="mosha-hand" data-layout="${layoutName(layout)}">${cardMarkup(p)}</div></div></section>`;
}

// Data is never interpolated into this script. Every stage has independent state.
export const INTERACTION_SCRIPT = `document.querySelectorAll(".mosha-stage").forEach(function(stage) {
  if(stage.dataset.moshaReady) return;
  stage.dataset.moshaReady="1";
  const hand=stage.querySelector(".mosha-hand");
  if(!hand) return;
  const cards=[...hand.querySelectorAll(".mosha-card")], hits=[...hand.querySelectorAll(".mosha-card-hit")];
  let pinned=null, active=null;
  function show(index) {
    active=index;
    hand.classList.toggle("is-isolating",index!==null);
    cards.forEach((card,i)=>card.classList.toggle("is-active",i===index));
    hits.forEach((hit,i)=>hit.setAttribute("aria-pressed",String(i===pinned)));
  }
  hits.forEach((hit,i)=>{
    hit.addEventListener("pointerenter",()=>{if(pinned===null) show(i);});
    hit.addEventListener("focus",()=>{if(pinned===null) show(i);});
    hit.addEventListener("click",()=>{pinned=pinned===i?null:i;show(pinned??i);});
  });
  stage.addEventListener("pointerleave",()=>{if(pinned===null&&!stage.contains(document.activeElement)) show(null);});
  stage.addEventListener("focusout",event=>{if(pinned===null&&!stage.contains(event.relatedTarget)) show(null);});
  stage.addEventListener("keydown",event=>{if(event.key==="Escape"){pinned=null;show(null);}});
  stage.addEventListener("pointermove",event=>{
    const r=stage.getBoundingClientRect();
    if(r.width&&r.height){stage.style.setProperty("--mosha-lx",((event.clientX-r.left)/r.width*100)+"%");stage.style.setProperty("--mosha-ly",((event.clientY-r.top)/r.height*100)+"%");}
    if(pinned!==null) return;
    const hit=document.elementsFromPoint(event.clientX,event.clientY).map(n=>n.closest?.(".mosha-card-hit")).find(n=>n&&hand.contains(n));
    if(hit){const i=hits.indexOf(hit);if(i!==active)show(i);}
  });
  function fit(){
    const css=getComputedStyle(stage), read=k=>parseFloat(css.getPropertyValue(k))||0;
    const half=(cards.length-1)/2, w=read("--mosha-card-w"), h=read("--mosha-card-h");
    const span=w+(cards.length-1)*read("--mosha-gap")+h+60;
    const tall=h+half*half*read("--mosha-arc")+read("--mosha-lift")+w+60;
    stage.style.setProperty("--mosha-fit",String(Math.max(.05,Math.min(1,(stage.clientWidth-24)/span,(stage.clientHeight-24)/tall))));
  }
  new ResizeObserver(fit).observe(stage);fit();
});`;

export function generatePage(input: MoshaParams, layout: LayoutMode): string {
  const p=sanitizeParams(input);
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>66Workshop · Mosha cards</title>
<style>html,body{margin:0;min-height:100%;background:${p.bg}}.mosha-stage{height:100vh;height:100dvh;min-height:360px}
${generateMoshaCss(p)}</style></head><body>${generateSnippet(p,layout)}
<script>${INTERACTION_SCRIPT}</script></body></html>`;
}

/** Standalone TSX. User content is data, never JSX syntax or executable markup. */
export function generateReactSnippet(input: MoshaParams, layout: LayoutMode): string {
  const p=sanitizeParams(input);
  const cards=p.cards.map(c=>({...c,path:SYMBOL_PATHS[c.symbol]}));
  return `import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
const CSS = ${sourceJson(MOSHA_RECIPE)};
const CARDS = ${sourceJson(cards)};
const VARS = ${sourceJson(stageVars(p))};
const LAYERS = ${sourceJson(CARD_LAYER_NAMES)};

export function MoshaHand({ height = 480 }: { height?: number } = {}) {
  const id = "mosha-lens-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [fit, setFit] = useState(1);
  const selected = pinned ?? active;
  const safeHeight = Number.isFinite(height) ? Math.max(240,Math.min(1600,height)) : 480;
  useEffect(() => {
    const stage=root.current;if(!stage) return;
    const resize=()=>setFit(Math.max(.05,Math.min(1,(stage.clientWidth-24)/${p.fan.cardW+(p.cards.length-1)*p.fan.gap+p.fan.cardH+60},(stage.clientHeight-24)/${p.fan.cardH+((p.cards.length-1)/2)**2*p.fan.arc+p.motion.lift+p.fan.cardW+60})));
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();
    return ()=>observer.disconnect();
  },[]);
  function move(event: PointerEvent<HTMLElement>) {
    const r=event.currentTarget.getBoundingClientRect();
    if(r.width&&r.height){event.currentTarget.style.setProperty("--mosha-lx",((event.clientX-r.left)/r.width*100)+"%");event.currentTarget.style.setProperty("--mosha-ly",((event.clientY-r.top)/r.height*100)+"%");}
  }
  return <section ref={root} className="mosha-stage" data-refract="${p.glass.refract>0?1:0}"
    style={{...VARS,"--mosha-lens-filter":"url(#"+id+")","--mosha-fit":fit,height:safeHeight,minHeight:safeHeight} as CSSProperties}
    onPointerMove={move} onPointerLeave={()=>{if(!root.current?.contains(document.activeElement))setActive(null);}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setActive(null);}}
    onKeyDown={event=>{if(event.key==="Escape"){setPinned(null);setActive(null);}}}>
    <style>{CSS}</style>
    <svg className="mosha-optics" width="0" height="0" aria-hidden="true" focusable="false"><filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.016" numOctaves={2} seed={7} result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale={${Math.round(p.glass.refract)}} xChannelSelector="R" yChannelSelector="G"/></filter></svg>
    <div className="mosha-ambient" aria-hidden="true"/>
    <div className="mosha-hand-scale"><div className={selected===null?"mosha-hand":"mosha-hand is-isolating"} data-layout="${layoutName(layout)}">
      {CARDS.map((card,i)=><article key={card.id} className={selected===i?"mosha-card is-active":"mosha-card"} data-index={i}
        style={{"--i":i-(CARDS.length-1)/2,"--tint":card.tint,"--z":i+1} as CSSProperties} aria-hidden="true">
        <span className="mosha-card-cast"/><div className="mosha-card-spin" key={selected===i?"spin":"idle"}>
        {LAYERS.map(name=><span key={name} className={name}/>)}
        <div className="mosha-card-body"><p className="mosha-card-code">{card.code}</p><div className="mosha-card-symbol"><svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor"><path d={card.path}/></svg></div><div className="mosha-card-copy"><h3>{card.title}</h3><p>{card.description}</p></div></div></div>
      </article>)}
      {CARDS.map((card,i)=><button key={card.id} type="button" className="mosha-card-hit" data-index={i}
        style={{"--i":i-(CARDS.length-1)/2,"--z":i+1} as CSSProperties}
        aria-label={card.title+". "+card.description} aria-pressed={pinned===i}
        onPointerEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>{setPinned(pinned===i?null:i);setActive(i);}}/>)}
    </div></div>
  </section>;
}
`;
}
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
export function downloadText(filename: string, text: string, type="text/plain"): void {
  const url=URL.createObjectURL(new Blob([text],{type:`${type};charset=utf-8`}));
  const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
