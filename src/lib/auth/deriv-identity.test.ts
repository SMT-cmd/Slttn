import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  derivLoginIdFromSyntheticEmail,
  extractDerivAccountId,
  extractDerivLoginId,
  extractDerivNickname,
  safeDerivDisplayName,
} from "./deriv-identity.ts";

describe("Deriv identity normalization", () => {
  it("keeps the stable options account id but prefers a mapped CR for display/profile use", () => {
    assert.equal(extractDerivAccountId({ data: [{ account_id: "rt91648386" }] }), "RT91648386");
    assert.equal(extractDerivLoginId({ data: { loginids: { CR90000123: [{}] } } }), "CR90000123");
  });

  it("extracts a nickname without mistaking account identifiers for names", () => {
    assert.equal(extractDerivNickname({ data: { nickname: "Ada Trader" } }), "Ada Trader");
    assert.equal(extractDerivNickname({ nickname: "RT91648386" }), null);
    assert.equal(extractDerivNickname({ nickname: "ROT91648386" }), null);
    assert.equal(safeDerivDisplayName("Deriv RT91648386"), "");
    assert.equal(safeDerivDisplayName("Deriv ROT91648386"), "");
    assert.equal(safeDerivDisplayName("Ada Trader"), "Ada Trader");
  });

  it("recovers only real CR-style IDs from synthetic auth email addresses", () => {
    assert.equal(derivLoginIdFromSyntheticEmail("cr90000123@deriv.local"), "CR90000123");
    assert.equal(derivLoginIdFromSyntheticEmail("rt91648386@deriv.local"), null);
  });
});
