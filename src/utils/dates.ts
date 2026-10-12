import { format } from "date-fns";

/** ISO timestamp from the API → "yyyy-MM-dd" in local time, for <input type="date">. */
export const toDateInput = (iso?: string) => (iso ? format(new Date(iso), "yyyy-MM-dd") : "");

/**
 * "yyyy-MM-dd" from a date input → ISO timestamp for the API (which expects a full
 * OffsetDateTime). Noon local time keeps the calendar day stable across time zones;
 * `new Date("2026-10-30")` would be UTC midnight and show as the 29th west of UTC.
 */
export const fromDateInput = (value: string) =>
  value ? new Date(`${value}T12:00:00`).toISOString() : undefined;
