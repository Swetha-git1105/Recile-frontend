import { useEffect, useState } from "react";
import { getCreditSummary, getCreditHistory } from "../services/api";
import { formatCredits } from "../utils/credits";
import "../styles/LearnPage.css";
import "../styles/CreditsPage.css";

function formatWhen(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreditsPage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [summaryData, historyData] = await Promise.all([
        getCreditSummary(),
        getCreditHistory(),
      ]);

      setSummary(summaryData);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(err.message || "Unable to load your credits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const perExtra = summary?.uploadsPerExtraFree || 3;
  const doneTowardNext = summary ? summary.successfulUploads % perExtra : 0;
  const progress = Math.round((doneTowardNext / perExtra) * 100);

  return (
    <main className="learn-page credits-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">YOUR CREDITS</span>
          <h1>Credit System</h1>
          <p>
            Earn credits by sharing resources. Spend them to open resources
            made by other students.
          </p>
        </div>
      </section>

      {error && (
        <div className="learn-status" role="alert">
          <span>{error}</span>
          <button type="button" onClick={load}>
            Try Again
          </button>
        </div>
      )}

      {loading && !summary && !error && (
        <p className="learn-status-text">Loading your credits...</p>
      )}

      {summary && (
        <>
          <section className="credits-stats" aria-label="Your credits">
            <div className="credits-stat is-primary">
              <span>Balance</span>
              <strong>{formatCredits(summary.balance)}</strong>
              <small>credits you can spend</small>
            </div>

            <div className="credits-stat">
              <span>Earned</span>
              <strong>{formatCredits(summary.earned)}</strong>
              <small>from your uploads</small>
            </div>

            <div className="credits-stat">
              <span>Spent</span>
              <strong>{formatCredits(summary.spent)}</strong>
              <small>on opening resources</small>
            </div>
          </section>

          <section className="learn-explorer credits-card">
            <div className="learn-section-heading">
              <div>
                <span className="learn-eyebrow">FREE ACCESSES</span>
                <h2>
                  {summary.freeLeft} of {summary.freeTotal} left
                </h2>
                <p>
                  You start with {summary.baseFreeAccesses} free resources. Every{" "}
                  {perExtra} successful uploads unlock 1 more.
                </p>
              </div>
            </div>

            <div className="credits-progress" aria-hidden="true">
              <div style={{ width: `${progress}%` }} />
            </div>

            <p className="credits-progress-text">
              {summary.successfulUploads} successful{" "}
              {summary.successfulUploads === 1 ? "upload" : "uploads"} so far.
              Upload {summary.uploadsToNextFree} more to unlock 1 more free
              access.
            </p>
          </section>

          <section className="learn-explorer credits-card">
            <div className="learn-section-heading">
              <div>
                <span className="learn-eyebrow">THE RULES</span>
                <h2>How credits work</h2>
              </div>
            </div>

            <div className="credits-rules">
              <div>
                <h3>Earning</h3>
                <ul>
                  <li>
                    <strong>5 credits</strong> when you upload a file nobody
                    has shared before.
                  </li>
                  <li>
                    <strong>2.5 credits</strong> when you upload a file that
                    already exists, for the first time it is repeated.
                  </li>
                  <li>
                    <strong>1 credit</strong> for every repeat after that.
                  </li>
                  <li>Uploading a file you already shared earns nothing.</li>
                </ul>
              </div>

              <div>
                <h3>Spending</h3>
                <ul>
                  <li>
                    The first <strong>{summary.baseFreeAccesses} resources</strong>{" "}
                    you open are free.
                  </li>
                  <li>
                    After <strong>{perExtra} successful uploads</strong> you get
                    1 more free resource, and again for every {perExtra} more.
                  </li>
                  <li>
                    After that, each new resource costs{" "}
                    <strong>{formatCredits(summary.accessCost)} credits</strong>.
                  </li>
                  <li>
                    Opening a resource again, or one you uploaded, is always
                    free.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="learn-explorer credits-card">
            <div className="learn-section-heading">
              <div>
                <span className="learn-eyebrow">ACTIVITY</span>
                <h2>History</h2>
              </div>
            </div>

            {history.length ? (
              <ul className="credits-history">
                {history.map((item, index) => (
                  <li key={`${item.kind}-${item.resourceId}-${index}`}>
                    <span className={`credits-kind ${item.kind.toLowerCase()}`}>
                      {item.kind === "EARNED"
                        ? "Earned"
                        : item.kind === "SPENT"
                          ? "Spent"
                          : "Free"}
                    </span>

                    <div className="credits-history-text">
                      <strong>{item.title}</strong>
                      <small>
                        {item.label} · {formatWhen(item.at)}
                      </small>
                    </div>

                    <span className={`credits-amount ${item.kind.toLowerCase()}`}>
                      {Number(item.amount) > 0 ? "+" : ""}
                      {formatCredits(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="learn-empty">
                <span>No activity yet</span>
                <p>Upload a resource to earn your first credits.</p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
