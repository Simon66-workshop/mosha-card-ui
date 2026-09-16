import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const OUT = "/workspace/docs/covers";
mkdirSync(OUT, { recursive: true });

const FAN = "/workspace/artifacts/imagine_images/4372c377-3ad9-4fd9-a552-f8c7bbfbdece.jpg";
const SPIN = "/workspace/artifacts/imagine_images/1caf4586-7d23-4114-9ef9-4acbbc1ba6fc.jpg";
const BENCH = "/workspace/artifacts/imagine_images/05e7d895-4fe0-4fcc-b4f7-2a38dfae8b73.jpg";
const STACK = "/workspace/artifacts/imagine_images/e832dbb9-5813-43e3-8180-c3a9362aecd3.jpg";
const WIDE = "/workspace/artifacts/imagine_images/6b6b57d0-3337-4c8e-b48f-73ba2083cf01.jpg";

function dataUri(path) {
  const buf = readFileSync(path);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function coverHtml({ src, kicker, title, sub, tags, compact = false, w = 1600, h = 900 }) {
  const tagHtml = (tags || [])
    .map((t) => `<span class="tag">${t}</span>`)
    .join("");
  return `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500;1,9..144,600&family=Syne:wght@700&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
<style>
  html, body { margin: 0; background: #07080c; }
  .frame { position: relative; width: ${w}px; height: ${h}px; overflow: hidden; color: #f4f1ea; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .vignette {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, rgba(7,8,12,.78) 0%, rgba(7,8,12,.18) 26%, rgba(7,8,12,.06) 58%, rgba(7,8,12,.86) 100%),
      radial-gradient(90% 70% at 50% 58%, transparent 42%, rgba(7,8,12,.42) 100%);
  }
  .lockup {
    position: absolute; top: ${compact ? 40 : 54}px; left: ${compact ? 48 : 64}px;
    display: flex; align-items: center; gap: 18px;
  }
  .num {
    font-family: Fraunces, serif;
    font-style: italic;
    font-weight: 500;
    font-size: ${compact ? "58px" : "76px"};
    letter-spacing: -0.08em;
    line-height: .8;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 40, "WONK" 1, "opsz" 72;
  }
  .rule { width: 1px; height: 44px; background: rgba(244,241,234,.28); }
  .name {
    font-family: Syne, sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: .34em;
    text-transform: uppercase;
  }
  .kicker {
    position: absolute; top: ${compact ? 52 : 68}px; right: ${compact ? 48 : 64}px;
    font-family: Syne, sans-serif;
    font-size: 12px;
    letter-spacing: .28em;
    text-transform: uppercase;
    color: rgba(244,241,234,.52);
  }
  .foot {
    position: absolute; left: ${compact ? 48 : 64}px; right: ${compact ? 48 : 64}px; bottom: ${compact ? 36 : 48}px;
    display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;
  }
  .title {
    font-family: Fraunces, serif;
    font-style: italic;
    font-weight: 500;
    font-size: ${compact ? "34px" : "40px"};
    letter-spacing: -0.03em;
  }
  .sub {
    margin-top: 10px;
    font-family: "Instrument Sans", sans-serif;
    font-size: 16px;
    color: rgba(244,241,234,.64);
  }
  .tags { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
  .tag {
    border: 1px solid rgba(244,241,234,.18);
    border-radius: 999px;
    padding: 8px 14px;
    font-family: Syne, sans-serif;
    font-size: 11px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: rgba(244,241,234,.72);
    background: rgba(7,8,12,.28);
    backdrop-filter: blur(12px);
  }
</style>
</head>
<body>
  <div class="frame">
    <img class="bg" src="${src}" alt="" />
    <div class="vignette"></div>
    <div class="lockup">
      <span class="num">66</span>
      <span class="rule"></span>
      <span class="name">Workshop</span>
    </div>
    <div class="kicker">${kicker}</div>
    <div class="foot">
      <div>
        <div class="title">${title}</div>
        <div class="sub">${sub}</div>
      </div>
      <div class="tags">${tagHtml}</div>
    </div>
  </div>
</body>
</html>`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shotCover(page, html, outPath, w = 1600, h = 900) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(250);
  await page.screenshot({ path: outPath, type: "jpeg", quality: 88 });
}

async function moveToHit(page, index, holdMs, biasX = 0.5) {
  const box = await page.locator(`.mosha-card-hit[data-index="${index}"]`).boundingBox();
  if (!box) throw new Error(`missing hit ${index}`);
  await page.mouse.move(box.x + box.width * biasX, box.y + box.height * 0.42, { steps: 12 });
  await sleep(holdMs);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const covers = [
  {
    file: "hero.jpg",
    src: dataUri(FAN),
    kicker: "Mosha Card Studio",
    title: "磨砂玻璃卡片工作室",
    sub: "扇形 / 层叠 · 悬停自旋 · 调好即导出 CSS / 网页 / React",
    tags: ["Glass", "Live", "Export"],
  },
  {
    file: "hover.jpg",
    src: dataUri(SPIN),
    kicker: "Interaction",
    title: "悬停 · 飞速自旋",
    sub: "划过即抬起，整卡转一圈，邻卡虚化，阴影跟着走",
    tags: ["360°", "Silk"],
    compact: true,
  },
  {
    file: "stack.jpg",
    src: dataUri(STACK),
    kicker: "Layout",
    title: "层叠与扇形",
    sub: "同一套玻璃，两种手感。热区钉在原位，抬起不抖动",
    tags: ["Fan", "Stack"],
    compact: true,
  },
  {
    file: "workbench.jpg",
    src: dataUri(BENCH),
    kicker: "Workbench",
    title: "左侧预览 · 右侧调参",
    sub: "玻璃、光学、布局、动效全部实时。固定一张卡，慢慢打磨",
    tags: ["Pin", "Preset"],
    compact: true,
  },
  {
    file: "banner.jpg",
    src: dataUri(WIDE),
    kicker: "66Workshop",
    title: "磨砂玻璃卡片工作室",
    sub: "调好即导出",
    tags: ["Mosha"],
    compact: true,
    w: 2128,
    h: 912,
  },
];

for (const c of covers) {
  const w = c.w || 1600;
  const h = c.h || 900;
  await shotCover(page, coverHtml(c), `${OUT}/${c.file}`, w, h);
  console.log("cover", c.file);
}

await page.setViewportSize({ width: 1600, height: 900 });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForSelector(".mosha-card-hit");
await page.evaluate(() => document.fonts.ready);
await sleep(500);

await page.getByRole("button", { name: "扇形" }).click();
await sleep(700);
await page.screenshot({ path: `${OUT}/studio-fan.jpg`, type: "jpeg", quality: 86 });

await moveToHit(page, 3, 180, 0.78);
await page.screenshot({ path: `${OUT}/studio-spin.jpg`, type: "jpeg", quality: 86 });
await sleep(900);

await page.locator('.mosha-card-hit[data-index="3"]').click();
await sleep(500);
await page.screenshot({ path: `${OUT}/studio-pin.jpg`, type: "jpeg", quality: 86 });

await page.getByRole("button", { name: "层叠" }).click();
await sleep(700);
await page.screenshot({ path: `${OUT}/studio-stack.jpg`, type: "jpeg", quality: 86 });

const expand = page.getByRole("button", { name: "展开代码" });
if (await expand.count()) {
  await expand.click();
  await sleep(400);
}
await page.screenshot({ path: `${OUT}/studio-export.jpg`, type: "jpeg", quality: 86 });

await browser.close();
console.log("done", OUT);
