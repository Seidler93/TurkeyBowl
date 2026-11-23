import { test } from "node:test";
import assert from "node:assert/strict";
import { mixGalleryYears } from "./mixGalleryYears.js";

function album(timeline, count) {
  return Array.from({ length: count }, (_, index) => ({ id: `${timeline}-${index}`, timeline, thumbUrl: `photo-${timeline}-${index}` }));
}

test("homepage and hero selections balance years despite unequal album sizes", () => {
  const photos = [...album("2024", 1959), ...album("2025", 54)];
  const mixed = mixGalleryYears(photos);
  assert.equal(mixed.slice(0, 10).filter((photo) => photo.timeline === "2025").length, 5);
  assert.equal(mixed.slice(0, 12).filter((photo) => photo.timeline === "2025").length, 6);
  assert.equal(mixed.length, photos.length);
  assert.equal(new Set(mixed.map((photo) => photo.id)).size, photos.length);
});

test("supports historical photos and skips test records or missing thumbnails", () => {
  const mixed = mixGalleryYears([
    ...album("The Past", 2), ...album("2025", 2), ...album("test", 1),
    { id: "missing", timeline: "2025" },
    { id: "unknown", thumbUrl: "test.jpg" },
  ]);
  assert.equal(mixed.length, 4);
  assert.equal(new Set(mixed.slice(0, 2).map((photo) => photo.timeline)).size, 2);
  assert.deepEqual(mixGalleryYears([]), []);
});
