import type { ReactNode } from "react";
import { Shell } from "./shell";

export function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Shell>
      <article className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Legal</p>
        <h1 className="mt-3 font-display text-5xl">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">{children}</div>
      </article>
    </Shell>
  );
}
