# Integrating Mosha

## Three distinct deliverables

The studio is a React/Vite application with seven direct runtime dependencies. Its exported TSX component depends on React only. Its full HTML export uses CSS plus a small native DOM script; the visual recipe is CSS, but interactive exports are not “zero JavaScript”.

Use the complete HTML file for the smallest standalone demo. It requires no server/account/DB and uses system-font fallbacks. The studio optionally requests Google Fonts for its existing visual design. No telemetry or model requests are added.

For React, copy the generated MoshaHand.tsx into a React/TypeScript application and render `<MoshaHand height={520} />`. Exported configuration is embedded as validated data. The component keeps its own hover/pin state, layout variables, responsive scale and a React useId-derived SVG filter ID. Two components with different parameters must not overwrite one another. A single createRoot follows normal React ID semantics; separate roots should use React's identifierPrefix when SSR/hydrating multiple roots.

For CSS-only reuse, pair the CSS with the exported markup. This is static until you add the generated interaction script or implement the contract yourself. The build emits `examples/cards.html`, `examples/MoshaHand.tsx`, `examples/markup.html`, `examples/interactions.js`, and `css/mosha-card.css`. Initialize an added DOM stage by executing the interaction script after insertion; each stage is initialized only once. If dynamically removing stages, manage observer/listener cleanup in your application; the provided HTML is a full-document example, not a lifecycle-managed DOM plugin.

## Input boundary

Colors: #RGB or #RRGGBB, normalized to six-digit hex. CSS functions, named colors and arbitrary declarations are intentionally unsupported. Invalid drafts do not change the active color. Numbers must be finite and within studio control ranges. Data restored from localStorage is normalized, arrays bounded to 2–6 cards, IDs de-duplicated, symbols allowlisted, and missing text restored. Text limits: code 80, title 120, description 1000 UTF-16 code units.

HTML text is entity-encoded. React text is serialized into JSON data and rendered through JSX expressions. Validation is defense in depth; do not relax it to allow raw markup or code. These controls do not make arbitrary downstream modifications safe.

## Layout and accessibility

Styles use the reserved `mosha-*` class/property/keyframe namespace. They do not reset the host body or unrelated headings, except that full-page HTML owns its own document body. Per-instance configuration is inline so differently configured components coexist. Keep the stage at a useful height (React default 480px); extreme 6-card mobile layouts scale down and may make card text small. Choose fewer cards or a larger host region for readable content.

Cards: Tab/focus, Enter/Space pin, Escape clear; pointer and touch work on the same buttons. Labels include the visible title and description. Reduced motion suppresses spinning and automatic demo. CSS glass/color-mix/SVG-backdrop support differs by browser: Chromium validation is not Safari/iOS certification, and this release is not an optical-accuracy claim.

## Deployment

`GITHUB_PAGES=1 npm run build` uses `/mosha-card-ui/`; ordinary build uses `/`. Pages requires the repository Source set to GitHub Actions. The deploy job is separate from tests: a code PASS can coexist with a deployment permission failure. Do not describe the public URL as live until a successful deployment and external page read are recorded.
