const FEEDS = {
  last: "https://nfs.faireconomy.media/ff_calendar_lastweek.json",
  this: "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  next: "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
};

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
  return Array.isArray(rows) ? rows.map((event) => normalizeEvent(event, week)) : [];
}

export default async function handler(req, res) {
  try {
    const requested = String(req.query?.range || "all").toLowerCase();
    const weeks = requested === "last" || requested === "this" || requested === "next"
      ? [requested]
      : ["last", "this", "next"];

    const settled = await Promise.allSettled(weeks.map(fetchFeed));
    const events = settled
      .filter((item) => item.status === "fulfilled")
      .flatMap((item) => item.value)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (!events.length) {
      const error = settled.find((item) => item.status === "rejected")?.reason;
      throw error || new Error("No economic calendar events available");
    }

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=21600");
    res.status(200).json({
      ok: true,
      source: "ForexFactory",
      updatedAt: new Date().toISOString(),
      count: events.length,
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
