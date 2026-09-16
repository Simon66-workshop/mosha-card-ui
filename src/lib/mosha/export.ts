import { CARD_LAYER_NAMES, generateMoshaCss, cardIndexVar, moshaLensMarkup } from "./recipe";
import { symbolSvg } from "./symbols";
import type { LayoutMode, MoshaParams } from "./types";

const LAYERS = CARD_LAYER_NAMES.map((name) => `        <span class="${name}" aria-hidden="true"></span>`).join("\n");

export function cardMarkup(params: MoshaParams): string {
  const n = params.cards.length;
  const cards = params.cards
    .map((card, i) => {
      const idx = cardIndexVar(i, n);
      return `    <article class="mosha-card" data-index="${i}" style="--i:${idx}; --tint:${card.tint}; --z:${i + 1}" aria-hidden="true">
      <span class="mosha-card-cast" aria-hidden="true"></span>
      <div class="mosha-card-spin">
${LAYERS}
        <div class="mosha-card-body">
          <p class="mosha-card-code">${escapeHtml(card.code)}</p>
          <div class="mosha-card-symbol">${symbolSvg(card.symbol)}</div>
          <div class="mosha-card-copy">
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.description)}</p>
          </div>
        </div>
      </div>
    </article>`;
    })
    .join("\n");
  const hits = params.cards
    .map((card, i) => {
      const idx = cardIndexVar(i, n);
      return `    <button type="button" class="mosha-card-hit" data-index="${i}" style="--i:${idx}; --z:${i + 1}" aria-label="${escapeHtml(card.title)}"></button>`;
    })
    .join("\n");
  return `${cards}\n${hits}`;
}

export function generateSnippet(params: MoshaParams, layout: LayoutMode): string {
  const refract = params.glass.refract > 0 ? "1" : "0";
  return `<section class="mosha-stage" data-refract="${refract}">
  ${moshaLensMarkup(params.glass.refract)}
  <div class="mosha-ambient" aria-hidden="true"></div>
  <div class="mosha-hand-scale">
    <div class="mosha-hand" data-layout="${layout}">
${cardMarkup(params)}
    </div>
  </div>
</section>`;
}

const INTERACTION_SCRIPT = `(function () {
  var stage = document.querySelector(".mosha-stage");
  var hand = stage && stage.querySelector(".mosha-hand");
  if (!stage || !hand) return;
  var cards = hand.querySelectorAll(".mosha-card");
  var hits = hand.querySelectorAll(".mosha-card-hit");
  var locked = null;
  function cardFromHit(hit) {
    if (!hit) return null;
    var idx = hit.getAttribute("data-index");
    return hand.querySelector('.mosha-card[data-index="' + idx + '"]');
  }
  function pick(x, y) {
    var stack = document.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      var node = stack[i];
      var hit = node && node.closest ? node.closest(".mosha-card-hit") : null;
      if (hit && stage.contains(hit)) return cardFromHit(hit);
    }
    return null;
  }
  function restartSpin(card) {
    var plate = card && card.querySelector(".mosha-card-spin");
    if (!plate) return;
    plate.style.animation = "none";
    void plate.offsetWidth;
    plate.style.animation = "";
  }
  function setActive(card) {
    hand.classList.toggle("is-isolating", Boolean(card));
    cards.forEach(function (c) {
      var on = c === card;
      var was = c.classList.contains("is-active");
      c.classList.toggle("is-active", on);
      if (on && !was) restartSpin(c);
    });
  }
  hits.forEach(function (hit) {
    hit.addEventListener("pointerenter", function () {
      var card = cardFromHit(hit);
      if (card && card !== locked) {
        locked = card;
        setActive(card);
      }
    });
  });
  stage.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    if (r.width >= 1 && r.height >= 1) {
      stage.style.setProperty("--mosha-lx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
      stage.style.setProperty("--mosha-ly", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
    }
    var card = pick(e.clientX, e.clientY);
    if (card && card !== locked) {
      locked = card;
      setActive(card);
    }
  });
  stage.addEventListener("pointerleave", function () {
    locked = null;
    setActive(null);
  });
})();`;

export function generatePage(params: MoshaParams, layout: LayoutMode): string {
  const css = generateMoshaCss(params);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>66Workshop · 磨砂卡片</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      min-height: 100vh;
      min-height: 100dvh;
      background: ${params.bg};
    }
    .mosha-stage { min-height: 100vh; min-height: 100dvh; }
${css}
  </style>
</head>
<body>
${generateSnippet(params, layout)}
<script>
${INTERACTION_SCRIPT}
</script>
</body>
</html>
`;
}

export function generateReactSnippet(params: MoshaParams, layout: LayoutMode): string {
  const refract = params.glass.refract > 0 ? "1" : "0";
  const css = generateMoshaCss(params)
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${");
  const lens = moshaLensMarkup(params.glass.refract).replaceAll("\\", "\\\\").replaceAll("`", "\\`");
  const layers = CARD_LAYER_NAMES.map((name) => `            <span className="${name}" aria-hidden />`).join("\n");
  const cards = params.cards
    .map((card, i) => {
      const idx = cardIndexVar(i, params.cards.length);
      return `        <article
          className={active === ${i} ? "mosha-card is-active" : "mosha-card"}
          data-index={${i}}
          style={{ ["--i" as string]: ${idx}, ["--tint" as string]: "${card.tint}", ["--z" as string]: ${i + 1} }}
          aria-hidden
        >
          <span className="mosha-card-cast" aria-hidden />
          <div className="mosha-card-spin" key={active === ${i} ? "spin-${i}" : "idle-${i}"}>
${layers}
            <div className="mosha-card-body">
              <p className="mosha-card-code">${escapeJs(card.code)}</p>
              <div className="mosha-card-symbol" dangerouslySetInnerHTML={{ __html: \`${symbolSvg(card.symbol)}\` }} />
              <div className="mosha-card-copy">
                <h3>${escapeJs(card.title)}</h3>
                <p>${escapeJs(card.description)}</p>
              </div>
            </div>
          </div>
        </article>`;
    })
    .join("\n");
  const hits = params.cards
    .map((card, i) => {
      const idx = cardIndexVar(i, params.cards.length);
      return `        <button
          type="button"
          className="mosha-card-hit"
          data-index={${i}}
          style={{ ["--i" as string]: ${idx}, ["--z" as string]: ${i + 1} }}
          aria-label="${escapeJs(card.title)}"
          onPointerEnter={() => setActive(${i})}
        />`;
    })
    .join("\n");

  return `import { useState, type CSSProperties, type PointerEvent } from "react";

const MOSHA_CSS = \`${css}\`;

export function MoshaHand() {
  const [active, setActive] = useState<number | null>(null);

  function onMove(event: PointerEvent<HTMLElement>) {
    const stage = event.currentTarget;
    const r = stage.getBoundingClientRect();
    if (r.width >= 1 && r.height >= 1) {
      stage.style.setProperty("--mosha-lx", \`\${((event.clientX - r.left) / r.width * 100).toFixed(1)}%\`);
      stage.style.setProperty("--mosha-ly", \`\${((event.clientY - r.top) / r.height * 100).toFixed(1)}%\`);
    }
  }

  return (
    <section
      className="mosha-stage"
      data-refract="${refract}"
      style={{ minHeight: "100vh" } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      <style>{MOSHA_CSS}</style>
      <div dangerouslySetInnerHTML={{ __html: \`${lens}\` }} />
      <div className="mosha-ambient" aria-hidden />
      <div className="mosha-hand-scale">
        <div className={active === null ? "mosha-hand" : "mosha-hand is-isolating"} data-layout="${layout}">
${cards}
${hits}
        </div>
      </div>
    </section>
  );
}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;");
}

function escapeJs(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadText(filename: string, text: string, type = "text/plain"): void {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
