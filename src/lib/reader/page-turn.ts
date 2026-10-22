/** Pure interaction rules for the Trading Library's touch/pen/mouse page turn. */
export type TurnDirection = "next" | "previous";

export const TURN_FINISH_MS = 900;
export const TURN_RETURN_MS = 330;
export const TURN_INTENT_PX = 12;

export function clampTurnProgress(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** A neutral press previews the nearer edge; actual swipe direction wins. */
export function resolveTurnDirection(
  deltaX: number,
  initialDirection: TurnDirection,
  canNext: boolean,
  canPrevious: boolean,
): TurnDirection | null {
  const direction = Math.abs(deltaX) < TURN_INTENT_PX
    ? initialDirection
    : deltaX < 0 ? "next" : "previous";
  if (direction === "next" && !canNext) return null;
  if (direction === "previous" && !canPrevious) return null;
  return direction;
}

/** Turning a page requires a deliberate gesture; a tiny tap never advances. */
export function shouldCompleteTurn(deltaX: number, width: number, elapsedMs: number): boolean {
  if (!Number.isFinite(deltaX) || !Number.isFinite(width) || width <= 0) return false;
  const distance = Math.abs(deltaX);
  const threshold = Math.min(108, Math.max(56, width * 0.21));
  const velocity = distance / Math.max(elapsedMs, 1);
  return distance >= threshold || (distance >= 38 && velocity >= 0.75);
}

export function turnProgressFromDrag(deltaX: number, width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 0;
  return clampTurnProgress(Math.abs(deltaX) / (width * 0.84));
}

/** Keep the visible side of the leaf towards the reader throughout the gesture. */
export function leafAngle(direction: TurnDirection, progress: number): number {
  const p = clampTurnProgress(progress);
  return direction === "next" ? -178 * p : -178 * (1 - p);
}

/** Edge grip changes the corner radius; center grips remain mostly straight. */
export function cornerCurl(gripY: number, progress: number) {
  const y = clampTurnProgress(gripY);
  const amount = Math.sin(Math.PI * clampTurnProgress(progress));
  return {
    top: Math.round((7 + 34 * (1 - y) ** 3) * amount),
    bottom: Math.round((7 + 34 * y ** 3) * amount),
  };
}
