type CalendarEvent = {
  description: string;
  endDate: string;
  location?: string;
  startDate: string;
  title: string;
};

function escapeIcsText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}

function compactDate(date: string) { return date.replaceAll("-", ""); }

export function createCalendarFile(event: CalendarEvent) {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maria e Sergio//Convite de Casamento//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:maria-sergio-" + compactDate(event.startDate) + "@convite",
    "DTSTAMP:" + new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, ""),
    "DTSTART;VALUE=DATE:" + compactDate(event.startDate),
    "DTEND;VALUE=DATE:" + compactDate(event.endDate),
    "SUMMARY:" + escapeIcsText(event.title),
    "DESCRIPTION:" + escapeIcsText(event.description),
    event.location ? "LOCATION:" + escapeIcsText(event.location) : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  return new Blob([body], { type: "text/calendar;charset=utf-8" });
}

export function createGoogleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    dates: compactDate(event.startDate) + "/" + compactDate(event.endDate),
    details: event.description,
    text: event.title,
  });
  if (event.location) params.set("location", event.location);
  return "https://calendar.google.com/calendar/render?" + params.toString();
}
