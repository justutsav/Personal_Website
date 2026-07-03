export type Day = { date: string; count: number; level: number };

export type GithubActivity = {
  total: number;
  days: Day[];
};

export type MonkeytypeStats = {
  completedTests: number;
  hoursTyping: number;
  bestWpm15: number | null;
  bestWpm60: number | null;
  maxStreak: number;
  /** Daily test counts when the user's testActivity is public; else null */
  activity: Day[] | null;
};

const REVALIDATE = { next: { revalidate: 3600 } };

export async function getGithubActivity(): Promise<GithubActivity | null> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/justutsav?y=last",
      REVALIDATE
    );
    if (!res.ok) return null;
    const json = await res.json();
    return { total: json.total.lastYear, days: json.contributions };
  } catch {
    return null;
  }
}

type MtRecord = { wpm: number } | undefined;

export async function getMonkeytypeStats(): Promise<MonkeytypeStats | null> {
  try {
    const res = await fetch(
      "https://api.monkeytype.com/users/justutsav/profile",
      REVALIDATE
    );
    if (!res.ok) return null;
    const { data } = await res.json();

    const best = (mode: string): number | null => {
      const rec = (data.personalBests?.time?.[mode] as MtRecord[])?.reduce(
        (a, b) => ((a?.wpm ?? 0) >= (b?.wpm ?? 0) ? a : b),
        undefined
      );
      return rec ? Math.round(rec.wpm) : null;
    };

    // testActivity: { "2026": [count|null per day-of-year] } when public
    let activity: Day[] | null = null;
    if (data.testActivity && typeof data.testActivity === "object") {
      activity = [];
      for (const [year, counts] of Object.entries(
        data.testActivity as Record<string, (number | null)[]>
      )) {
        counts.forEach((count, i) => {
          const date = new Date(Date.UTC(Number(year), 0, i + 1));
          const c = count ?? 0;
          activity!.push({
            date: date.toISOString().slice(0, 10),
            count: c,
            level: c === 0 ? 0 : c < 5 ? 1 : c < 15 ? 2 : c < 30 ? 3 : 4,
          });
        });
      }
      // keep the trailing year, matching the GitHub graph's span
      activity = activity.slice(-365);
    }

    return {
      completedTests: data.typingStats?.completedTests ?? 0,
      hoursTyping: Math.round((data.typingStats?.timeTyping ?? 0) / 3600),
      bestWpm15: best("15"),
      bestWpm60: best("60"),
      maxStreak: data.maxStreak ?? 0,
      activity,
    };
  } catch {
    return null;
  }
}
