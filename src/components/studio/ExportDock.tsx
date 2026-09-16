import { useMemo, useState } from "react";
import { Check, Code2, Copy, Download, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import {
  copyText,
  downloadText,
  generatePage,
  generateReactSnippet,
  generateSnippet,
} from "@/lib/mosha/export";
import { generateMoshaCss } from "@/lib/mosha/recipe";
import { useStudio } from "@/lib/mosha/store";
import { cn } from "@/lib/utils";

type Kind = "css" | "html" | "react";

export function ExportDock() {
  const glass = useStudio((s) => s.glass);
  const fan = useStudio((s) => s.fan);
  const motion = useStudio((s) => s.motion);
  const cards = useStudio((s) => s.cards);
  const bg = useStudio((s) => s.bg);
  const layout = useStudio((s) => s.layout);
  const [kind, setKind] = useState<Kind>("css");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const params = useMemo(
    () => ({ glass, fan, motion, cards, bg }),
    [glass, fan, motion, cards, bg],
  );

  const css = useMemo(() => generateMoshaCss(params), [params]);
  const html = useMemo(() => generatePage(params, layout), [params, layout]);
  const react = useMemo(() => generateReactSnippet(params, layout), [params, layout]);
  const snippet = useMemo(() => generateSnippet(params, layout), [params, layout]);

  const source = kind === "css" ? css : kind === "html" ? html : react;

  async function copy() {
    const ok = await copyText(source);
    if (ok) {
      setCopied(true);
      toast.success(kind === "css" ? "CSS 已复制" : kind === "html" ? "网页代码已复制" : "React 代码已复制");
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("复制失败，请手动选择代码");
    }
  }

  function download() {
    if (kind === "css") downloadText("mosha-card.css", css, "text/css");
    else if (kind === "html") downloadText("66workshop-mosha.html", html, "text/html");
    else downloadText("MoshaHand.tsx", react, "text/plain");
    toast.success("已开始下载");
  }

  async function copyMarkup() {
    const ok = await copyText(snippet);
    if (ok) toast.success("HTML 结构已复制");
    else toast.error("复制失败");
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-border bg-panel">
      <div className="flex items-center gap-1 px-3 pt-3">
        {(
          [
            ["css", "CSS"],
            ["html", "网页"],
            ["react", "React"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs transition-colors duration-150",
              kind === id ? "bg-inset text-fg" : "text-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md px-2.5 py-1.5 text-xs text-muted hover:text-fg"
        >
          {open ? "收起" : "展开代码"}
        </button>
      </div>
      {open ? (
        <pre className="mx-3 mt-2 max-h-40 min-h-28 overflow-auto rounded-lg border border-border bg-void p-3 font-mono text-[11px] leading-relaxed text-code">
          <code>{source}</code>
        </pre>
      ) : null}
      <div className="flex flex-wrap gap-2 p-3">
        <button type="button" onClick={copy} className="mosha-btn-primary">
          {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Copy className="size-3.5" strokeWidth={2} />}
          {copied ? "已复制" : "复制代码"}
        </button>
        <button type="button" onClick={download} className="mosha-btn-ghost">
          <Download className="size-3.5" strokeWidth={2} />
          下载
        </button>
        <button type="button" onClick={copyMarkup} className="mosha-btn-ghost">
          {kind === "react" ? (
            <FileCode2 className="size-3.5" strokeWidth={2} />
          ) : (
            <Code2 className="size-3.5" strokeWidth={2} />
          )}
          仅结构
        </button>
      </div>
      <p className="px-3 pb-3 text-xs leading-relaxed text-dim">
        网页是完整可打开的文件。CSS 只作用在 .mosha-stage 上，可直接贴进现有站点。React 已含样式和悬停自旋。
      </p>
    </div>
  );
}
