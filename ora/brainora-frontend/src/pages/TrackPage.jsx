import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useResources } from "../context/ResourceContext";
import { formatCredits } from "../utils/credits";
import "../styles/LearnPage.css";
import "../styles/TrackPage.css";

const TYPE_STYLES = {
  notes: { label: "Notes", color: "#4f7cf0" },
  qp: { label: "Question Papers", color: "#e05b5b" },
  assignment: { label: "Assignments", color: "#e4a62b" },
  video: { label: "Videos", color: "#23a681" },
  other: { label: "Other", color: "#9aa3af" },
};

function typeKey(type) {
  return (type || "other")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

const WEEKS = 6;

export default function TrackPage() {
  const { myUploads = [], totalCredits = 0, loading, error } = useResources();

  // Files this student uploaded first (duplicates are not counted as uploads).
  const originals = useMemo(
    () => myUploads.filter((item) => item.contributionType !== "DUPLICATE_SOURCE"),
    [myUploads]
  );

  const subjectsCovered = useMemo(
    () =>
      new Set(
        myUploads
          .map((item) => (item.subject || "").trim().toLowerCase())
          .filter(Boolean)
      ).size,
    [myUploads]
  );

  // Contribution breakdown by resource type
  const breakdown = useMemo(() => {
    const counts = new Map();

    myUploads.forEach((item) => {
      const key = typeKey(item.type);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return [...counts.entries()].map(([key, value]) => ({
      name: TYPE_STYLES[key]?.label || key,
      value,
      color: TYPE_STYLES[key]?.color || TYPE_STYLES.other.color,
    }));
  }, [myUploads]);

  // Uploads per week for the last few weeks
  const weekly = useMemo(() => {
    const thisWeek = startOfWeek(new Date());

    const buckets = Array.from({ length: WEEKS }, (_, index) => {
      const start = new Date(thisWeek);
      start.setDate(start.getDate() - (WEEKS - 1 - index) * 7);

      return {
        start,
        label: start.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        uploads: 0,
      };
    });

    originals.forEach((item) => {
      const uploaded = new Date(item.uploadedAt);

      if (Number.isNaN(uploaded.getTime())) return;

      const weekStart = startOfWeek(uploaded).getTime();
      const bucket = buckets.find((entry) => entry.start.getTime() === weekStart);

      if (bucket) bucket.uploads += 1;
    });

    return buckets;
  }, [originals]);

  const stats = [
    {
      title: "My credits",
      value: formatCredits(totalCredits),
      subtitle: "Credits earned",
    },
    {
      title: "Resources Shared",
      value: String(myUploads.length),
      subtitle: `${originals.length} uploaded · ${myUploads.length - originals.length} duplicate`,
    },
    {
      title: "Subjects Covered",
      value: String(subjectsCovered),
      subtitle: "Across your contributions",
    },
  ];

  return (
    <main className="learn-page track-page">
      <section className="learn-heading">
        <div>
          <h1>Track</h1>
          <p>Your credits and contributions.</p>
        </div>
      </section>

      {error && (
        <div className="learn-status" role="alert">
          <span>{String(error)}</span>
        </div>
      )}

      {loading && !error && (
        <p className="learn-status-text">Loading your activity...</p>
      )}

      <section className="track-stats">
        {stats.map((item) => (
          <article className="track-stat-card" key={item.title}>
            <span className="track-stat-label">{item.title}</span>
            <strong className="track-stat-value">{item.value}</strong>
            <span className="track-stat-sub">{item.subtitle}</span>
          </article>
        ))}
      </section>

      <section className="track-grid">
        <article className="track-panel">
          <div className="track-panel-heading">
            <h3>Contribution Breakdown</h3>
            <p>What you have shared, by type.</p>
          </div>

          {breakdown.length ? (
            <div className="donut-layout">
              <div className="donut-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {breakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{myUploads.length}</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="donut-legend">
                {breakdown.map((item) => (
                  <div className="legend-item" key={item.name}>
                    <span
                      className="legend-dot"
                      style={{ background: item.color }}
                    />
                    <div>
                      <span>{item.name}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="track-empty">
              <span>No contributions yet</span>
              <p>Upload a resource and it will show up here.</p>
            </div>
          )}
        </article>

        <article className="track-panel">
          <div className="track-panel-heading">
            <h3>Weekly Uploads</h3>
            <p>Files you uploaded in the last {WEEKS} weeks.</p>
          </div>

          {originals.length ? (
            <div className="track-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekly}
                  margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5ecea"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78818c", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78818c", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="uploads"
                    name="Uploads"
                    fill="#478b75"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="track-empty">
              <span>No uploads yet</span>
              <p>Your weekly uploads will be charted here.</p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}