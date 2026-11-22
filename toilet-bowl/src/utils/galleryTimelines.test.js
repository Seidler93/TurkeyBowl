import { test } from "node:test";
import assert from "node:assert/strict";
import { galleryTimelines, getLatestGalleryYear } from "./galleryTimelines.js";

test("gallery unlocks at Chicago midnight on the Monday before Thanksgiving", () => {
  assert.equal(getLatestGalleryYear(new Date("2026-11-23T05:59:59Z")), 2025);
  assert.equal(getLatestGalleryYear(new Date("2026-11-23T06:00:00Z")), 2026);
  assert.equal(getLatestGalleryYear(new Date("2026-11-27T06:00:00Z")), 2026);
  assert.equal(getLatestGalleryYear(new Date("2027-07-01T12:00:00Z")), 2026);
  assert.equal(getLatestGalleryYear(new Date("2027-11-22T05:59:59Z")), 2026);
  assert.equal(getLatestGalleryYear(new Date("2027-11-22T06:00:00Z")), 2027);
});

test("years stay available newest first with matching storage paths", () => {
  const options = galleryTimelines(2026);
  assert.deepEqual(options.map((option) => option.label), ["2026", "2025", "2024", "The Past"]);
  assert.equal(options[0].thumbFolderName, "gallery-thumbs/2026");
  assert.equal(options[0].fullFolderName, "gallery-full/2026");
  assert.equal(options[0].year, 2026);
  assert.equal(options.at(-1).folderKey, "past");
  assert.equal(galleryTimelines(2027)[0].label, "2027");
});
