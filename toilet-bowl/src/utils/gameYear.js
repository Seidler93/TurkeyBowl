export function thanksgivingDate(year) {
  const first = new Date(Date.UTC(year, 10, 1));
  const day = 1 + ((4 - first.getUTCDay() + 7) % 7) + 21;
  return `${year}-11-${day}`;
}

export function getGameYear(now = new Date()) {
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const year = Number(localDate.slice(0, 4));
  return localDate > thanksgivingDate(year) ? year + 1 : year;
}

export function gameDateLabel(year) {
  return new Date(`${thanksgivingDate(year)}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
