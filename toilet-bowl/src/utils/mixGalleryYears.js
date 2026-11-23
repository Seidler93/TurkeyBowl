function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function mixGalleryYears(photos) {
  const byYear = new Map();
  for (const photo of photos) {
    const timeline = String(photo.timeline ?? photo.year ?? "");
    if (!photo.thumbUrl || !(/^[0-9]{4}$/.test(timeline) || timeline === "The Past")) continue;
    if (!byYear.has(timeline)) byYear.set(timeline, []);
    byYear.get(timeline).push(photo);
  }
  const groups = shuffle([...byYear.values()].map(shuffle));
  const result = [];
  // Take one photo per year each round so large albums cannot bury smaller ones.
  for (let index = 0; groups.some((group) => index < group.length); index++) {
    for (const group of groups) {
      if (index < group.length) result.push(group[index]);
    }
  }
  return result;
}
