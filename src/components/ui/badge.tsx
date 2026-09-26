import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "navy",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "navy" | "green" | "red" | "blue" | "muted";
}) {
  const tones = {
    navy: "bg-navy text-navy-foreground",
    green: "bg-profit/12 text-profit",
    red: "bg-loss/12 text-loss",
    blue: "bg-primary/12 text-primary",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
