import { useEffect, useState, useId } from "react";
import { normalizeColor } from "@/lib/mosha/validation";

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setDraft(value); setInvalid(false); }, [value]);
  function commit() {
    const color = normalizeColor(draft);
    setInvalid(color === null);
    if (color) { setDraft(color); onChange(color); }
  }
  return <div className="grid gap-1.5 text-xs text-muted">
    <label htmlFor={id}>{label}</label>
    <div className="flex items-center gap-2">
      <input type="color" aria-label={`${label}选择器`} value={value} onChange={event=>onChange(event.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"/>
      <input id={id} aria-label={`${label}十六进制`} value={draft} maxLength={7} spellCheck={false}
        onChange={event=>{setDraft(event.target.value);setInvalid(false);}} onBlur={commit}
        onKeyDown={event=>{if(event.key==="Enter")commit();if(event.key==="Escape"){setDraft(value);setInvalid(false);}}}
        aria-invalid={invalid} aria-describedby={invalid?`${id}-error`:undefined} className="mosha-field min-w-0 font-mono uppercase"/>
    </div>
    {invalid&&<p id={`${id}-error`} role="status">请输入 #RGB 或 #RRGGBB；当前颜色未改变。</p>}
  </div>;
}
