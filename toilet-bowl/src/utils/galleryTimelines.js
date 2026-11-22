import { chicagoDate, thanksgivingDate } from "./gameYear.js";

export function getLatestGalleryYear(now = new Date()) {
  const today = chicagoDate(now);
  const year = Number(today.slice(0, 4));
  const monday = new Date(`${thanksgivingDate(year)}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - 3);
  return Math.max(2025, today >= monday.toISOString().slice(0, 10) ? year : year - 1);
}

export function galleryTimelines(latestYear) {
  const years = Array.from({ length: latestYear - 2024 + 1 }, (_, index) => {
    const year = latestYear - index;
    return { label: String(year), timeline: String(year), folderKey: String(year), year };
  });
  return [...years, { label: "The Past", timeline: "The Past", folderKey: "past", year: null }]
    .map((option) => ({
      ...option,
      thumbFolderName: `gallery-thumbs/${option.folderKey}`,
      fullFolderName: `gallery-full/${option.folderKey}`,
    }));
}
