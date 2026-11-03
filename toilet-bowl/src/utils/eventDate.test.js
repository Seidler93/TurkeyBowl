import { test } from "node:test";
import assert from "node:assert/strict";
import { eventDate } from "./eventDate.js";

test("dinner follows Thanksgiving eve and retains its local time", () => {
  const dinner = { recurrence: "thanksgiving-eve", date: "2026-11-25T18:00:00-06:00" };
  assert.equal(eventDate(dinner, 2026), "2026-11-25T18:00:00-06:00");
  assert.equal(eventDate(dinner, 2027), "2027-11-24T18:00:00-06:00");
  assert.equal(eventDate(dinner, 2029), "2029-11-21T18:00:00-06:00");
});

test("practice keeps its explicitly scheduled date", () => {
  const practice = { date: "2026-11-21T12:30:00-06:00" };
  assert.equal(eventDate(practice, 2026), practice.date);
});
