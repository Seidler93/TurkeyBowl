import { test } from "node:test";
import assert from "node:assert/strict";
import { getGameYear, thanksgivingDate, gameDateLabel } from "./gameYear.js";

test("Thanksgiving is the fourth Thursday, including years with five Thursdays", () => {
  assert.equal(thanksgivingDate(2026), "2026-11-26");
  assert.equal(thanksgivingDate(2027), "2027-11-25");
  assert.equal(thanksgivingDate(2029), "2029-11-22");
  assert.equal(gameDateLabel(2027), "Thursday, November 25, 2027");
});

test("signup year rolls over at Chicago midnight after Thanksgiving", () => {
  assert.equal(getGameYear(new Date("2026-11-27T05:59:59Z")), 2026);
  assert.equal(getGameYear(new Date("2026-11-27T06:00:00Z")), 2027);
  assert.equal(getGameYear(new Date("2027-01-01T00:00:00Z")), 2027);
  assert.equal(getGameYear(new Date("2027-07-01T12:00:00Z")), 2027);
  assert.equal(getGameYear(new Date("2027-11-26T06:00:00Z")), 2028);
});
