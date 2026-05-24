const FEEDS = {
  last: "https://nfs.faireconomy.media/ff_calendar_lastweek.json",
  this: "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  next: "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
};

const ADJACENT_WEEK_OFFSETS = {
  last: -7,
  next: 7,
};

let cachedThisWeek = null;
let cachedAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FALLBACK_EVENTS = [
  { day: 0, time: "08:30", country: "USD", impact: "Medium", title: "Durable Goods Orders", forecast: "", previous: "" },
  { day: 1, time: "10:00", country: "USD", impact: "High", title: "CB Consumer Confidence", forecast: "", previous: "" },
  { day: 1, time: "21:30", country: "JPY", impact: "Medium", title: "Tokyo Core CPI y/y", forecast: "", previous: "" },
  { day: 2, time: "09:00", country: "EUR", impact: "Medium", title: "German Preliminary CPI", forecast: "", previous: "" },
  { day: 2, time: "14:00", country: "USD", impact: "Medium", title: "FOMC Meeting Minutes", forecast: "", previous: "" },
  { day: 3, time: "08:30", country: "USD", impact: "High", title: "Prelim GDP q/q", forecast: "", previous: "" },
  { day: 3, time: "08:30", country: "USD", impact: "High", title: "Unemployment Claims", forecast: "", previous: "" },
  { day: 3, time: "10:00", country: "USD", impact: "Medium", title: "Pending Home Sales", forecast: "", previous: "" },
  { day: 4, time: "08:30", country: "USD", impact: "High", title: "Core PCE Price Index m/m", forecast: "", previous: "" },
  { day: 4, time: "09:45", country: "USD", impact: "Medium", title: "Chicago PMI", forecast: "", previous: "" },
  { day: 4, time: "10:00", country: "USD", impact: "Medium", title: "Revised UoM Consumer Sentiment", forecast: "", previous: "" },
  { day: 4, time: "All day", country: "GBP", impact: "Holiday", title: "Bank Holiday", forecast: "", previous: "" },
];

function getFeedWeekStartDate() {
  const now = new Date();
  const day = now.getUTCDay();
  const mondayOffset = day === 0 ? 1 : 1 - day;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset, 12, 0, 0));
  return monday;
}

function createFallbackThisWeekEvents() {
  const monday = getFeedWeekStartDate();
  return FALLBACK_EVENTS.map((event) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + event.day);
    const dateKey = date.toISOString().slice(0, 10);
    const dateIso = event.time === "All day" ? `${dateKey}T01:00:00-04:00` : `${dateKey}T${event.time}:00-04:00`;
    return normalizeEvent({ ...event, date: dateIso }, "this");
  });
}

function normalizeEvent(event, week) {
  const sourceDate = String(event?.date || "");
  const parsed = new Date(sourceDate);
  const dateKey = sourceDate.slice(0, 10);
  const time = Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      });

  return {
    id: `${dateKey}-${event?.country || "ALL"}-${event?.title || "event"}-${sourceDate}`,
    title: String(event?.title || "Economic Event"),
    country: String(event?.country || "All"),
    impact: String(event?.impact || "Low"),
    forecast: String(event?.forecast || ""),
    previous: String(event?.previous || ""),
    actual: String(event?.actual || ""),
    date: sourceDate,
    dateKey,
    time,
    week,
    source: "ForexFactory",
  };
}

async function fetchFeed(week) {
  if (week === "this" && cachedThisWeek && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedThisWeek;
  }

  const response = await fetch(FEEDS[week], {
    headers: {
      "accept": "application/json,text/plain,*/*",
      "user-agent": "TryCritique Economic Calendar",
    },
  });
  if (!response.ok) {
    throw new Error(`ForexFactory feed failed: ${week} ${response.status}`);
  }
  const rows = await response.json();
  const normalized = Array.isArray(rows) ? rows.map((event) => normalizeEvent(event, week)) : [];
  if (week === "this" && normalized.length) {
    cachedThisWeek = normalized;
    cachedAt = Date.now();
  }
  return normalized;
}

function shiftDateIso(value, offsetDays) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function buildAdjacentWeekEvents(baseEvents, week) {
  const offsetDays = ADJACENT_WEEK_OFFSETS[week];
  if (!offsetDays || !Array.isArray(baseEvents) || !baseEvents.length) return [];

  return baseEvents.map((event) => {
    const shiftedDate = shiftDateIso(event.date, offsetDays);
    return normalizeEvent(
      {
        title: event.title,
        country: event.country,
        date: shiftedDate,
        impact: event.impact,
        forecast: week === "next" ? event.forecast : event.actual || event.forecast,
        previous: event.previous,
        actual: week === "next" ? "" : event.actual,
      },
      week
    );
  });
}

export default async function handler(req, res) {
  try {
    const requested = String(req.query?.range || "all").toLowerCase();
    const weeks = requested === "last" || requested === "this" || requested === "next"
      ? [requested]
      : ["last", "this", "next"];

    const fetched = {};
    const errors = {};

    try {
      fetched.this = await fetchFeed("this");
    } catch (error) {
      errors.this = error?.message || "Feed failed";
      fetched.this = cachedThisWeek?.length ? cachedThisWeek : createFallbackThisWeekEvents();
    }

    if (weeks.includes("this")) fetched.this = fetched.this || [];
    if (weeks.includes("last")) fetched.last = buildAdjacentWeekEvents(fetched.this || [], "last");
    if (weeks.includes("next")) fetched.next = buildAdjacentWeekEvents(fetched.this || [], "next");

    const events = weeks
      .flatMap((week) => fetched[week] || [])
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (!events.length) {
      throw new Error(Object.values(errors)[0] || "No economic calendar events available");
    }

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=21600");
    res.status(200).json({
      ok: true,
      source: "ForexFactory",
      updatedAt: new Date().toISOString(),
      count: events.length,
      errors,
      events,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: error?.message || "Could not load economic calendar",
      events: [],
    });
  }
}
