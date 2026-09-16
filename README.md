# 66Workshop · Mosha Card UI

可调节的磨砂玻璃卡片。扇形 / 层叠、悬停抬起并自旋翻转、固定单卡实时调参，调好后导出 CSS / 网页 / React。

打开 [`index.html`](./index.html) 即可看效果。把 [`css/mosha-card.css`](./css/mosha-card.css) 丢进任何前端项目。

## 工作室

```bash
npm install
npm run dev
```

左侧是预览，右侧调玻璃、光学、布局和动效。点一张卡片可固定预览；划过会在原位抬起并转一圈，邻卡虚化。

导出：

| 格式 | 用途 |
| --- | --- |
| CSS | 只作用在 `.mosha-stage` 上，可贴进现有站点 |
| 网页 | 完整可打开的单页（含悬停自旋） |
| React | 含样式和悬停的 `MoshaHand` 组件 |

## 快速使用

```html
<link rel="stylesheet" href="css/mosha-card.css" />
<!-- 把导出的 HTML 结构贴进来，或直接打开 index.html -->
```

`data-layout="fan"` 扇形，`data-layout="stack"` 层叠。热区钉在扇形原位，卡片抬起不会抖动。

## 可调变量

在 `.mosha-stage` 上覆盖：

| 变量 | 作用 |
| --- | --- |
| `--mosha-blur` | 毛玻璃模糊 |
| `--mosha-sat` | 饱和 |
| `--mosha-fill` | 色淀 |
| `--mosha-opacity` | 卡片透明度 |
| `--mosha-refract` | 折射（需低模糊） |
| `--mosha-chroma` | 色散描边 |
| `--mosha-spread` / `--mosha-gap` / `--mosha-arc` | 扇形 |
| `--mosha-duration` / `--mosha-spin` | 抬起时长 / 自旋 |
| `--mosha-lift` / `--mosha-scale` | 悬停抬升 / 放大 |
| `--mosha-sib-blur` / `--mosha-sib-op` | 邻卡虚化 |

每张卡片自己的色相：

```html
<article class="mosha-card" style="--tint:#2f7eb8; --i:1.5">
```

`--i` 是相对中心的序号。4 张卡用 `-1.5 -0.5 0.5 1.5`。

## 背景

玻璃需要后面有东西才能透。用深色底，`.mosha-ambient` 会铺一层与卡片同色的光斑。祖先元素不要加 `filter` / `backdrop-filter`。

MIT
