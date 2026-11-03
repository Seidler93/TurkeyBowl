import { thanksgivingDate } from "./gameYear.js";

export function eventDate(event, year) {
  if (event.recurrence !== "thanksgiving-eve") return event.date;

  const date = new Date(`${thanksgivingDate(year)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  const day = date.toISOString().slice(0, 10);
  // Thanksgiving week is always Central Standard Time; retain dinner's local time.
  const time = event.date.slice(11, 19);
  return `${day}T${time}-06:00`;
}
