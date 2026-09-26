import { cn } from "@/lib/utils";

const SHAPE = [
  { x: 8, h: 42, wick: 18, up: false },
  { x: 28, h: 58, wick: 14, up: false },
  { x: 48, h: 36, wick: 22, up: true },
  { x: 68, h: 28, wick: 16, up: true },
  { x: 88, h: 48, wick: 20, up: false },
  { x: 108, h: 64, wick: 18, up: false },
  { x: 128, h: 40, wick: 14, up: true },
  { x: 148, h: 46, wick: 24, up: true },
  { x: 168, h: 32, wick: 12, up: true },
  { x: 188, h: 54, wick: 16, up: false },
  { x: 208, h: 38, wick: 20, up: true },
];

export function CandleStrip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 110"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {SHAPE.map((c, i) => {
        const bodyY = 88 - c.h;
        const color = c.up ? "var(--profit)" : i % 5 === 0 ? "#1a1f24" : "var(--loss)";
        return (
          <g key={c.x} className="candle" style={{ animationDelay: `${i * 120}ms` }}>
            <line
              x1={c.x + 5}
              x2={c.x + 5}
              y1={bodyY - c.wick / 2}
              y2={bodyY + c.h + c.wick / 2}
              stroke={color}
              strokeWidth="1.6"
            />
            <rect
              x={c.x}
              y={bodyY}
              width="10"
              height={c.h}
              fill={color}
              rx="1"
            />
          </g>
        );
      })}
    </svg>
  );
}
