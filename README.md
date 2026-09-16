# 66Workshop · Mosha

**磨砂玻璃卡片，调好以后带走代码。**

A small open-source studio for frosted-glass cards: seven presets, fan/stack layouts, hover spin, pin-to-edit, and CSS / standalone HTML / React TSX export. No account, database or model API key is required.

[Studio deployment](https://simon66-workshop.github.io/mosha-card-ui/) · [15-second existing demo](demo/66workshop-operate-15s.mp4) · [Standalone cards](demo/cards.html) · [Integration](docs/INTEGRATION.md)

> The Pages workflow is included. Repository administrators must enable **Settings → Pages → Source: GitHub Actions**. A workflow file or build success is not proof that the public URL is live; check the latest deployment receipt.

![Existing studio view](docs/covers/studio-fan.jpg)

## Run

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

The public distribution now contains the studio only. The earlier app-builder auth/database/server shell remains available in Git history at `a7a1ee4`; it is not required for this tool. `private: true` prevents accidental npm publication, not public GitHub access.

## Use the result

**HTML:** choose 网页 → 下载. Open the downloaded file; it includes styles, keyboard/touch/pointer interaction, responsive fitting and no external font dependency.

**React:** choose React → 下载. Add the generated `MoshaHand.tsx` to an existing React/TypeScript project, then render `<MoshaHand />`. It depends on React only and has per-instance state/filter IDs. This is generated source, **not an npm package**.

**CSS:** use the stylesheet with matching HTML structure for static presentation. Hover/pin behavior requires the complete HTML/TSX export or the generated interaction script. Styling is namespaced under `mosha-*`; do not reuse these internal class names for unrelated components.

```tsx
import { MoshaHand } from './MoshaHand';
export function Demo() { return <MoshaHand height={520} />; }
```

Read [integration and boundaries](docs/INTEGRATION.md) before adding a second instance or changing host styles.

## 工作台

七套预设：原片、薄雾、夜虹、厚玻璃、极简、液态、透镜。保持原有扇形/层叠、悬停自旋和固定调参；卡片数量为 2–6 张。

颜色接受 `#RGB` 或 `#RRGGBB`。文字中的引号、大括号、尖括号按文字输出，不当作 JSX 或 HTML 执行。设置在本机浏览器保存；键盘调节也会保存，损坏的存档会回退到有效值。无法使用本地存储时，本次编辑仍可继续。

Tab 可聚焦卡片，Enter/Space 固定，Escape 取消。系统要求减少动态效果时，关闭自动演示与旋转。玻璃/折射是浏览器渲染效果，**不是光学仿真，也不保证各浏览器像素一致**。

## Verified scope

The CI checks clean installation, types, lint, export contracts and production build; browser tests actually load exported HTML and compile/render two separate TSX exports. Reports and captures are uploaded even on failure. No universal browser-compatibility or security certification is claimed. See [audit baseline](docs/audit/baseline/README.md).

Existing covers/video are retained from the original project; they are not fresh post-change QA evidence. New verified captures have their own source/hash manifest.

## Contribute

Show a real integration, report a reproducible bug, or send a small tested PR. [CONTRIBUTING](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md).

Useful? A ⭐ is appreciated. An actual integration or useful bug report is even better. No star exchanges or adoption claims.

## License & attribution

[MIT](LICENSE), Simon66-workshop / 66Workshop. Preserve required dependency/source notices when redistributing. No claim of affiliation, award or endorsement by OpenAI, Apple or xAI. Original visual assets are retained without asserting a new independent provenance audit.
