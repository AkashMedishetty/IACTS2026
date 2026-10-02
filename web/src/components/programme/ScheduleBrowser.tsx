"use client";

import { useMemo, useState } from "react";
import {
  breakthroughDayId,
  breakthroughNote,
  breakthroughTopics,
  scheduleDays,
  scheduleStatus,
  workshopHalls,
  type ScheduleItem,
} from "@/data/schedule";
import { days } from "@/data/conference";

/**
 * The schedule, searchable.
 *
 * The committee sent it as two spreadsheets. It is rendered as HTML rather than
 * offered as a file: a delegate looking for their own talk should be able to
 * type their name and see it, on a phone, without downloading anything.
 *
 * Search runs over every field that identifies a session — speaker, title,
 * track, chairpersons, time and day — so "Gokhale", "robotic", "aortic",
 * "panel" and "9:30" all find the right rows. Filtering is client-side over a
 * few dozen items; there is nothing to fetch.
 */

type Row = {
  key: string;
  dayId: string;
  dayLabel: string;
  dayDate: string;
  venue: string;
  item: ScheduleItem;
  /** Which parallel strand this belongs to: a workshop hall, the main
      programme, or the Breakthrough Sessions that run alongside it. */
  stream: string;
  haystack: string;
};

const WORKSHOP_ID = "workshop";

function useRows(): Row[] {
  return useMemo(() => {
    const rows: Row[] = [];

    workshopHalls.forEach((hall) => {
      hall.items.forEach((item, i) => {
        const it: ScheduleItem = {
          title: item.title,
          speaker: "speaker" in item ? item.speaker : undefined,
          track: hall.hall,
          kind: "talk",
        };
        rows.push({
          key: `${hall.hall}-${i}`,
          dayId: WORKSHOP_ID,
          dayLabel: "Pre-conference workshop",
          dayDate: days[0].date,
          venue: days[0].venue,
          item: it,
          stream: hall.hall,
          haystack: [it.title, it.speaker, hall.hall, "workshop"].filter(Boolean).join(" ").toLowerCase(),
        });
      });
    });

    scheduleDays.forEach((day) => {
      day.items.forEach((item, i) => {
        rows.push({
          key: `${day.id}-${i}`,
          dayId: day.id,
          dayLabel: day.label,
          dayDate: day.date,
          venue: day.venue,
          item,
          stream: "Main programme",
          haystack: [
            item.title,
            item.speaker,
            item.track,
            item.time,
            item.kind,
            day.label,
            day.date,
            (item.chairpersons || []).join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        });
      });
    });

    const btDay = scheduleDays.find((d) => d.id === breakthroughDayId);
    if (btDay) {
      breakthroughTopics.forEach((topic, i) => {
        rows.push({
          key: `breakthrough-${i}`,
          dayId: btDay.id,
          dayLabel: btDay.label,
          dayDate: btDay.date,
          venue: btDay.venue,
          item: { title: topic, track: "Breakthrough", kind: "special" },
          stream: "Breakthrough",
          haystack: `${topic} breakthrough session parallel`.toLowerCase(),
        });
      });
    }

    return rows;
  }, []);
}

/** Wraps every occurrence of the query so a match is visible at a glance. */
function Mark({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-[#f8e0e5] text-[#5f0717]">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const KIND_LABEL: Record<ScheduleItem["kind"], string> = {
  talk: "",
  panel: "Panel",
  break: "Break",
  ceremony: "Ceremony",
  special: "Session",
};

function Item({ row, query, bare = false }: { row: Row; query: string; bare?: boolean }) {
  const { item } = row;
  const quiet = item.kind === "break";
  /* Inside the Breakthrough block the heading already says what these are, and
     they carry no times, so the time column and the chips are dropped. */
  if (bare) {
    return (
      <li className="border-b border-[var(--hair)] py-2.5 text-[clamp(1rem,1.35vw,1.12rem)] font-semibold leading-snug text-[#160a0d] last:border-b-0">
        <Mark text={item.title} query={query} />
      </li>
    );
  }
  return (
    <li
      className={`grid grid-cols-1 gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-1 border-b border-[var(--hair)] py-[clamp(0.85rem,2vh,1.15rem)] sm:grid-cols-[10.5rem_1fr] ${
        quiet ? "bg-[#fdf6f8]/60" : ""
      }`}
    >
      <p className="m-0 font-mono text-[0.76rem] uppercase tracking-[.08em] tabular-nums text-[#6a545a]">
        {item.time ? <Mark text={item.time} query={query} /> : <span aria-hidden>—</span>}
      </p>
      <div>
        <p
          className={`m-0 text-[clamp(1rem,1.35vw,1.12rem)] leading-snug ${
            quiet ? "font-semibold text-[#6a545a]" : "font-semibold text-[#160a0d]"
          }`}
        >
          <Mark text={item.title} query={query} />
        </p>
        {item.speaker ? (
          <p className="m-0 mt-1.5 text-[0.95rem] leading-snug text-[#b3122a]">
            <Mark text={item.speaker} query={query} />
          </p>
        ) : null}
        {item.chairpersons?.length ? (
          <p className="m-0 mt-1.5 text-[0.88rem] leading-[1.6] text-muted-foreground">
            <span className="font-mono text-[0.68rem] uppercase tracking-[.14em] text-[#6a545a]">Chairpersons</span>{" "}
            <Mark text={item.chairpersons.join(" · ")} query={query} />
          </p>
        ) : null}
        {(item.track || KIND_LABEL[item.kind]) && !quiet ? (
          <p className="m-0 mt-2 flex flex-wrap gap-2">
            {item.track ? (
              <span className="border border-[var(--hair-gold)] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[.14em] text-[#72091a]">
                <Mark text={item.track} query={query} />
              </span>
            ) : null}
            {KIND_LABEL[item.kind] ? (
              <span className="border border-[var(--hair)] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[.14em] text-[#6a545a]">
                {KIND_LABEL[item.kind]}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export default function ScheduleBrowser() {
  const rows = useRows();
  const [query, setQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  /* 23 October runs two halls in parallel, plus the Breakthrough Sessions, so
     the workshop needs its own filter — a delegate is in one hall, not both. */
  const [streamFilter, setStreamFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (dayFilter === "all" || r.dayId === dayFilter) &&
        (streamFilter === "all" || r.stream === streamFilter) &&
        (!q || r.haystack.includes(q)),
    );
  }, [rows, query, dayFilter, streamFilter]);

  const groups = useMemo(() => {
    const order = [WORKSHOP_ID, ...scheduleDays.map((d) => d.id)];
    return order
      .map((id) => ({ id, rows: filtered.filter((r) => r.dayId === id) }))
      .filter((g) => g.rows.length);
  }, [filtered]);

  const tabs = [
    { id: "all", label: "All" },
    { id: WORKSHOP_ID, label: `23 Oct · Workshop` },
    ...scheduleDays.map((d) => ({ id: d.id, label: `${d.date.replace(" 2026", "")} · ${d.label}` })),
  ];

  /* The parallel strands, each tied to the day it runs on. */
  const streams = [
    { id: "all", label: "All streams", day: "all" },
    ...workshopHalls.map((h) => ({ id: h.hall, label: `${h.hall} · 23 Oct`, day: WORKSHOP_ID })),
    { id: "Breakthrough", label: "Breakthrough · 24 Oct", day: breakthroughDayId },
  ];

  /* Choosing a strand selects the day it runs on; choosing a day that has no
     strands clears the strand. */
  function pickStream(id: string, day: string) {
    setStreamFilter(id);
    if (id !== "all") setDayFilter(day);
  }
  function pickDay(id: string) {
    setDayFilter(id);
    const current = streams.find((st) => st.id === streamFilter);
    if (current && current.day !== id) setStreamFilter("all");
  }

  return (
    <section id="schedule" className="u-shell py-[clamp(3rem,8vh,6rem)]">
      <p className="u-eyebrow text-gold-lift" data-r>
        Full schedule
      </p>
      <h2 className="mt-4 u-heading" data-r>
        Search the <span className="u-serif">programme</span>
      </h2>
      <p
        className="mt-5 border-l-2 border-[#b3122a] bg-white/70 px-5 py-4 text-[clamp(0.95rem,1.1vw,1.05rem)] font-semibold leading-[1.7] text-[#160a0d]"
        data-r
      >
        {scheduleStatus}
      </p>

      {/* Search + day filter. Sticky, so the box stays reachable while reading
          a long day. No negative margin: the page's own inset differs between
          mobile and desktop, and pulling against it put the field off-screen on
          a phone. */}
      <div className="sticky top-[70px] z-20 mt-7 bg-[#fffdfc]/95 py-4 backdrop-blur">
        <label className="block">
          <span className="sr-only">Search the programme</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a speaker, topic, track or time — e.g. Gokhale, robotic, aortic, 9:30"
            className="w-full border border-[#b3122a]/25 bg-white px-4 py-3.5 text-[15px] text-[#160a0d] outline-none placeholder:text-[#9c8a8f] focus:border-[#b3122a]"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickDay(t.id)}
              className={`min-h-9 border px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[.14em] transition-colors ${
                dayFilter === t.id
                  ? "border-[#b3122a] bg-[#b3122a] text-white"
                  : "border-[var(--hair)] bg-white text-[#6a545a] hover:border-[#b3122a] hover:text-[#b3122a]"
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[0.68rem] uppercase tracking-[.14em] text-[#6a545a]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "session" : "sessions"}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-[.16em] text-[#9c8a8f]">Parallel</span>
          {streams.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => pickStream(st.id, st.day)}
              className={`min-h-9 border px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[.14em] transition-colors ${
                streamFilter === st.id
                  ? "border-[#72091a] bg-[#f8e9ed] text-[#72091a]"
                  : "border-[var(--hair)] bg-white text-[#6a545a] hover:border-[#b3122a] hover:text-[#b3122a]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-10 text-[1rem] text-muted-foreground">
          Nothing matches “{query}”. Try a surname, a topic, or a track such as MICS, Aortic or Thoracic.
        </p>
      ) : (
        groups.map((g) => {
          const first = g.rows[0];
          return (
            <div key={g.id} className="mt-[clamp(2rem,5vh,3rem)]">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-[#b3122a] pb-3">
                <h3 className="m-0 text-[clamp(1.15rem,2.2vw,1.6rem)] font-extrabold tracking-[-0.02em] text-[#160a0d]">
                  {first.dayLabel} · {first.dayDate}
                </h3>
                <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[.14em] text-[#6a545a]">{first.venue}</p>
              </div>
              {g.rows.some((r) => r.stream !== "Breakthrough") ? (
                <ul className="m-0 list-none p-0">
                  {g.rows
                    .filter((r) => r.stream !== "Breakthrough")
                    .map((r) => (
                      <Item key={r.key} row={r} query={query} />
                    ))}
                </ul>
              ) : null}

              {/* The Breakthrough Sessions are not a slot in the running order:
                  they run alongside the main programme all day, so they get
                  their own heading at the end of the day rather than a time. */}
              {g.rows.some((r) => r.stream === "Breakthrough") ? (
                <div className="mt-[clamp(1.75rem,4vh,2.5rem)] border-l-2 border-[#b3122a] bg-[#fdf6f8]/70 p-[clamp(1rem,2.5vw,1.75rem)]">
                  <h4 className="m-0 text-[clamp(1.05rem,1.9vw,1.35rem)] font-extrabold tracking-[-0.015em] text-[#160a0d]">
                    Breakthrough Sessions
                  </h4>
                  <p className="m-0 mt-1.5 text-[0.95rem] leading-[1.6] text-[#72091a]">{breakthroughNote}</p>
                  <ul className="m-0 mt-3 list-none p-0">
                    {g.rows
                      .filter((r) => r.stream === "Breakthrough")
                      .map((r) => (
                        <Item key={r.key} row={r} query={query} bare />
                      ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </section>
  );
}
