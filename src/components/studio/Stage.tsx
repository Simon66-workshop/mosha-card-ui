import { Pin } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { CARD_LAYER_NAMES, MOSHA_RECIPE, cardIndexVar, moshaLensMarkup, stageVars } from "@/lib/mosha/recipe";
import { useStudio } from "@/lib/mosha/store";
import { SymbolIcon } from "./SymbolIcon";

const DEMO_BEATS: { layout: "fan" | "stack"; hover: number | null; ms: number }[] = [
  { layout: "fan", hover: null, ms: 2200 },
  { layout: "fan", hover: 0, ms: 1250 },
  { layout: "fan", hover: 1, ms: 1250 },
  { layout: "fan", hover: 2, ms: 1250 },
  { layout: "fan", hover: 3, ms: 1400 },
  { layout: "stack", hover: null, ms: 1600 },
  { layout: "fan", hover: null, ms: 1600 },
];

function pickCardIndex(root: HTMLElement, clientX: number, clientY: number): number | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof Element)) continue;
    const hit = node.closest(".mosha-card-hit");
    if (hit instanceof HTMLElement && root.contains(hit)) {
      const idx = Number(hit.dataset.index);
      return Number.isInteger(idx) ? idx : null;
    }
  }
  return null;
}

export function Stage() {
  const glass = useStudio((s) => s.glass);
  const fan = useStudio((s) => s.fan);
  const motion = useStudio((s) => s.motion);
  const cards = useStudio((s) => s.cards);
  const bg = useStudio((s) => s.bg);
  const layout = useStudio((s) => s.layout);
  const hoverIndex = useStudio((s) => s.hoverIndex);
  const selectedIndex = useStudio((s) => s.selectedIndex);
  const pinned = useStudio((s) => s.pinned);
  const demo = useStudio((s) => s.demo);
  const demoPaused = useStudio((s) => s.demoPaused);
  const setLayout = useStudio((s) => s.setLayout);
  const setHover = useStudio((s) => s.setHover);
  const setSelected = useStudio((s) => s.setSelected);
  const setPinned = useStudio((s) => s.setPinned);
  const setDemoPaused = useStudio((s) => s.setDemoPaused);
  const setDemo = useStudio((s) => s.setDemo);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  const params = useMemo(
    () => ({ glass, fan, motion, cards, bg }),
    [glass, fan, motion, cards, bg],
  );
  const vars = useMemo(() => stageVars(params), [params]);
  const lens = useMemo(() => moshaLensMarkup(glass.refract), [glass.refract]);

  const frame = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const n = cards.length;
      const span = fan.cardW + fan.gap * Math.max(n - 1, 0) + fan.cardH + 80;
      const heightNeed = fan.cardH + fan.arc * ((n - 1) / 2) ** 2 + motion.lift + fan.cardW + 80;
      const next = Math.min(1, (w - 24) / span, (h - 24) / heightNeed);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cards.length, fan.cardW, fan.cardH, fan.gap, fan.arc, motion.lift]);

  useEffect(() => {
    return () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    if (!demo || demoPaused || pinned || reducedMotion) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let step = 0;
    let timer = 0;
    const tick = () => {
      const beat = DEMO_BEATS[step % DEMO_BEATS.length];
      if (!beat) return;
      setLayout(beat.layout);
      const n = useStudio.getState().cards.length;
      const hover =
        beat.hover === null || n < 1 ? null : ((beat.hover % n) + n) % n;
      setHover(hover);
      timer = window.setTimeout(() => {
        step += 1;
        tick();
      }, beat.ms);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [demo, demoPaused, pinned, reducedMotion, setHover, setLayout]);

  const demoDriving = demo && !demoPaused && !pinned && !reducedMotion;
  const isolating = (demoDriving && hoverIndex !== null) || pinned || (!demoDriving && hoverIndex !== null);
  const activeIndex = pinned ? selectedIndex : hoverIndex;
  const pinnedCard = pinned ? (cards[selectedIndex] ?? cards[0]) : null;

  function handleStageClick() {
    if (pinned) setPinned(false);
  }

  function handleCardClick(event: MouseEvent<HTMLElement>, index: number) {
    event.stopPropagation();
    if (pinned && selectedIndex === index) {
      setPinned(false);
      return;
    }
    setSelected(index);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width >= 1 && r.height >= 1) {
      const x = ((event.clientX - r.left) / r.width) * 100;
      const y = ((event.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mosha-lx", `${x.toFixed(1)}%`);
      el.style.setProperty("--mosha-ly", `${y.toFixed(1)}%`);
    }
    if (pinned) return;
    const cx = event.clientX;
    const cy = event.clientY;
    if (raf.current) return;
    raf.current = window.requestAnimationFrame(() => {
      raf.current = 0;
      const root = frame.current;
      if (!root || useStudio.getState().pinned) return;
      const i = pickCardIndex(root, cx, cy);
      if (i === null) return;
      const state = useStudio.getState();
      if (i === state.hoverIndex) return;
      if (state.demo) state.setDemoPaused(true);
      state.setHover(i);
    });
  }

  function handlePointerLeave() {
    if (raf.current) window.cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (useStudio.getState().pinned) return;
    setHover(null);
    if (demo) setDemoPaused(false);
  }

  return (
    <section
      ref={frame}
      className="mosha-stage studio-stage"
      style={vars as CSSProperties}
      data-refract={glass.refract > 0 ? "1" : "0"}
      aria-label="磨砂卡片预览"
      onClick={handleStageClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onKeyDown={event => { if (event.key === "Escape") { setPinned(false); setHover(null); setDemo(false); } }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !useStudio.getState().pinned) { setHover(null); setDemoPaused(false); } }}
    >
      <style>{MOSHA_RECIPE}</style>
      <div dangerouslySetInnerHTML={{ __html: lens }} />
      <div className="mosha-ambient" aria-hidden="true" />
      <div
        className="mosha-hand-scale"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <div
          className={isolating ? "mosha-hand is-isolating" : "mosha-hand"}
          data-layout={layout}
          data-demo={demoDriving ? "1" : "0"}
          data-pin={pinned ? "1" : "0"}
        >
          {cards.map((card, i) => (
            <article
              key={card.id}
              className={activeIndex === i ? "mosha-card is-active" : "mosha-card"}
              data-index={i}
              style={
                {
                  "--i": cardIndexVar(i, cards.length),
                  "--tint": card.tint,
                  "--z": i + 1,
                } as CSSProperties
              }
              aria-hidden="true"
            >
              <span className="mosha-card-cast" aria-hidden="true" />
              <div className="mosha-card-spin" key={activeIndex === i ? `spin-${i}` : `idle-${i}`}>
                {CARD_LAYER_NAMES.map((name) => (
                  <span key={name} className={name} aria-hidden="true" />
                ))}
                <div className="mosha-card-body">
                  <p className="mosha-card-code">{card.code}</p>
                  <div className="mosha-card-symbol">
                    <SymbolIcon name={card.symbol} />
                  </div>
                  <div className="mosha-card-copy">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {cards.map((card, i) => (
            <button
              key={`hit-${card.id}`}
              type="button"
              className="mosha-card-hit"
              data-index={i}
              style={
                {
                  "--i": cardIndexVar(i, cards.length),
                  "--z": i + 1,
                } as CSSProperties
              }
              aria-label={`选择 ${card.title}. ${card.description}`}
              aria-pressed={pinned && selectedIndex === i}
              onPointerEnter={() => {
                if (useStudio.getState().pinned) return;
                const state = useStudio.getState();
                if (state.hoverIndex === i) return;
                if (state.demo) state.setDemoPaused(true);
                state.setHover(i);
              }}
              onClick={(event) => handleCardClick(event, i)}
              onFocus={() => {
                if (useStudio.getState().pinned) {
                  setSelected(i);
                  return;
                }
                if (demo) setDemoPaused(true);
                setHover(i);
              }}
            />
          ))}
        </div>
      </div>
      {pinnedCard ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          <div className="pointer-events-auto flex h-9 items-center gap-2 rounded-md border border-border bg-panel/90 px-2.5 text-xs text-fg backdrop-blur-md">
            <Pin className="size-3.5 text-muted" strokeWidth={2} />
            <span className="max-w-40 truncate">固定 · {pinnedCard.title}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setPinned(false);
              }}
              className="rounded-sm px-1.5 py-1 text-muted transition-colors duration-150 hover:text-fg"
            >
              查看全部
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
