import type { Day } from "@/lib/activity";

/** Level 0–4 → paper-to-rust scale, tuned for the warm editorial palette */
const LEVEL_COLORS = [
  "rgba(30, 26, 22, 0.06)",
  "#ecc7b3",
  "#dd9670",
  "#cb6a3e",
  "#8f3a1e",
];

/**
 * GitHub-style contribution heatmap rendered as an inline SVG in the
 * site's own palette. Weeks as columns, days as rows.
 */
export function Heatmap({ days, label }: { days: Day[]; label: string }) {
  // Align the first column to a week boundary (Sunday start)
  const firstDow = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  const cell = 10;
  const gap = 3;
  const weeks = Math.ceil((days.length + firstDow) / 7);
  const width = weeks * (cell + gap) - gap;
  const height = 7 * (cell + gap) - gap;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="w-full h-auto"
      >
        {days.map((d, i) => {
          const pos = i + firstDow;
          const x = Math.floor(pos / 7) * (cell + gap);
          const y = (pos % 7) * (cell + gap);
          return (
            <rect
              key={d.date}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx={2}
              fill={LEVEL_COLORS[d.level] ?? LEVEL_COLORS[0]}
            >
              <title>{`${d.date}: ${d.count}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-3 font-mono text-micro text-ink-soft">
        {label}
      </figcaption>
    </figure>
  );
}
