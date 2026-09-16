import { SYMBOL_PATHS } from "@/lib/mosha/symbols";
import type { SymbolName } from "@/lib/mosha/types";

export function SymbolIcon({
  name,
  size = 44,
  className,
}: {
  name: SymbolName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d={SYMBOL_PATHS[name]} />
    </svg>
  );
}
