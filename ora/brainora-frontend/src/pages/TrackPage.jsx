
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
  Legend,
  LineChart,
  Line,
} from "recharts";

import "../styles/TrackPage.css";

// Sample preview data. Not connected to the backend yet.
const overview = [
  {
    title: "Credit Balance",
    value: "240",
    subtitle: "Available credits",
    icon: "🪙",
    color: "gold",
    trend: "Your current balance",
  },
  {
    title: "Contributions",
    value: "12",
    subtitle: "Resources shared",
    icon: "☁️",
    color: "blue",
    trend: "Across all subjects",
  },
  {
    title: "Downloads",
    value: "08",
    subtitle: "Resources accessed",
    icon: "⬇️",
    color: "green",
    trend: "Learning activity",
  },
  {
    title: "Achievements",
    value: "02",
    subtitle: "Milestones reached",
    icon: "🏆",
    color: "purple",
    trend: "Keep progressing",
  },
];

const contributionData = [
  { name: "Notes", value: 6, color: "#5577e8" },
  { name: "Question Papers", value: 4, color: "#23a681" },
  { name: "Videos", value: 2, color: "#f2ae4b" },
];

const creditData = [
  { month: "Aug", earned: 20, spent: 5 },
  { month: "Sep", earned: 35, spent: 10 },
  { month: "Oct", earned: 25, spent: 15 },
  { month: "Nov", earned: 50, spent: 20 },
];

const activityData = [
  { week: "Week 1", activity: 3 },
  { week: "Week 2", activity: 7 },
  { week: "Week 3", activity: 5 },
  { week: "Week 4", activity: 10 },
];

const activities = [
  {
    title: "Data Structures Notes uploaded",
    description: "Contribution reward",
    date: "Today",
    credits: "+20",
    type: "earned",
    icon: "☁️",
  },
  {
    title: "Digital Logic Question Paper approved",
    description: "Your resource is now available",
    date: "Yesterday",
    credits: null,
    type: "approved",
    icon: "✓",
  },
  {
    title: "COA Notes downloaded",
    description: "Resource access",
    date: "18 Nov",
    credits: "-5",
    type: "spent",
    icon: "⬇️",
  },
  {
    title: "OOP Notes uploaded",
    description: "Contribution reward",
    date: "16 Nov",
    credits: "+15",
    type: "earned",
    icon: "☁️",
  },
];

function StatCard({ item }) {
  return (
    <article className={`track-stat-card ${item.color}`}>
      <div className="track-stat-top">
        <div className="track-stat-icon">
          {item.icon}
        </div>
        <span className="track-stat-trend">
          {item.trend}
        </span>
      </div>

      <h2>{item.value}</h2>
      <h4>{item.title}</h4>
      <p>{item.subtitle}</p>
    </article>
  );
}

function TrackPage() {
  const totalContributions = contributionData.reduce(
    (total, item) => total + item.value,
    0
  );

  const progress = 60;

  return (
    <main className="track-page">
      <div className="track-container">

        {/* Header */}
        <header className="track-header">
          <div>
            <div className="track-eyebrow">
              <span>✨</span>
              YOUR BRAINORA JOURNEY
            </div>

            <h1>Track Your Progress</h1>

            <p>
              Every resource shared and every credit earned moves
              your learning journey forward.
            </p>
          </div>

          <div className="track-date">
            <span>↗</span>
            My Activity
          </div>
        </header>

        {/* Preview Notice */}
        <div className="track-preview-note">
          <span>◷</span>
          Preview mode: sample statistics are shown until live data is connected.
        </div>

        {/* Overview Cards */}
        <section className="track-stats-grid">
          {overview.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </section>

        {/* Charts */}
        <section className="track-charts-grid">

          {/* Contribution Doughnut Chart */}
          <article className="track-panel">
            <div className="track-panel-heading">
              <div>
                <span className="track-section-label">
                  YOUR SHARING ACTIVITY
                </span>
                <h3>Contribution Breakdown</h3>
                <p>
                  See what you have shared with your community.
                </p>
              </div>

              <div className="track-heading-icon blue-icon">
                📚
              </div>
            </div>

            <div className="donut-layout">
              <div className="donut-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {contributionData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{totalContributions}</strong>
                  <span>Total uploads</span>
                </div>
              </div>

              <div className="donut-legend">
                {contributionData.map((item) => (
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
          </article>

          {/* Credit Bar Chart */}
          <article className="track-panel">
            <div className="track-panel-heading">
              <div>
                <span className="track-section-label">
                  CREDIT ANALYTICS
                </span>
                <h3>Credit Flow</h3>
                <p>Compare credits earned and spent.</p>
              </div>

              <div className="track-heading-icon gold-icon">
                🪙
              </div>
            </div>

            <div className="track-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={creditData}
                  margin={{
                    top: 12,
                    right: 8,
                    left: -18,
                    bottom: 0,
                  }}
                  barGap={7}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e9edf4"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8992a5", fontSize: 12 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8992a5", fontSize: 11 }}
                  />

                  <Tooltip />
                  <Legend iconType="circle" />

                  <Bar
                    dataKey="earned"
                    name="Earned"
                    fill="#5577e8"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="#f2ae4b"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* Weekly Activity Chart */}
          <article className="track-panel">
            <div className="track-panel-heading">
              <div>
                <span className="track-section-label">
                  LEARNING CONSISTENCY
                </span>
                <h3>Weekly Activity</h3>
                <p>Resources accessed over the weeks.</p>
              </div>

              <div className="track-heading-icon green-icon">
                ↗
              </div>
            </div>

            <div className="track-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{
                    top: 15,
                    right: 12,
                    left: -18,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e9edf4"
                  />

                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8992a5", fontSize: 11 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8992a5", fontSize: 11 }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="activity"
                    name="Resources accessed"
                    stroke="#23a681"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#23a681" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* Milestone */}
          <article className="track-panel milestone-panel">
            <div className="track-panel-heading">
              <div>
                <span className="track-section-label">
                  KEEP GOING
                </span>
                <h3>Your Next Milestone</h3>
                <p>
                  Small contributions create big progress.
                </p>
              </div>

              <div className="track-heading-icon purple-icon">
                🎯
              </div>
            </div>

            <div className="milestone-content">
              <div className="milestone-badge">
                🏆
              </div>

              <div className="milestone-info">
                <span>LEVEL 2</span>
                <h2>Knowledge Contributor</h2>
                <p>
                  You're building a helpful learning community.
                </p>
              </div>
            </div>

            <div className="milestone-progress-heading">
              <span>Contribution progress</span>
              <strong>12 / 20</strong>
            </div>

            <div
              className="milestone-progress-track"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Contribution progress"
            >
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="milestone-bottom">
              <span>{progress}% completed</span>
              <strong>8 more to go!</strong>
            </div>
          </article>
        </section>

        {/* Recent Activity */}
        <section className="track-panel timeline-panel">
          <div className="track-panel-heading">
            <div>
              <span className="track-section-label">
                YOUR RECENT JOURNEY
              </span>
              <h3>Recent Activity</h3>
              <p>
                A record of your contributions and resource usage.
              </p>
            </div>

            <div className="track-heading-icon blue-icon">
              ↗
            </div>
          </div>

          <div className="track-timeline">
            {activities.map((activity, index) => (
              <div
                className="timeline-item"
                key={`${activity.title}-${index}`}
              >
                <div className={`timeline-icon ${activity.type}`}>
                  {activity.icon}
                </div>

                <div className="timeline-details">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                </div>

                <span className="timeline-date">
                  {activity.date}
                </span>

                {activity.credits && (
                  <strong
                    className={`timeline-credits ${activity.type}`}
                  >
                    {activity.credits}
                  </strong>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="track-footer-message">
          <div className="footer-message-icon">
            ✨
          </div>

          <div>
            <h3>Keep sharing. Keep learning.</h3>
            <p>
              Every useful resource you contribute makes learning
              easier for someone else.
            </p>
          </div>

          <span className="footer-arrow">↗</span>
        </footer>

      </div>
    </main>
  );
}

export default TrackPage;
