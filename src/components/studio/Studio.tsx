import { useEffect, useState, type ReactNode } from "react";
import { Layers, Pause, Pin, Play, SlidersHorizontal, SquareStack } from "lucide-react";
import { useStudio } from "@/lib/mosha/store";
import { cn } from "@/lib/utils";
import { ClientOnly } from "./ClientOnly";
import { ControlPanel } from "./ControlPanel";
import { ExportDock } from "./ExportDock";
import { Stage } from "./Stage";

export function Studio() {
  const layout = useStudio((s) => s.layout);
  const demo = useStudio((s) => s.demo);
  const demoPaused = useStudio((s) => s.demoPaused);
  const pinned = useStudio((s) => s.pinned);
  const setLayout = useStudio((s) => s.setLayout);
  const setDemo = useStudio((s) => s.setDemo);
  const setHover = useStudio((s) => s.setHover);
  const togglePin = useStudio((s) => s.togglePin);
  const setPinned = useStudio((s) => s.setPinned);
  const hydrate = useStudio((s) => s.hydrate);
  const [panel, setPanel] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="studio-mark" aria-label="66Workshop">
            <span className="studio-mark-num">66</span>
            <span className="studio-mark-rule" aria-hidden="true" />
            <span className="studio-mark-name">Workshop</span>
          </p>
          <p className="mt-1 text-xs text-muted">磨砂玻璃卡片 · 调好即导出</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Toggle
            active={layout === "fan" && !demo}
            onClick={() => {
              setDemo(false);
              setPinned(false);
              setLayout("fan");
              setHover(null);
            }}
            label="扇形"
            icon={<Layers className="size-3.5" strokeWidth={2} />}
          />
          <Toggle
            active={layout === "stack" && !demo}
            onClick={() => {
              setDemo(false);
              setPinned(false);
              setLayout("stack");
              setHover(null);
            }}
            label="层叠"
            icon={<SquareStack className="size-3.5" strokeWidth={2} />}
          />
          <Toggle
            active={pinned}
            onClick={togglePin}
            label="固定"
            icon={<Pin className="size-3.5" strokeWidth={2} />}
          />
          <Toggle
            active={demo}
            onClick={() => setDemo(!demo)}
            label="演示"
            icon={
              demo && !demoPaused ? (
                <Pause className="size-3.5" strokeWidth={2} />
              ) : (
                <Play className="size-3.5" strokeWidth={2} />
              )
            }
          />
          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md border border-border lg:hidden",
              panel ? "bg-inset text-fg" : "text-muted",
            )}
            aria-label="调节面板"
          >
            <SlidersHorizontal className="size-4" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative h-[54vh] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <Stage />
        </div>

        <aside
          className={cn(
            "z-10 min-h-0 w-full flex-1 flex-col border-t border-border bg-panel lg:w-80 lg:flex-none lg:border-t-0 lg:border-l",
            panel ? "flex" : "hidden lg:flex",
          )}
        >
          <ClientOnly
            fallback={<div className="flex-1 bg-panel" />}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <ControlPanel />
              <ExportDock />
            </div>
          </ClientOnly>
        </aside>
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors duration-150",
        active
          ? "border-border-strong bg-inset text-fg"
          : "border-border bg-transparent text-muted hover:text-fg",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
