# Mosha Card UI

**Frosted / liquid-glass card generator for React, HTML and CSS. Tune the visual, then take the code with you.**

[![Live Studio](https://img.shields.io/badge/Live%20Studio-GitHub%20Pages-181717?logo=github)](https://simon66-workshop.github.io/mosha-card-ui/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)

Mosha is a small open-source browser studio for building frosted-glass / liquid-glass card layouts. It includes seven presets, fan/stack layouts, hover spin, pin-to-edit and direct export to **standalone HTML**, **React TSX** or **CSS**.

No account, backend, database or model API key is required.

**Try it:** https://simon66-workshop.github.io/mosha-card-ui/

[Live Studio](https://simon66-workshop.github.io/mosha-card-ui/) · [15-second demo](demo/66workshop-operate-15s.mp4) · [Standalone exported cards](https://simon66-workshop.github.io/mosha-card-ui/examples/cards.html) · [Integration notes](docs/INTEGRATION.md)

> GitHub Pages is live from `main`. The verified deployment receipt is recorded in [docs/audit/deployment/2026-09-16.md](docs/audit/deployment/2026-09-16.md). A passing build alone is not treated as proof of a public deployment.

![Mosha studio — fan layout](docs/covers/studio-fan.jpg)

## Why Mosha

Most visual UI demos stop at a screenshot or a code fragment that needs manual cleanup. Mosha is built around the opposite workflow:

1. tune the glass effect in the browser;
2. test the interaction;
3. export the result;
4. drop the generated source into a real project.

The generated output is intentionally reusable rather than tied to the editor itself.

## What you can tune

- 7 presets: Original, Mist, Neon Night, Thick Glass, Minimal, Liquid, Lens
- Fan and stack layouts
- Blur, saturation, fill, opacity, border, radius, glow, sheen and grain
- Refraction, brightness, contrast, thickness and chroma
- Card width / height, spread, gap, arc and stack depth
- Motion duration, scale, lift, sibling blur and sibling opacity
- 2–6 cards with editable text, color and symbol
- Keyboard, pointer and touch interaction
- Reduced-motion behavior

## Export formats

**Standalone HTML**  
Choose 网页 → 下载. The generated file includes styles, keyboard/touch/pointer interaction, responsive fitting and no external font dependency.

**React TSX**  
Choose React → 下载. Add the generated `MoshaHand.tsx` to an existing React/TypeScript project, then render `<MoshaHand />`. It depends on React only and has per-instance state/filter IDs.

**CSS**  
Use the stylesheet with the matching HTML structure for static presentation. Hover/pin behavior requires the complete HTML/TSX export or the generated interaction script.

```tsx
import { MoshaHand } from './MoshaHand';

export function Demo() {
  return <MoshaHand height={520} />;
}
```

Read [integration and boundaries](docs/INTEGRATION.md) before adding a second instance or changing host styles.

## Run locally

Node **22.12+** (CI uses Node 22).

```sh
npm ci
npm run dev
# Open the localhost URL printed by Vite.
```

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The public distribution contains the studio only. The earlier app-builder auth/database/server shell remains available in Git history at `a7a1ee4`; it is not required for this tool. `private: true` prevents accidental npm publication, not public GitHub access.

## 工作台

七套预设：原片、薄雾、夜虹、厚玻璃、极简、液态、透镜。保持扇形/层叠、悬停自旋和固定调参；卡片数量为 2–6 张。

颜色接受 `#RGB` 或 `#RRGGBB`。文字中的引号、大括号、尖括号按文字输出，不当作 JSX 或 HTML 执行。设置在本机浏览器保存；键盘调节也会保存，损坏的存档会回退到有效值。

Tab 可聚焦卡片，Enter/Space 固定，Escape 取消。系统要求减少动态效果时，关闭自动演示与旋转。玻璃/折射是浏览器渲染效果，**不是光学仿真，也不保证各浏览器像素一致**。

## Verified scope

CI checks clean installation, types, lint, dependency audits, export contracts, edge-case recovery, release-integrity mutation tests and production build. Browser tests load exported HTML and compile/render two separate generated TSX exports.

No universal browser-compatibility or security certification is claimed. See the [audit baseline](docs/audit/baseline/README.md) and [deployment receipt](docs/audit/deployment/2026-09-16.md).

Existing covers/video are retained from the original project; they are not represented as fresh post-change QA evidence. New verified captures have their own source/hash manifest.

## Contribute

The most useful contribution is a **real integration**: use an exported HTML/React result in an actual project and show what worked or broke.

Reproducible bugs and small tested PRs are also welcome.

[CONTRIBUTING](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md)

If Mosha is useful to you, a ⭐ helps other developers find it. No star exchanges, paid stars or adoption claims.

## License & attribution

[MIT](LICENSE), Simon66-workshop / 66Workshop. Preserve required dependency/source notices when redistributing.

No claim of affiliation, award or endorsement by OpenAI, Apple or xAI. Original visual assets are retained without asserting a new independent provenance audit.
