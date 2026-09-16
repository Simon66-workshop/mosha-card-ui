import { Minus, Pin, PinOff, Plus, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { PRESETS } from "@/lib/mosha/defaults";
import { SYMBOL_LABEL } from "@/lib/mosha/symbols";
import { useStudio } from "@/lib/mosha/store";
import type { PresetId, SymbolName } from "@/lib/mosha/types";
import { ColorField } from "./ColorField";
import { cn } from "@/lib/utils";

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pretty =
    Number.isInteger(step) && step >= 1 ? String(Math.round(value)) : value.toFixed(step < 0.01 ? 2 : 1);
  return (
    <label className="grid gap-1.5">
      <span className="flex items-baseline justify-between gap-3 text-xs text-muted">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-fg">
          {pretty}
          {unit}
        </span>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mosha-range"
      />
    </label>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-[11px] font-medium tracking-[0.16em] text-dim uppercase">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

const SYMBOLS: SymbolName[] = ["diamond", "star", "club", "spade", "heart"];

export function ControlPanel() {
  const glass = useStudio((s) => s.glass);
  const fan = useStudio((s) => s.fan);
  const motion = useStudio((s) => s.motion);
  const cards = useStudio((s) => s.cards);
  const selectedIndex = useStudio((s) => s.selectedIndex);
  const pinned = useStudio((s) => s.pinned);
  const presetId = useStudio((s) => s.presetId);
  const setGlass = useStudio((s) => s.setGlass);
  const setFan = useStudio((s) => s.setFan);
  const setMotion = useStudio((s) => s.setMotion);
  const setCard = useStudio((s) => s.setCard);
  const addCard = useStudio((s) => s.addCard);
  const removeCard = useStudio((s) => s.removeCard);
  const applyPreset = useStudio((s) => s.applyPreset);
  const reset = useStudio((s) => s.reset);
  const setSelected = useStudio((s) => s.setSelected);
  const togglePin = useStudio((s) => s.togglePin);
  const persist = useStudio((s) => s.persist);
  const bg = useStudio((s) => s.bg);
  const setBg = useStudio((s) => s.setBg);

  const card = cards[selectedIndex] ?? cards[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-4">
        <Group title="预设">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRESETS) as PresetId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  applyPreset(id);
                  persist();
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs transition-colors duration-150",
                  presetId === id
                    ? "border-border-strong bg-inset text-fg"
                    : "border-border bg-elevated text-fg hover:border-border-strong hover:bg-inset",
                )}
              >
                {PRESETS[id].label}
                <span className="ml-1.5 text-dim">{PRESETS[id].hint}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                reset();
                persist();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition-colors duration-150 hover:text-fg"
            >
              <RotateCcw className="size-3" strokeWidth={2} />
              重置
            </button>
          </div>
        </Group>

        {card ? (
          <Group title="选中款式">
            <p className="text-xs text-muted">点选一张，固定预览后拖动滑杆实时调节。</p>
            <div className="flex flex-wrap gap-1.5">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={i === selectedIndex}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center gap-2 rounded-md border px-2.5 text-xs transition-colors duration-150",
                    i === selectedIndex
                      ? "border-border-strong bg-inset text-fg"
                      : "border-border text-muted hover:text-fg",
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: c.tint }}
                    aria-hidden="true"
                  />
                  <span className="max-w-24 truncate">{c.title}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={addCard}
                disabled={cards.length >= 6}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted hover:text-fg disabled:opacity-40"
                aria-label="添加卡片"
              >
                <Plus className="size-3.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => removeCard(selectedIndex)}
                disabled={cards.length <= 2}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted hover:text-fg disabled:opacity-40"
                aria-label="删除卡片"
              >
                <Minus className="size-3.5" strokeWidth={2} />
              </button>
            </div>
            <button
              type="button"
              onClick={togglePin}
              aria-pressed={pinned}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs transition-colors duration-150",
                pinned
                  ? "border-border-strong bg-inset text-fg"
                  : "border-border text-muted hover:text-fg",
              )}
            >
              {pinned ? <Pin className="size-3.5" strokeWidth={2} /> : <PinOff className="size-3.5" strokeWidth={2} />}
              {pinned ? `固定中 · ${card.title}` : "固定此卡预览"}
            </button>
            <label className="grid gap-1.5 text-xs text-muted">
              编号
              <input
                maxLength={80}
                value={card.code}
                onChange={(e) => setCard(selectedIndex, { code: e.target.value })}
                className="mosha-field"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted">
              标题
              <input
                maxLength={120}
                value={card.title}
                onChange={(e) => setCard(selectedIndex, { title: e.target.value })}
                className="mosha-field"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted">
              描述
              <textarea
                maxLength={1000}
                value={card.description}
                rows={2}
                onChange={(e) => setCard(selectedIndex, { description: e.target.value })}
                className="mosha-field min-h-16 resize-y"
              />
            </label>
            <ColorField key={card.id} label="色相" value={card.tint} onChange={(tint) => setCard(selectedIndex, { tint })} />
            <div className="flex flex-wrap gap-1.5">
              {SYMBOLS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCard(selectedIndex, { symbol: name })}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs transition-colors duration-150",
                    card.symbol === name
                      ? "border-border-strong bg-inset text-fg"
                      : "border-border text-muted hover:text-fg",
                  )}
                >
                  {SYMBOL_LABEL[name]}
                </button>
              ))}
            </div>
          </Group>
        ) : null}

        <Group title="玻璃">
          <ColorField label="背景" value={bg} onChange={setBg} />
          <SliderRow label="模糊" value={glass.blur} min={2} max={40} step={1} unit="px" onChange={(blur) => setGlass({ blur })} />
          <SliderRow
            label="饱和"
            value={glass.saturate}
            min={100}
            max={220}
            step={1}
            unit="%"
            onChange={(saturate) => setGlass({ saturate })}
          />
          <SliderRow
            label="色淀"
            value={glass.fill}
            min={0.08}
            max={0.55}
            step={0.01}
            onChange={(fill) => setGlass({ fill })}
          />
          <SliderRow
            label="透明度"
            value={Math.round(glass.opacity * 100)}
            min={20}
            max={100}
            step={1}
            unit="%"
            onChange={(v) => setGlass({ opacity: v / 100 })}
          />
          <SliderRow
            label="描边"
            value={glass.border}
            min={0.08}
            max={0.8}
            step={0.01}
            onChange={(border) => setGlass({ border })}
          />
          <SliderRow
            label="圆角"
            value={glass.radius}
            min={8}
            max={40}
            step={1}
            unit="px"
            onChange={(radius) => setGlass({ radius })}
          />
          <SliderRow
            label="光晕"
            value={glass.glow}
            min={0}
            max={90}
            step={1}
            unit="px"
            onChange={(glow) => setGlass({ glow })}
          />
          <SliderRow
            label="高光"
            value={glass.sheen}
            min={0}
            max={0.7}
            step={0.01}
            onChange={(sheen) => setGlass({ sheen })}
          />
          <SliderRow
            label="虹彩"
            value={glass.iris}
            min={0}
            max={1}
            step={0.01}
            onChange={(iris) => setGlass({ iris })}
          />
          <SliderRow
            label="噪点"
            value={glass.grain}
            min={0}
            max={0.35}
            step={0.01}
            onChange={(grain) => setGlass({ grain })}
          />
        </Group>

        <Group title="光学">
          <p className="text-xs text-muted">折射要低模糊才看得见形变。先试「液态」或「透镜」。光斑会跟着指针走。</p>
          <SliderRow
            label="折射"
            value={glass.refract}
            min={0}
            max={42}
            step={1}
            onChange={(refract) => setGlass({ refract })}
          />
          <SliderRow
            label="亮度"
            value={glass.bright}
            min={90}
            max={130}
            step={1}
            unit="%"
            onChange={(bright) => setGlass({ bright })}
          />
          <SliderRow
            label="对比"
            value={glass.contrast}
            min={90}
            max={130}
            step={1}
            unit="%"
            onChange={(contrast) => setGlass({ contrast })}
          />
          <SliderRow
            label="厚度"
            value={glass.thickness}
            min={0}
            max={1}
            step={0.01}
            onChange={(thickness) => setGlass({ thickness })}
          />
          <SliderRow
            label="色散"
            value={glass.chroma}
            min={0}
            max={1}
            step={0.01}
            onChange={(chroma) => setGlass({ chroma })}
          />
        </Group>

        <Group title="布局">
          <SliderRow
            label="宽度"
            value={fan.cardW}
            min={160}
            max={280}
            step={2}
            unit="px"
            onChange={(cardW) => setFan({ cardW })}
          />
          <SliderRow
            label="高度"
            value={fan.cardH}
            min={230}
            max={380}
            step={2}
            unit="px"
            onChange={(cardH) => setFan({ cardH })}
          />
          <SliderRow
            label="扇角"
            value={fan.spread}
            min={0}
            max={22}
            step={0.5}
            unit="°"
            onChange={(spread) => setFan({ spread })}
          />
          <SliderRow
            label="间距"
            value={fan.gap}
            min={40}
            max={150}
            step={1}
            unit="px"
            onChange={(gap) => setFan({ gap })}
          />
          <SliderRow
            label="弧度"
            value={fan.arc}
            min={0}
            max={36}
            step={1}
            unit="px"
            onChange={(arc) => setFan({ arc })}
          />
          <SliderRow
            label="层叠错位"
            value={fan.stack}
            min={4}
            max={40}
            step={1}
            unit="px"
            onChange={(stack) => setFan({ stack })}
          />
        </Group>

        <Group title="动效">
          <SliderRow
            label="抬起时长"
            value={motion.duration}
            min={200}
            max={1400}
            step={20}
            unit="ms"
            onChange={(duration) => setMotion({ duration })}
          />
          <SliderRow
            label="悬停放大"
            value={motion.scale}
            min={1}
            max={1.18}
            step={0.01}
            onChange={(scale) => setMotion({ scale })}
          />
          <SliderRow
            label="悬停抬升"
            value={motion.lift}
            min={0}
            max={72}
            step={1}
            unit="px"
            onChange={(lift) => setMotion({ lift })}
          />
          <SliderRow
            label="邻卡模糊"
            value={motion.sibBlur}
            min={0}
            max={22}
            step={1}
            unit="px"
            onChange={(sibBlur) => setMotion({ sibBlur })}
          />
          <SliderRow
            label="邻卡透明度"
            value={motion.sibOp}
            min={0.1}
            max={0.8}
            step={0.02}
            onChange={(sibOp) => setMotion({ sibOp })}
          />
        </Group>
      </div>
    </div>
  );
}
