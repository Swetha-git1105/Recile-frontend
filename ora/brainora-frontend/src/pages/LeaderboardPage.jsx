import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import RankBadge from "../components/RankBadge";
import { formatCredits } from "../utils/credits";
import "../styles/LearnPage.css";
import "../styles/LeaderboardPage.css";

const BOARDS = [
  { key: "credits", label: "Most credits", unit: "credits" },
  { key: "resources", label: "Most resources", unit: "resources" },
];

function valueOf(entry, boardKey) {
  return boardKey === "credits"
    ? formatCredits(entry.credits)
    : String(entry.resources);
}

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [active, setActive] = useState("credits");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      setData(await getLeaderboard());
    } catch (err) {
      setError(err.message || "Unable to load the leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const board = data?.[active];
  const unit = BOARDS.find((item) => item.key === active)?.unit;
  const meOutside =
    board?.me && !board.entries.some((entry) => entry.me) ? board.me : null;

  return (
    <main className="learn-page leaderboard-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">TOP CONTRIBUTORS</span>
          <h1>Leaderboard</h1>
          <p>See who shares the most and who holds the most credits.</p>
        </div>
      </section>

      <section className="learn-explorer leaderboard-card">
        <div className="leaderboard-legend" aria-label="Medals">
          <span><RankBadge rank="1-3" medal="GOLD" /> Gold</span>
          <span><RankBadge rank="4-6" medal="SILVER" /> Silver</span>
          <span><RankBadge rank="7-11" medal="BRONZE" /> Bronze</span>
        </div>

        <div className="learn-chips" role="tablist" aria-label="Leaderboards">
          {BOARDS.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={active === item.key}
              key={item.key}
              className={`learn-chip${active === item.key ? " active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="learn-status" role="alert">
            <span>{error}</span>
            <button type="button" onClick={load}>
              Try Again
            </button>
          </div>
        )}

        {loading && !data && !error && (
          <p className="learn-status-text">Loading the leaderboard...</p>
        )}

        {board && (
          <>
            {board.entries.length ? (
              <ol className="leaderboard-list">
                {board.entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.name}-${entry.campus}`}
                    className={entry.me ? "me" : ""}
                  >
                    <RankBadge rank={entry.rank} medal={entry.medal} />

                    <div className="leaderboard-name">
                      <strong>
                        {entry.name}
                        {entry.me && <em> (you)</em>}
                      </strong>
                      {entry.campus && <small>{entry.campus}</small>}
                    </div>

                    <div className="leaderboard-value">
                      <strong>{valueOf(entry, active)}</strong>
                      <small>{unit}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="learn-empty">
                <span>Nobody is ranked yet</span>
                <p>Upload a resource to be the first on the board.</p>
              </div>
            )}

            {meOutside && (
              <p className="leaderboard-me">
                Your position: <strong>#{meOutside.rank}</strong> with{" "}
                <strong>{valueOf(meOutside, active)}</strong> {unit}.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
