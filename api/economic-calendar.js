const FEEDS = {
  this: "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
};

const TRADINGVIEW_EVENTS_URL = "https://economic-calendar.tradingview.com/events";
const TRADINGVIEW_COUNTRIES = "US,EU,GB,JP,CA,AU,NZ,CH,CN";

const ADJACENT_WEEK_OFFSETS = {
  last: -7,
  next: 7,
};

const feedCache = {};
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FALLBACK_EVENTS_BY_WEEK = {
  last: [
    { day: 1, time: "All day", country: "USD", impact: "Holiday", title: "Bank Holiday" },
    { day: 2, time: "09:00", country: "USD", impact: "Low", title: "HPI m/m", actual: "0.1%", forecast: "0.1%", previous: "-0.1%" },
    { day: 2, time: "09:00", country: "USD", impact: "Low", title: "S&P/CS Composite-20 HPI y/y", actual: "0.8%", forecast: "0.9%", previous: "0.9%" },
    { day: 2, time: "10:00", country: "USD", impact: "Medium", title: "CB Consumer Confidence", actual: "93.1", forecast: "91.9", previous: "93.8" },
    { day: 3, time: "04:00", country: "USD", impact: "Low", title: "FOMC Member Logan Speaks" },
    { day: 3, time: "08:15", country: "USD", impact: "Low", title: "ADP Weekly Employment Change", actual: "35.8K", previous: "40.8K" },
    { day: 3, time: "10:00", country: "USD", impact: "Low", title: "Richmond Manufacturing Index", actual: "13", forecast: "4", previous: "3" },
    { day: 3, time: "15:55", country: "USD", impact: "Low", title: "FOMC Member Cook Speaks" },
    { day: 3, time: "16:30", country: "USD", impact: "Low", title: "API Weekly Statistical Bulletin" },
    { day: 3, time: "20:00", country: "USD", impact: "Low", title: "FOMC Member Jefferson Speaks" },
    { day: 3, time: "22:25", country: "USD", impact: "Low", title: "FOMC Member Goolsbee Speaks" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "Core PCE Price Index m/m", actual: "0.2%", forecast: "0.3%", previous: "0.3%" },
    { day: 4, time: "08:30", country: "USD", impact: "High", title: "Prelim GDP q/q", actual: "1.6%", forecast: "2.0%", previous: "0.7%" },
    { day: 4, time: "08:30", country: "USD", impact: "Medium", title: "Prelim GDP Price Index q/q", actual: "3.5%", forecast: "3.6%", previous: "3.8%" },
    { day: 4, time: "08:30", country: "USD", impact: "Medium", title: "Unemployment Claims", actual: "215K", forecast: "211K", previous: "210K" },
    { day: 4, time: "08:30", country: "USD", impact: "Low", title: "Core Durable Goods Orders m/m", actual: "1.1%", forecast: "0.5%", previous: "1.1%" },
    { day: 4, time: "08:30", country: "USD", impact: "Low", title: "Durable Goods Orders m/m", actual: "7.9%", forecast: "4.0%", previous: "1.3%" },
    { day: 4, time: "08:30", country: "USD", impact: "Low", title: "Personal Income m/m", actual: "0.0%", forecast: "0.4%", previous: "0.5%" },
    { day: 4, time: "08:30", country: "USD", impact: "Low", title: "Personal Spending m/m", actual: "0.5%", forecast: "0.5%", previous: "1.0%" },
    { day: 4, time: "08:55", country: "USD", impact: "Low", title: "FOMC Member Williams Speaks" },
    { day: 4, time: "10:00", country: "USD", impact: "Medium", title: "New Home Sales", actual: "622K", forecast: "661K", previous: "663K" },
    { day: 4, time: "10:15", country: "USD", impact: "Low", title: "FOMC Member Musalem Speaks" },
    { day: 4, time: "10:30", country: "USD", impact: "Low", title: "Natural Gas Storage", actual: "92B", forecast: "96B", previous: "101B" },
    { day: 4, time: "12:00", country: "USD", impact: "Low", title: "Crude Oil Inventories", actual: "-3.3M", forecast: "-3.8M", previous: "-7.9M" },
    { day: 4, time: "13:10", country: "USD", impact: "Low", title: "FOMC Member Musalem Speaks" },
    { day: 4, time: "14:00", country: "USD", impact: "Medium", title: "Treasury Sec Bessent Speaks" },
    { day: 4, time: "15:00", country: "USD", impact: "Low", title: "FOMC Member Barkin Speaks" },
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

function getCalendarWeekBounds(week = "this") {
  const monday = getFeedWeekStartDate();
  const start = new Date(monday);
  start.setUTCDate(monday.getUTCDate() + (ADJACENT_WEEK_OFFSETS[week] || 0) - 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  end.setUTCHours(0, 0, 0, 0);

  return { start, end };
}

function getDateKeyInTimeZone(value, timeZone = "America/New_York") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : value.toISOString().slice(0, 10);
}

function formatCalendarValue(value, unit = "", scale = "") {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value);
  if (!text || text === "NaN") return "";
  if (unit === "%") return `${text}%`;
  return `${unit || ""}${text}${scale || ""}`;
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

function normalizeTradingViewEvent(event, week) {
  const sourceDate = String(event?.date || event?.datetime || event?.time || "");
  const parsed = new Date(sourceDate);
  const title = String(event?.title || event?.indicator || event?.event || "Economic Event");
  const isHoliday = /holiday/i.test(title)
    || /holiday/i.test(String(event?.indicator || ""))
    || String(event?.category || "").toLowerCase().includes("holiday");
  const dateKey = Number.isNaN(parsed.getTime())
    ? sourceDate.slice(0, 10)
    : isHoliday
      ? parsed.toISOString().slice(0, 10)
      : getDateKeyInTimeZone(parsed);
  const time = isHoliday
    ? "All day"
    : Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/New_York",
        });
  const importance = Number(event?.importance ?? event?.impact ?? -1);
  const impact = isHoliday ? "Holiday" : importance >= 1 ? "High" : importance === 0 ? "Medium" : "Low";
  const country = String(event?.currency || event?.country || event?.ticker || "All").toUpperCase();

  return {
    id: `${dateKey}-${country}-${title}-${sourceDate}`,
    title,
    country,
    impact,
    forecast: formatCalendarValue(event?.forecast, event?.unit, event?.scale),
    previous: formatCalendarValue(event?.previous, event?.unit, event?.scale),
    actual: formatCalendarValue(event?.actual, event?.unit, event?.scale),
    date: Number.isNaN(parsed.getTime()) ? sourceDate : parsed.toISOString(),
    dateKey,
    time,
    week,
    source: "TradingView",
  };
}

async function fetchTradingViewFeed(week) {
  const { start, end } = getCalendarWeekBounds(week);
  const url = new URL(TRADINGVIEW_EVENTS_URL);
  url.searchParams.set("countries", TRADINGVIEW_COUNTRIES);
  url.searchParams.set("from", start.toISOString());
  url.searchParams.set("to", end.toISOString());

  const response = await fetch(url, {
    headers: {
      "accept": "application/json,text/plain,*/*",
      "origin": "https://www.tradingview.com",
      "referer": "https://www.tradingview.com/",
      "user-agent": "Mozilla/5.0 TryCritique Economic Calendar",
    },
  });
  if (!response.ok) {
    throw new Error(`TradingView feed failed: ${week} ${response.status}`);
  }
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.result) ? payload.result : [];
  return rows
    .map((event) => normalizeTradingViewEvent(event, week))
    .filter((event) => event.dateKey);
}

async function fetchFeed(week) {
  const cached = feedCache[week];
  if (cached?.events?.length && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.events;
  }

  if (week === "last" || week === "next") {
    const normalized = await fetchTradingViewFeed(week);
    feedCache[week] = { events: normalized, cachedAt: Date.now() };
    return normalized;
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
      source: "Live economic calendar",
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
