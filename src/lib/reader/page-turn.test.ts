import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveTurnDirection, shouldCompleteTurn, turnProgressFromDrag,
  leafAngle, cornerCurl, TURN_INTENT_PX, finishTurnDuration, TURN_FINISH_MS,
} from "./page-turn.ts";

test("a held center page chooses an edge, but a swipe chooses its own direction", () => {
  assert.equal(resolveTurnDirection(0, "next", true, true), "next");
  assert.equal(resolveTurnDirection(-TURN_INTENT_PX - 1, "previous", true, true), "next");
  assert.equal(resolveTurnDirection(TURN_INTENT_PX + 1, "next", true, true), "previous");
  assert.equal(resolveTurnDirection(-85, "next", false, true), null);
  assert.equal(resolveTurnDirection(85, "previous", true, false), null);
});

test("small taps and vertical drifts do not turn a page, intentional swipes do", () => {
  assert.equal(shouldCompleteTurn(4, 370, 90), false);
  assert.equal(shouldCompleteTurn(25, 370, 70), false);
  assert.equal(shouldCompleteTurn(-90, 370, 420), true);
  assert.equal(shouldCompleteTurn(48, 370, 52), true);
  assert.equal(shouldCompleteTurn(33, 370, 45), false);
});

test("turn geometry remains bounded and directions have the expected angle", () => {
  assert.equal(turnProgressFromDrag(-10000, 370), 1);
  assert.equal(turnProgressFromDrag(NaN, 370), 0);
  assert.equal(leafAngle("next", 0), 0);
  assert.equal(leafAngle("next", 1), -178);
  assert.equal(leafAngle("previous", 0), -178);
  assert.equal(leafAngle("previous", 1), 0);
});

test("grabbing the page tip produces a more pronounced curved corner", () => {
  const top = cornerCurl(0.03, 0.5);
  const middle = cornerCurl(0.5, 0.5);
  const bottom = cornerCurl(0.97, 0.5);
  assert.ok(top.top > middle.top);
  assert.ok(bottom.bottom > middle.bottom);
  assert.deepEqual(cornerCurl(0, 0), { top: 0, bottom: 0 });
});

test("button flips show the whole animation while near-complete drags settle promptly", () => {
  assert.equal(finishTurnDuration(0), TURN_FINISH_MS);
  assert.equal(finishTurnDuration(1), 300);
  assert.equal(finishTurnDuration(0.75), 450);
});
