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
const FALLBACK_EVENTS_BY_WEEK = {
  last: [
    { day: 1, time: "All day", country: "All", impact: "Low", title: "G7 Meetings" },
    { day: 1, time: "18:00", country: "USD", impact: "Low", title: "NAHB Housing Market Index", actual: "37", forecast: "34", previous: "34" },
    { day: 1, time: "23:35", country: "USD", impact: "Low", title: "FOMC Member Goolsbee Speaks" },
    { day: 2, time: "00:00", country: "USD", impact: "Low", title: "TIC Long-Term Purchases", actual: "81.3B", forecast: "87.2B", previous: "57.0B" },
    { day: 2, time: "All day", country: "All", impact: "Low", title: "G7 Meetings" },
    { day: 2, time: "16:00", country: "USD", impact: "Low", title: "FOMC Member Waller Speaks" },
    { day: 2, time: "16:15", country: "USD", impact: "Low", title: "ADP Weekly Employment Change", actual: "42.3K", previous: "33.0K" },
    { day: 2, time: "18:00", country: "USD", impact: "Medium", title: "Pending Home Sales m/m", actual: "1.4%", forecast: "1.0%", previous: "1.7%" },
    { day: 3, time: "00:30", country: "USD", impact: "Low", title: "API Weekly Statistical Bulletin" },
    { day: 3, time: "15:00", country: "USD", impact: "Low", title: "FOMC Member Paulson Speaks" },
    { day: 3, time: "17:15", country: "USD", impact: "Low", title: "FOMC Member Barr Speaks" },
    { day: 3, time: "18:30", country: "USD", impact: "Low", title: "Crude Oil Inventories", actual: "-7.9M", forecast: "-2.5M", previous: "-4.3M" },
    { day: 3, time: "22:00", country: "USD", impact: "High", title: "FOMC Meeting Minutes" },
    { day: 4, time: "16:30", country: "USD", impact: "Medium", title: "Philly Fed Manufacturing Index", actual: "-0.4", forecast: "17.6", previous: "26.7" },
    { day: 4, time: "16:30", country: "USD", impact: "Medium", title: "Unemployment Claims", actual: "209K", forecast: "210K", previous: "212K" },
    { day: 4, time: "All day", country: "USD", impact: "Low", title: "Building Permits", actual: "1.44M", forecast: "1.38M", previous: "1.37M" },
    { day: 4, time: "All day", country: "USD", impact: "Low", title: "Housing Starts", actual: "1.47M", forecast: "1.42M", previous: "1.51M" },
    { day: 4, time: "17:45", country: "USD", impact: "Medium", title: "Flash Manufacturing PMI", actual: "55.3", forecast: "53.8", previous: "54.5" },
    { day: 4, time: "17:45", country: "USD", impact: "Medium", title: "Flash Services PMI", actual: "50.9", forecast: "51.1", previous: "51.0" },
    { day: 4, time: "18:30", country: "USD", impact: "Low", title: "Natural Gas Storage", actual: "101B", forecast: "96B", previous: "85B" },
    { day: 4, time: "20:20", country: "USD", impact: "Low", title: "FOMC Member Barkin Speaks" },
    { day: 5, time: "18:00", country: "USD", impact: "Medium", title: "Revised UoM Consumer Sentiment", actual: "44.8", forecast: "48.2", previous: "48.2" },
    { day: 5, time: "All day", country: "USD", impact: "Low", title: "CB Leading Index m/m", actual: "0.1%", forecast: "-0.1%", previous: "-0.6%" },
    { day: 5, time: "All day", country: "USD", impact: "Low", title: "FOMC Member Waller Speaks" },
    { day: 5, time: "All day", country: "USD", impact: "Low", title: "Revised UoM Inflation Expectations", actual: "4.8%", previous: "4.5%" },
  ],
  this: [
    { day: 1, time: "08:30", country: "USD", impact: "Medium", title: "Durable Goods Orders" },
    { day: 2, time: "10:00", country: "USD", impact: "High", title: "CB Consumer Confidence" },
    { day: 2, time: "21:30", country: "JPY", impact: "Medium", title: "Tokyo Core CPI y/y" },
    { day: 3, time: "09:00", country: "EUR", impact: "Medium", title: "German Preliminary CPI" },
    { day: 3, time: "14:00", country: "USD", impact: "Medium", title: "FOMC Meeting Minutes" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "Prelim GDP q/q" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "Unemployment Claims" },
    { day: 4, time: "10:00", country: "USD", impact: "Medium", title: "Pending Home Sales" },
    { day: 5, time: "08:30", country: "USD", impact: "High", title: "Core PCE Price Index m/m" },
    { day: 5, time: "09:45", country: "USD", impact: "Medium", title: "Chicago PMI" },
    { day: 5, time: "10:00", country: "USD", impact: "Medium", title: "Revised UoM Consumer Sentiment" },
    { day: 5, time: "All day", country: "GBP", impact: "Holiday", title: "Bank Holiday" },
  ],
  next: [
    { day: 0, time: "16:30", country: "USD", impact: "Low", title: "FOMC Member Waller Speaks" },
    { day: 1, time: "17:45", country: "USD", impact: "Low", title: "Final Manufacturing PMI" },
    { day: 1, time: "18:00", country: "USD", impact: "High", title: "ISM Manufacturing PMI", previous: "52.7" },
    { day: 1, time: "18:00", country: "USD", impact: "Medium", title: "ISM Manufacturing Prices", previous: "84.6" },
    { day: 1, time: "18:00", country: "USD", impact: "Low", title: "Construction Spending m/m", previous: "0.6%" },
    { day: 2, time: "18:00", country: "USD", impact: "Medium", title: "JOLTS Job Openings", previous: "6.87M" },
    { day: 2, time: "Tentative", country: "USD", impact: "Low", title: "RCM/TIPP Economic Optimism", previous: "42.6" },
    { day: 2, time: "All day", country: "USD", impact: "Low", title: "Wards Total Vehicle Sales", previous: "15.9M" },
    { day: 3, time: "00:30", country: "USD", impact: "Low", title: "API Weekly Statistical Bulletin" },
    { day: 3, time: "16:15", country: "USD", impact: "High", title: "ADP Non-Farm Employment Change", previous: "109K" },
    { day: 3, time: "17:45", country: "USD", impact: "Low", title: "Final Services PMI" },
    { day: 3, time: "18:00", country: "USD", impact: "High", title: "ISM Services PMI", previous: "53.6" },
    { day: 3, time: "18:00", country: "USD", impact: "Low", title: "Factory Orders m/m", previous: "1.5%" },
    { day: 3, time: "18:30", country: "USD", impact: "Low", title: "Crude Oil Inventories" },
    { day: 3, time: "22:00", country: "USD", impact: "Low", title: "Beige Book" },
    { day: 4, time: "15:30", country: "USD", impact: "Low", title: "Challenger Job Cuts y/y", previous: "-20.9%" },
    { day: 4, time: "16:30", country: "USD", impact: "Medium", title: "Unemployment Claims" },
    { day: 4, time: "All day", country: "USD", impact: "Low", title: "Revised Nonfarm Productivity q/q", previous: "0.8%" },
    { day: 4, time: "All day", country: "USD", impact: "Low", title: "Revised Unit Labor Costs q/q", previous: "2.3%" },
    { day: 4, time: "18:30", country: "USD", impact: "Low", title: "Natural Gas Storage" },
    { day: 5, time: "16:30", country: "USD", impact: "High", title: "Average Hourly Earnings m/m", previous: "0.2%" },
    { day: 5, time: "16:30", country: "USD", impact: "High", title: "Non-Farm Employment Change", previous: "115K" },
    { day: 5, time: "16:30", country: "USD", impact: "High", title: "Unemployment Rate", previous: "4.3%" },
    { day: 5, time: "23:00", country: "USD", impact: "Low", title: "Consumer Credit m/m", previous: "24.9B" },
    { day: 6, time: "Tentative", country: "USD", impact: "Low", title: "Treasury Currency Report" },
  ],
};

function getFeedWeekStartDate() {
  const now = new Date();
  const day = now.getUTCDay();
  const mondayOffset = day === 0 ? 1 : 1 - day;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset, 12, 0, 0));
  return monday;
}

function createFallbackWeekEvents(week = "this") {
  const monday = getFeedWeekStartDate();
  const weekStart = new Date(monday);
  weekStart.setUTCDate(monday.getUTCDate() + (ADJACENT_WEEK_OFFSETS[week] || 0) - 1);
  const template = FALLBACK_EVENTS_BY_WEEK[week] || FALLBACK_EVENTS_BY_WEEK.this;

  return template.map((event) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + event.day);
    const dateKey = date.toISOString().slice(0, 10);
    const hasClockTime = /^[0-9]{2}:[0-9]{2}$/.test(event.time);
    const dateIso = event.time === "All day"
      ? `${dateKey}T01:00:00-04:00`
      : hasClockTime
        ? `${dateKey}T${event.time}:00-04:00`
        : `${dateKey}T12:00:00-04:00`;
    return normalizeEvent({ ...event, date: dateIso }, week);
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
      fetched.this = cachedThisWeek?.length ? cachedThisWeek : createFallbackWeekEvents("this");
    }

    if (weeks.includes("this")) fetched.this = fetched.this || [];
    if (weeks.includes("last")) fetched.last = createFallbackWeekEvents("last");
    if (weeks.includes("next")) fetched.next = createFallbackWeekEvents("next");

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
