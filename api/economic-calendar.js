const FEEDS = {
  last: "https://nfs.faireconomy.media/ff_calendar_lastweek.json",
  this: "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  next: "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
};

const ADJACENT_WEEK_OFFSETS = {
  last: -7,
  next: 7,
};

const feedCache = {};
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
    { day: 0, time: "All day", country: "All", impact: "Medium", title: "OPEC-JMMC Meetings" },
    { day: 0, time: "All day", country: "All", impact: "Medium", title: "OPEC Meetings" },
    { day: 2, time: "06:00", country: "USD", impact: "Low", title: "NFIB Small Business Index", previous: "95.9" },
    { day: 2, time: "08:15", country: "USD", impact: "Low", title: "ADP Weekly Employment Change", previous: "35.8K" },
    { day: 2, time: "08:30", country: "USD", impact: "Low", title: "Trade Balance", previous: "-60.3B" },
    { day: 2, time: "10:00", country: "USD", impact: "Low", title: "Existing Home Sales", previous: "4.02M" },
    { day: 2, time: "All day", country: "USD", impact: "Low", title: "Final Wholesale Inventories m/m", previous: "0.5%" },
    { day: 2, time: "16:30", country: "USD", impact: "Low", title: "API Weekly Statistical Bulletin" },
    { day: 3, time: "08:30", country: "USD", impact: "High", title: "Core CPI m/m", previous: "0.4%" },
    { day: 3, time: "08:30", country: "USD", impact: "High", title: "Core CPI y/y", previous: "2.8%" },
    { day: 3, time: "08:30", country: "USD", impact: "High", title: "CPI m/m", previous: "0.6%" },
    { day: 3, time: "08:30", country: "USD", impact: "High", title: "CPI y/y", previous: "3.8%" },
    { day: 3, time: "10:30", country: "USD", impact: "Low", title: "Crude Oil Inventories" },
    { day: 3, time: "13:01", country: "USD", impact: "Low", title: "10-y Bond Auction", previous: "4.47|2.4" },
    { day: 3, time: "14:00", country: "USD", impact: "Low", title: "Federal Budget Balance", previous: "215.0B" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "Core PPI m/m", previous: "1.0%" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "PPI m/m", previous: "1.4%" },
    { day: 4, time: "08:30", country: "USD", impact: "Medium", title: "Unemployment Claims" },
    { day: 4, time: "10:30", country: "USD", impact: "Low", title: "Natural Gas Storage" },
    { day: 4, time: "13:01", country: "USD", impact: "Low", title: "30-y Bond Auction", previous: "5.05|2.3" },
    { day: 5, time: "10:00", country: "USD", impact: "Medium", title: "Prelim UoM Consumer Sentiment", previous: "48.2" },
    { day: 5, time: "10:00", country: "USD", impact: "Medium", title: "Prelim UoM Inflation Expectations", previous: "4.5%" },
    { day: 5, time: "Tentative", country: "USD", impact: "Low", title: "Treasury Currency Report" },
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
  const explicitTime = String(event?.time || "");
  const time = explicitTime === "All day" || explicitTime === "Tentative"
    ? explicitTime
    : Number.isNaN(parsed.getTime())
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
  const cached = feedCache[week];
  if (cached?.events?.length && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.events;
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
  if (normalized.length) feedCache[week] = { events: normalized, cachedAt: Date.now() };
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

    await Promise.all(weeks.map(async (week) => {
      try {
        fetched[week] = await fetchFeed(week);
      } catch (error) {
        errors[week] = error?.message || "Feed failed";
        fetched[week] = feedCache[week]?.events?.length ? feedCache[week].events : createFallbackWeekEvents(week);
      }
    }));

    const events = weeks
      .flatMap((week) => fetched[week] || [])
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (!events.length) {
      throw new Error(Object.values(errors)[0] || "No economic calendar events available");
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=900");
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
