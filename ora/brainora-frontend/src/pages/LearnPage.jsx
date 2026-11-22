import { Component, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAllResources from "../hooks/useAllResources";
import ResourceItem from "../components/ResourceItem";
import NoResultsRequest from "../components/NoResultsRequest";
import {
  BEYOND_CATEGORIES,
  DEPARTMENTS,
  SEMESTERS,
  departmentLabel,
  getCatalogueSubjects,
} from "../data/academicData";
import {
  isCommon,
  keyOf,
  matchDepartment,
  matchSemester,
  matchSubject,
} from "../utils/resourceMatching";
import "../styles/LearnPage.css";

// Subjects are visible as soon as the page opens: a department and a
// semester are pre-selected (Computer Science if it exists, else the first).
const INITIAL_DEPARTMENT = (() => {
  const list = Array.isArray(DEPARTMENTS) ? DEPARTMENTS : [];
  const cse = list.find((item) =>
    /computer\s*science|^cse$/i.test(`${item.label} ${item.value}`)
  );

  return (cse || list[0])?.value || "";
})();

const INITIAL_SEMESTER = (Array.isArray(SEMESTERS) && SEMESTERS[0]) || "";

function countLabel(count) {
  return `${count} ${count === 1 ? "resource" : "resources"}`;
}

function LearnPageContent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { resources, loading, error, reload } = useAllResources();

  const [search, setSearch] = useState("");

  // Coming back from a subject page keeps the department and semester.
  const [department, setDepartment] = useState(
    params.get("department") ?? INITIAL_DEPARTMENT
  );
  const [semester, setSemester] = useState(
    params.get("semester") ?? INITIAL_SEMESTER
  );

  /* ----- top search: every resource, any department ----- */

  const searchTerm = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];

    return resources.filter((resource) => {
      const text = [
        resource.title,
        resource.subject,
        resource.type,
        resource.description,
        resource.originalFilename,
        resource.department,
        departmentLabel(resource.department),
        resource.semester,
        resource.uploaderName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTerm.split(/\s+/).every((word) => text.includes(word));
    });
  }, [resources, searchTerm]);

  /* ----- explorer: department + semester -> subjects ----- */

  const semesterResources = useMemo(() => {
    if (!department || !semester) return [];

    return resources.filter(
      (resource) =>
        !isCommon(resource) &&
        matchDepartment(resource.department, department) &&
        matchSemester(resource.semester, semester)
    );
  }, [resources, department, semester]);

  // Verified subjects first, then any extra subject students uploaded for.
  const subjects = useMemo(() => {
    if (!department || !semester) return [];

    let catalogue = [];

    try {
      const found = getCatalogueSubjects(department, semester);
      catalogue = Array.isArray(found) ? found : [];
    } catch {
      catalogue = [];
    }

    const list = [...catalogue];
    const seen = new Set(list.map((subject) => keyOf(subject)));

    semesterResources.forEach((resource) => {
      const name = (resource.subject || "").trim();
      const key = keyOf(name);

      if (name && !seen.has(key)) {
        seen.add(key);
        list.push(name);
      }
    });

    return list;
  }, [department, semester, semesterResources]);

  const subjectCounts = useMemo(() => {
    const counts = {};

    subjects.forEach((subject) => {
      counts[subject] = semesterResources.filter((resource) =>
        matchSubject(resource.subject, subject)
      ).length;
    });

    return counts;
  }, [subjects, semesterResources]);

  /* ----- beyond the syllabus ----- */

  const beyondCounts = useMemo(() => {
    const common = resources.filter((resource) => isCommon(resource));
    const counts = {};

    BEYOND_CATEGORIES.forEach((item) => {
      counts[item.title] = common.filter((resource) =>
        matchSubject(resource.subject, item.title)
      ).length;
    });

    return counts;
  }, [resources]);

  /* ----- opening the separate pages ----- */

  function openSubject(subject) {
    navigate(
      `/learn/subject?${new URLSearchParams({ department, semester, subject })}`
    );
  }

  function openBeyond(category) {
    navigate(`/learn/beyond?${new URLSearchParams({ category })}`);
  }

  return (
    <main className="learn-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">YOUR ACADEMIC LIBRARY</span>
          <h1>Learn</h1>
          <p>Everything you need for your subjects, all in one place.</p>
        </div>
      </section>

      <section className="learn-search-section">
        <label className="learn-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            placeholder="Search all resources by title, subject, type or topic..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search all resources"
          />
        </label>
      </section>

      {error && (
        <div className="learn-status" role="alert">
          <span>{error}</span>
          <button type="button" onClick={reload}>
            Try Again
          </button>
        </div>
      )}

      {loading && !error && (
        <p className="learn-status-text">Loading resources...</p>
      )}

      {searchTerm ? (
        /* ===== search mode: replaces the explorer while typing ===== */
        <section className="learn-results">
          <div className="learn-results-heading">
            <div>
              <span className="learn-eyebrow">SEARCH RESULTS</span>
              <h2>Results for “{search.trim()}”</h2>
            </div>

            <button
              type="button"
              className="learn-clear-search"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </div>

          {searchResults.length ? (
            <div className="learn-resource-grid">
              {searchResults.map((resource) => (
                <ResourceItem resource={resource} key={resource.id} />
              ))}
            </div>
          ) : (
            /* Nothing found: ask everyone for it (popup + notification) */
            !loading && !error && <NoResultsRequest query={search} />
          )}
        </section>
      ) : (
        <>
          {/* ===== academic explorer ===== */}
          <section className="learn-explorer">
            <div className="learn-section-heading">
              <div>
                <span className="learn-eyebrow">ACADEMIC EXPLORER</span>
                <h2>Explore your curriculum</h2>
                <p>
                  Choose your department and semester, then open a subject to
                  see all its resources.
                </p>
              </div>
            </div>

            <div className="learn-select-row">
              <label className="learn-select-field">
                <span>Department</span>
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="learn-select-field">
                <span>Semester</span>
                <select
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                >
                  <option value="">Select semester</option>
                  {SEMESTERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {!department || !semester ? (
              <div className="learn-empty">
                <span>Nothing selected yet</span>
                <p>Pick a department and a semester to see its subjects.</p>
              </div>
            ) : (
              <>
                <div className="learn-subject-heading">
                  <h3>
                    {departmentLabel(department)} · {semester}
                  </h3>
                  <span>{subjects.length} subjects</span>
                </div>

                {subjects.length ? (
                  <div className="learn-subject-grid">
                    {subjects.map((subject, index) => (
                      <button
                        className="learn-subject-card"
                        type="button"
                        key={subject}
                        onClick={() => openSubject(subject)}
                      >
                        <span className="learn-subject-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="learn-subject-name">
                          {subject}
                          <small className="learn-subject-meta">
                            {countLabel(subjectCounts[subject] || 0)}
                          </small>
                        </span>

                        <span className="learn-subject-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="learn-empty">
                    <span>Subject catalogue coming soon</span>
                    <p>
                      The verified subject list for this department is not
                      added yet. Subjects will appear here as students upload
                      resources for them.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ===== beyond the syllabus ===== */}
          <section className="beyond-section">
            <div className="beyond-heading">
              <div>
                <span className="learn-eyebrow">
                  LEARNING DOESN'T STOP HERE
                </span>
                <h2>Beyond the Syllabus</h2>
                <p>
                  Explore useful skills and resources beyond your semester
                  subjects.
                </p>
              </div>
              <span className="beyond-tag">COMMON FOR EVERYONE</span>
            </div>

            <div className="beyond-grid">
              {BEYOND_CATEGORIES.map((item) => (
                <button
                  type="button"
                  className="beyond-card"
                  key={item.title}
                  onClick={() => openBeyond(item.title)}
                >
                  <span className="beyond-icon">{item.icon}</span>
                  <span className="beyond-type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span className="beyond-description">
                    {item.description}
                  </span>
                  <span className="beyond-arrow">
                    {countLabel(beyondCounts[item.title] || 0)} ↗
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

/* ---------- shows an error on screen instead of a blank page ---------- */

class LearnErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Learn page crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="learn-page">
          <div className="learn-status" role="alert">
            <span>
              The Learn page hit an error: {String(this.state.error.message)}
            </span>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function LearnPage() {
  return (
    <LearnErrorBoundary>
      <LearnPageContent />
    </LearnErrorBoundary>
  );
}
