import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useEntries } from "../hooks/useEntries";
import { useAuth } from "../context/AuthContext";
import { useSummary } from "../hooks/useSummary";

const MOOD_SCORE: Record<string, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  bad: 2,
  terrible: 1,
};

const MOOD_COLORS: Record<string, string> = {
  great: "#22c55e",
  good: "#84cc16",
  neutral: "#eab308",
  bad: "#f97316",
  terrible: "#ef4444",
};

const TAG_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#eab308",
  "#14b8a6",
  "#f43f5e",
];

const getWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekStart: monday.toISOString().split("T")[0],
    weekEnd: sunday.toISOString().split("T")[0],
  };
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { entries, isLoading } = useEntries();
  const {
    summary,
    isLoading: summaryLoading,
    error: summaryError,
    generate,
    isGenerating,
  } = useSummary();
  const [summaryGenError, setSummaryGenError] = useState<string | null>(null);

  const weeklyHours = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map(date => {
      const dayEntries = entries.filter(
        e => new Date(e.date).toISOString().split("T")[0] === date,
      );
      const hours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
      return {
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        hours: Number(hours.toFixed(1)),
      };
    });
  }, [entries]);

  const tagFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags?.forEach((tag: any) => {
        freq[tag.name] = (freq[tag.name] ?? 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [entries]);

  const moodTrend = useMemo(() => {
    return entries
      .slice(0, 10)
      .reverse()
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: MOOD_SCORE[entry.mood] ?? 3,
        mood: entry.mood,
      }));
  }, [entries]);

  const stats = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const thisWeek = entries.filter(e => {
      const entryDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    });
    const weekHours = thisWeek.reduce((sum, e) => sum + e.hours, 0);
    const avgMood =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + (MOOD_SCORE[e.mood] ?? 3), 0) /
          entries.length
        : 0;

    return {
      totalHours: Number(totalHours.toFixed(1)),
      weekHours: Number(weekHours.toFixed(1)),
      totalEntries: entries.length,
      avgMood: Number(avgMood.toFixed(1)),
    };
  }, [entries]);

  const handleGenerate = async () => {
    try {
      setSummaryGenError(null);
      const { weekStart, weekEnd } = getWeekRange();
      await generate(weekStart, weekEnd);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response: { data: { message: string } } };
        setSummaryGenError(
          axiosErr.response?.data?.message ?? "Failed to generate summary",
        );
      } else {
        setSummaryGenError(
          "AI service is currently unavailable. Please try again later.",
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-100">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your development activity overview
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: `${stats.totalHours}h` },
          { label: "This Week", value: `${stats.weekHours}h` },
          { label: "Total Entries", value: stats.totalEntries },
          { label: "Avg Mood", value: `${stats.avgMood}/5` },
        ].map(stat => (
          <div key={stat.label} className="card">
            <p className="text-gray-400 text-xs uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-100 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No data yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Add entries to see your dashboard
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly Hours */}
            <div className="card">
              <h3 className="text-gray-100 mb-4">Hours This Week</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyHours}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tag Frequency */}
            <div className="card">
              <h3 className="text-gray-100 mb-4">Top Tags</h3>
              {tagFrequency.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-gray-500 text-sm">No tags yet</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={tagFrequency}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {tagFrequency.map((_, index) => (
                          <Cell
                            key={index}
                            fill={TAG_COLORS[index % TAG_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #1f2937",
                          borderRadius: "8px",
                          color: "#f3f4f6",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5">
                    {tagFrequency.slice(0, 6).map((tag, index) => (
                      <div key={tag.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              TAG_COLORS[index % TAG_COLORS.length],
                          }}
                        />
                        <span className="text-gray-400 text-xs truncate">
                          {tag.name}
                        </span>
                        <span className="text-gray-500 text-xs ml-auto pl-2">
                          {tag.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mood Trend */}
          <div className="card">
            <h3 className="text-gray-100 mb-4">Mood Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                  formatter={(_value: any, _: any, props: any) => [
                    props.payload.mood,
                    "Mood",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={(props: any) => (
                    <circle
                      key={props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={MOOD_COLORS[props.payload.mood] ?? "#0ea5e9"}
                      stroke="transparent"
                    />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Weekly Summary */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-100">AI Weekly Summary</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Powered by Gemini
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary text-sm"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : summary ? (
                  "Regenerate"
                ) : (
                  "Generate Summary"
                )}
              </button>
            </div>

            {/* Error */}
            {(summaryGenError || summaryError) && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">
                  {summaryGenError || summaryError}
                </p>
              </div>
            )}

            {/* Loading */}
            {summaryLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Generated text */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {summary.generatedText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Themes */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Themes
                    </p>
                    <ul className="space-y-1">
                      {summary.themes.map((theme: string) => (
                        <li
                          key={theme}
                          className="text-sm text-gray-300 flex items-start gap-1.5"
                        >
                          <span className="text-brand-500 mt-0.5">◆</span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Wins */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-mood-great uppercase tracking-wider">
                      Wins
                    </p>
                    <ul className="space-y-1">
                      {summary.wins.map((win: string) => (
                        <li
                          key={win}
                          className="text-sm text-gray-300 flex items-start gap-1.5"
                        >
                          <span className="text-mood-great mt-0.5">✓</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-mood-bad uppercase tracking-wider">
                      Risks
                    </p>
                    <ul className="space-y-1">
                      {summary.risks.map((risk: string) => (
                        <li
                          key={risk}
                          className="text-sm text-gray-300 flex items-start gap-1.5"
                        >
                          <span className="text-mood-bad mt-0.5">⚠</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Meta */}
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <p className="text-gray-600 text-xs">
                    {summary.totalHours}h logged across{" "}
                    {summary.topProjects.join(", ")}
                  </p>
                  <p className="text-gray-600 text-xs">
                    Generated {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">
                  No summary yet for this week.
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Click Generate Summary to get AI insights on your week.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
