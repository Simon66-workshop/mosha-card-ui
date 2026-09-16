import { sanitizeParams } from "./validation";
import type { CardData, FanParams, GlassParams, MotionParams, MoshaParams } from "./types";

export function cardIndexVar(i: number, n: number): number {
  return i - (n - 1) / 2;
}

export function stageVars(params: MoshaParams): Record<string, string> {
  const { glass, fan, motion, bg, cards } = sanitizeParams(params);
  const vars: Record<string, string> = {
    "--mosha-bg": bg,
    "--mosha-card-w": `${fan.cardW}px`,
    "--mosha-card-h": `${fan.cardH}px`,
    "--mosha-radius": `${glass.radius}px`,
    "--mosha-blur": `${glass.blur}px`,
    "--mosha-sat": `${glass.saturate}%`,
    "--mosha-fill": String(glass.fill),
    "--mosha-opacity": String(glass.opacity),
    "--mosha-border": String(glass.border),
    "--mosha-glow": `${glass.glow}px`,
    "--mosha-sheen": String(glass.sheen),
    "--mosha-iris": String(glass.iris),
    "--mosha-grain": String(glass.grain),
    "--mosha-refract": String(glass.refract),
    "--mosha-bright": `${glass.bright}%`,
    "--mosha-contrast": `${glass.contrast}%`,
    "--mosha-thick": String(glass.thickness),
    "--mosha-chroma": String(glass.chroma),
    "--mosha-spread": `${fan.spread}deg`,
    "--mosha-gap": `${fan.gap}px`,
    "--mosha-arc": `${fan.arc}px`,
    "--mosha-stack": `${fan.stack}px`,
    "--mosha-duration": `${motion.duration}ms`,
    "--mosha-spin": `${Math.round(Math.min(480, Math.max(320, motion.duration * 0.72)))}ms`,
    "--mosha-spin-ease": "cubic-bezier(0.4, 0, 0.6, 1)",
    "--mosha-scale": String(motion.scale),
    "--mosha-lift": `${motion.lift}px`,
    "--mosha-sib-blur": `${motion.sibBlur}px`,
    "--mosha-sib-op": String(motion.sibOp),
    "--mosha-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
  };
  cards.forEach((card, i) => {
    vars[`--mosha-tint-${i}`] = card.tint;
  });
  return vars;
}

export function varsToCss(vars: Record<string, string>, selector = ".mosha-stage"): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

export function moshaLensMarkup(scale: number, id = "mosha-lens"): string {
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) throw new Error("Invalid lens ID");
  const s = Number.isFinite(scale) ? Math.max(0, Math.min(42, Math.round(scale))) : 0;
  return `<svg class="mosha-optics" width="0" height="0" aria-hidden="true" focusable="false">
  <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.016" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="${s}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;
}

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

const BACKDROP_STACK =
  "blur(var(--mosha-blur, 20px)) saturate(var(--mosha-sat, 168%)) brightness(var(--mosha-bright, 100%)) contrast(var(--mosha-contrast, 100%))";

export const MOSHA_RECIPE = `/* Mosha Card UI — frosted / liquid / refractive glass. Drop into any page. */
@property --mosha-spin-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.mosha-stage, .mosha-stage *, .mosha-stage *::before, .mosha-stage *::after { box-sizing: border-box; }

.mosha-optics {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.mosha-stage {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  overflow: hidden;
  min-height: 100%;
  container-type: inline-size;
  color: #f6f7f9;
  font-family: Sora, ui-sans-serif, system-ui, sans-serif;
  background: var(--mosha-bg, #08080c);
  -webkit-font-smoothing: antialiased;
}

.mosha-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 42% 38% at 18% 28%, color-mix(in srgb, var(--mosha-tint-0, #c4453a) 38%, transparent), transparent 72%),
    radial-gradient(ellipse 36% 34% at 48% 22%, color-mix(in srgb, var(--mosha-tint-1, #d4a017) 24%, transparent), transparent 70%),
    radial-gradient(ellipse 40% 36% at 72% 36%, color-mix(in srgb, var(--mosha-tint-2, #2f9b6a) 28%, transparent), transparent 72%),
    radial-gradient(ellipse 44% 40% at 82% 78%, color-mix(in srgb, var(--mosha-tint-3, #2f7eb8) 32%, transparent), transparent 72%),
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.045) 0 1px, transparent 1px 42px),
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 42px),
    radial-gradient(circle at 20% 20%, #252525 0%, transparent 42%),
    radial-gradient(circle at 80% 80%, #141416 0%, transparent 46%);
}

.mosha-hand-scale {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  transform: scale(var(--mosha-fit, 1));
}

.mosha-hand {
  position: relative;
  width: var(--mosha-card-w, 214px);
  height: var(--mosha-card-h, 304px);
  perspective: 1200px;
}

.mosha-card {
  --i: 0;
  --tint: #8a909a;
  --z: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--mosha-card-w, 214px);
  height: var(--mosha-card-h, 304px);
  translate: -50% -50%;
  border-radius: var(--mosha-radius, 26px);
  z-index: var(--z);
  overflow: visible;
  pointer-events: none;
  color: inherit;
  opacity: var(--mosha-opacity, 1);
  transform-origin: 50% 86%;
  transition-property: transform, filter, opacity, box-shadow;
  transition-duration: var(--mosha-duration, 720ms);
  transition-timing-function: var(--mosha-ease, cubic-bezier(0.22, 1, 0.36, 1));
  background: transparent;
  box-shadow:
    0 22px 48px rgb(0 0 0 / 0.4),
    0 0 var(--mosha-glow, 46px) color-mix(in srgb, var(--tint) 42%, transparent);
}

.mosha-card-hit {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--mosha-card-w, 214px);
  height: var(--mosha-card-h, 304px);
  translate: -50% -50%;
  border-radius: var(--mosha-radius, 26px);
  z-index: calc(var(--z) + 40);
  transform-origin: 50% 86%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  display: block;
  -webkit-tap-highlight-color: transparent;
}

.mosha-card-hit:focus-visible {
  outline: 2px solid rgb(255 255 255 / 0.7);
  outline-offset: 4px;
}

.mosha-card-spin {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  transform-origin: 50% 50%;
  backface-visibility: hidden;
  will-change: transform;
  transform: rotate(var(--mosha-spin-angle, 0deg));
  background:
    linear-gradient(
      165deg,
      rgb(255 255 255 / 0.28) 0%,
      color-mix(in srgb, var(--tint) calc(var(--mosha-fill, 0.22) * 160%), transparent) 38%,
      color-mix(in srgb, var(--tint) calc(var(--mosha-fill, 0.22) * 90%), rgb(255 255 255 / 0.04)) 100%
    );
  -webkit-backdrop-filter: ${BACKDROP_STACK};
  backdrop-filter: ${BACKDROP_STACK};
  border: 1px solid rgb(255 255 255 / var(--mosha-border, 0.38));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.52),
    inset 0 -28px 48px color-mix(in srgb, var(--tint) 26%, transparent);
}

.mosha-stage[data-refract="1"] .mosha-card-spin {
  -webkit-backdrop-filter: var(--mosha-lens-filter, url(#mosha-lens)) ${BACKDROP_STACK};
  backdrop-filter: var(--mosha-lens-filter, url(#mosha-lens)) ${BACKDROP_STACK};
}

.mosha-card-sheen,
.mosha-card-bloom,
.mosha-card-rim,
.mosha-card-grain,
.mosha-card-spec,
.mosha-card-chroma,
.mosha-card-depth {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.mosha-card-cast {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: -34px;
  height: 42px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--tint) 40%, rgb(0 0 0 / 0.72));
  filter: blur(18px);
  opacity: 0;
  pointer-events: none;
  z-index: -1;
  transition-property: opacity, transform;
  transition-duration: var(--mosha-duration, 720ms);
  transition-timing-function: var(--mosha-ease, cubic-bezier(0.22, 1, 0.36, 1));
}

.mosha-hand.is-isolating .mosha-card.is-active .mosha-card-cast {
  opacity: 0.92;
  transform: translateY(16px) scaleX(1.2);
}

.mosha-card-sheen {
  background: linear-gradient(
    155deg,
    rgb(255 255 255 / var(--mosha-sheen, 0.42)) 0%,
    rgb(255 255 255 / 0.06) 28%,
    transparent 48%
  );
}

.mosha-card-spec {
  background: radial-gradient(
    88% 62% at var(--mosha-lx, 22%) var(--mosha-ly, 10%),
    rgb(255 255 255 / calc(var(--mosha-sheen, 0.42) * 0.78)),
    transparent 44%
  );
  mix-blend-mode: screen;
}

.mosha-card-bloom {
  background: radial-gradient(
    ellipse 80% 55% at 30% 0%,
    color-mix(in srgb, var(--tint) 48%, transparent),
    transparent 62%
  );
  mix-blend-mode: soft-light;
}

.mosha-card-depth {
  box-shadow:
    inset 0 1.6px 1px -0.4px rgb(255 255 255 / calc(var(--mosha-thick, 0.22) * 0.72)),
    inset 0 -2px 10px rgb(0 0 0 / calc(var(--mosha-thick, 0.22) * 0.38)),
    inset 12px 14px 28px rgb(255 255 255 / calc(var(--mosha-thick, 0.22) * 0.1)),
    inset -10px -16px 26px rgb(0 0 0 / calc(var(--mosha-thick, 0.22) * 0.22));
}

.mosha-card-rim {
  padding: 1px;
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 0.7) 0%,
    color-mix(in srgb, var(--tint) 40%, white) 26%,
    rgb(170 255 230 / 0.32) 52%,
    rgb(255 190 210 / 0.22) 78%,
    rgb(255 255 255 / 0.16) 100%
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: var(--mosha-iris, 0.85);
}

.mosha-card-chroma {
  padding: 1px;
  background: conic-gradient(
    from 210deg,
    rgb(255 92 92 / 0.9),
    rgb(255 214 84 / 0.75),
    rgb(72 255 186 / 0.75),
    rgb(88 158 255 / 0.9),
    rgb(216 118 255 / 0.75),
    rgb(255 92 92 / 0.9)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  mix-blend-mode: plus-lighter;
  opacity: var(--mosha-chroma, 0);
}

.mosha-card-grain {
  opacity: var(--mosha-grain, 0.12);
  mix-blend-mode: overlay;
  background-image: ${NOISE_URI};
  background-size: 140px 140px;
}

.mosha-card-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 20px 20px;
  pointer-events: none;
}

.mosha-card-code {
  margin: 0;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.62);
}

.mosha-card-symbol {
  flex: 1;
  display: grid;
  place-items: center;
  color: #fff;
  filter: drop-shadow(0 8px 18px rgb(0 0 0 / 0.28));
}

.mosha-card-symbol svg {
  width: 44px;
  height: 44px;
  display: block;
}

.mosha-card-copy h3 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.15;
  text-wrap: balance;
  text-shadow: 0 1px 1px rgb(0 0 0 / 0.35), 0 8px 22px rgb(0 0 0 / 0.25);
}

.mosha-card-copy p {
  margin: 0;
  max-width: 26ch;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  color: rgb(255 255 255 / 0.62);
  text-wrap: pretty;
}

.mosha-hand[data-layout="fan"] .mosha-card,
.mosha-hand[data-layout="fan"] .mosha-card-hit {
  transform:
    translateX(calc(var(--i) * var(--mosha-gap)))
    translateY(calc(var(--i) * var(--i) * var(--mosha-arc)))
    rotate(calc(var(--i) * var(--mosha-spread)));
}

.mosha-hand[data-layout="stack"] .mosha-card,
.mosha-hand[data-layout="stack"] .mosha-card-hit {
  transform:
    translateX(calc(var(--i) * var(--mosha-stack)))
    translateY(calc(var(--i) * 5px))
    rotate(calc(var(--i) * 2.6deg));
}

.mosha-hand.is-isolating .mosha-card:not(.is-active) {
  opacity: calc(var(--mosha-sib-op) * var(--mosha-opacity, 1));
  filter: blur(var(--mosha-sib-blur));
}

.mosha-hand.is-isolating[data-layout="fan"] .mosha-card.is-active {
  z-index: 24;
  opacity: var(--mosha-opacity, 1);
  filter: none;
  transform:
    translateX(calc(var(--i) * var(--mosha-gap)))
    translateY(calc(var(--mosha-lift) * -1))
    rotate(0deg)
    scale(var(--mosha-scale));
  box-shadow:
    0 48px 96px rgb(0 0 0 / 0.62),
    0 18px 36px rgb(0 0 0 / 0.42),
    0 0 calc(var(--mosha-glow, 46px) * 1.4) color-mix(in srgb, var(--tint) 72%, transparent),
    0 0 calc(var(--mosha-glow, 46px) * 2.2) color-mix(in srgb, var(--tint) 32%, transparent);
}

.mosha-hand.is-isolating[data-layout="stack"] .mosha-card.is-active {
  z-index: 24;
  opacity: var(--mosha-opacity, 1);
  filter: none;
  transform:
    translateX(calc(var(--i) * var(--mosha-stack)))
    translateY(calc(var(--mosha-lift) * -1))
    rotate(0deg)
    scale(var(--mosha-scale));
  box-shadow:
    0 48px 96px rgb(0 0 0 / 0.62),
    0 18px 36px rgb(0 0 0 / 0.42),
    0 0 calc(var(--mosha-glow, 46px) * 1.4) color-mix(in srgb, var(--tint) 72%, transparent),
    0 0 calc(var(--mosha-glow, 46px) * 2.2) color-mix(in srgb, var(--tint) 32%, transparent);
}

.mosha-hand.is-isolating .mosha-card.is-active .mosha-card-spin {
  animation: mosha-spin var(--mosha-spin, 400ms) var(--mosha-spin-ease, cubic-bezier(0.4, 0, 0.6, 1)) both;
}

@keyframes mosha-spin {
  0% { --mosha-spin-angle: 0deg; }
  50% { --mosha-spin-angle: 180deg; }
  100% { --mosha-spin-angle: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .mosha-card, .mosha-card-cast {
    transition-duration: 0.01ms !important;
  }
  .mosha-hand.is-isolating .mosha-card.is-active .mosha-card-spin {
    animation: none;
  }
}
`;

export function generateMoshaCss(params: MoshaParams): string {
  return `/* 66Workshop · Mosha glass cards. Scope is .mosha-stage — drop into any page. */\n${varsToCss(stageVars(params), ".mosha-stage")}\n\n${MOSHA_RECIPE}`;
}

export function cardInlineStyle(card: CardData, i: number, n: number): Record<string, string> {
  return {
    "--i": String(cardIndexVar(i, n)),
    "--tint": card.tint,
    "--z": String(i + 1),
  };
}

export const CARD_LAYER_NAMES = [
  "mosha-card-bloom",
  "mosha-card-sheen",
  "mosha-card-spec",
  "mosha-card-depth",
  "mosha-card-rim",
  "mosha-card-chroma",
  "mosha-card-grain",
] as const;

export function summarizeParams(glass: GlassParams, fan: FanParams, motion: MotionParams): string {
  return [
    `blur ${glass.blur}px`,
    `sat ${glass.saturate}%`,
    `fill ${Math.round(glass.fill * 100)}%`,
    `op ${Math.round(glass.opacity * 100)}%`,
    `refract ${glass.refract}`,
    `radius ${glass.radius}px`,
    `glow ${glass.glow}px`,
    `${fan.cardW}×${fan.cardH}`,
    `spread ${fan.spread}°`,
    `${motion.duration}ms`,
  ].join(" · ");
}
