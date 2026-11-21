import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getResources, getResourceFileBlob } from "../services/api";
import {
  BEYOND_CATEGORIES,
  COMMON_DEPARTMENT,
  DEPARTMENTS,
  RESOURCE_TYPES,
  SEMESTERS,
  departmentLabel,
  getCatalogueSubjects,
} from "../data/academicData";
import "../styles/LearnPage.css";

/* ---------- small helpers ---------- */

function formatDate(date) {
  if (!date) return "Recently uploaded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Recently uploaded";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileType(resource) {
  const extension = (resource.originalFilename || "").split(".").pop();
  return extension ? extension.toUpperCase() : "FILE";
}

function typeClass(type) {
  return (type || "other")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

/* ---------- tolerant matching ----------
   The Upload page saves department, semester and subject as plain text.
   A strict "===" hides a resource when the text differs even slightly
   ("Semester 2" vs "2", "Data-Structures" vs "Data Structures", letter case,
   extra spaces). These helpers compare the meaning instead. They use only
   things that exist in academicData.js. */

function keyOf(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function numberOf(value) {
  const match = (value || "").toString().match(/\d+/);
  return match ? Number(match[0]) : null;
}

function matchDepartment(resourceDepartment, selected) {
  const a = keyOf(resourceDepartment);

  if (a === "") return false;

  return a === keyOf(selected) || a === keyOf(departmentLabel(selected));
}

function matchSemester(resourceSemester, selected) {
  const a = numberOf(resourceSemester);
  const b = numberOf(selected);

  if (a !== null && b !== null) return a === b;

  return keyOf(resourceSemester) !== "" && keyOf(resourceSemester) === keyOf(selected);
}

function matchSubject(resourceSubject, selected) {
  const a = keyOf(resourceSubject);

  return a !== "" && a === keyOf(selected);
}

function isCommon(resource) {
  return keyOf(resource.department) === keyOf(COMMON_DEPARTMENT);
}

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

/* ---------- one resource card (preview / download) ---------- */

function ResourceItem({ resource }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function preview() {
    // Open the tab first so the browser does not block the pop-up.
    const previewWindow = window.open("about:blank", "_blank");

    if (!previewWindow) {
      setError("Please allow pop-ups to preview resources.");
      return;
    }

    try {
      setBusy("preview");
      setError("");

      const blob = await getResourceFileBlob(resource.id, "preview");
      const url = URL.createObjectURL(blob);

      previewWindow.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      previewWindow.close();
      setError(err.message || "Unable to preview this resource.");
    } finally {
      setBusy("");
    }
  }

  async function download() {
    try {
      setBusy("download");
      setError("");

      const blob = await getResourceFileBlob(resource.id, "download");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = resource.originalFilename || `${resource.title}.file`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to download this resource.");
    } finally {
      setBusy("");
    }
  }

  return (
    <article className="learn-resource-card">
      <div className="learn-resource-top">
        <span className={`learn-kind kind-${typeClass(resource.type)}`}>
          {resource.type || "Other"}
        </span>
        <span className="learn-file-type">{getFileType(resource)}</span>
      </div>

      <h4 className="learn-resource-title">{resource.title}</h4>

      <p className="learn-resource-meta">
        {isCommon(resource)
          ? `Beyond the Syllabus · ${resource.subject || "General"}`
          : [resource.department, resource.semester, resource.subject]
              .filter(Boolean)
              .join(" · ")}
      </p>

      {resource.description && (
        <p className="learn-resource-description">{resource.description}</p>
      )}

      <p className="learn-resource-uploader">
        Uploaded by {resource.uploaderName || "Student"} ·{" "}
        {formatDate(resource.uploadedAt)}
      </p>

      {error && <p className="learn-resource-error">{error}</p>}

      <div className="learn-resource-actions">
        <button type="button" onClick={preview} disabled={busy !== ""}>
          {busy === "preview" ? "Opening..." : "Preview"}
        </button>

        <button type="button" onClick={download} disabled={busy !== ""}>
          {busy === "download" ? "Downloading..." : "Download"}
        </button>
      </div>
    </article>
  );
}

/* ---------- a titled list of resources with type chips ---------- */

function ResourcePanel({ title, subtitle, items, emptyMessage, panelRef }) {
  const [typeFilter, setTypeFilter] = useState("All");

  const types = useMemo(
    () =>
      (Array.isArray(RESOURCE_TYPES) ? RESOURCE_TYPES : []).filter((type) =>
        items.some((item) => keyOf(item.type) === keyOf(type))
      ),
    [items]
  );

  const visible =
    typeFilter === "All"
      ? items
      : items.filter((item) => keyOf(item.type) === keyOf(typeFilter));

  return (
    <div className="learn-panel" ref={panelRef}>
      <div className="learn-panel-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className="learn-panel-count">
          {visible.length} {visible.length === 1 ? "resource" : "resources"}
        </span>
      </div>

      {types.length > 1 && (
        <div className="learn-chips" role="group" aria-label="Filter by type">
          {["All", ...types].map((type) => (
            <button
              type="button"
              key={type}
              className={`learn-chip${typeFilter === type ? " active" : ""}`}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {visible.length ? (
        <div className="learn-resource-grid">
          {visible.map((resource) => (
            <ResourceItem resource={resource} key={resource.id} />
          ))}
        </div>
      ) : (
        <div className="learn-empty">
          <span>Nothing here yet</span>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- the page ---------- */

function LearnPageContent() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");

  // Pre-selected, so the subjects show as soon as the page opens.
  const [department, setDepartment] = useState(INITIAL_DEPARTMENT);
  const [semester, setSemester] = useState(INITIAL_SEMESTER);
  const [activeSubject, setActiveSubject] = useState("");

  const [activeBeyond, setActiveBeyond] = useState("");

  const subjectPanelRef = useRef(null);
  const beyondPanelRef = useRef(null);

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

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

  /* ----- explorer: department + semester -> subjects -> resources ----- */

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

  // Count per subject, using the same rule as the list that opens.
  const subjectCounts = useMemo(() => {
    const counts = {};

    subjects.forEach((subject) => {
      counts[subject] = semesterResources.filter((resource) =>
        matchSubject(resource.subject, subject)
      ).length;
    });

    return counts;
  }, [subjects, semesterResources]);

  // Only the resources of the selected subject.
  const subjectResources = useMemo(
    () =>
      activeSubject
        ? semesterResources.filter((resource) =>
            matchSubject(resource.subject, activeSubject)
          )
        : [],
    [semesterResources, activeSubject]
  );

  // If a subject opens empty but the semester has resources, say how they
  // are saved. This shows exactly what does not match.
  const subjectEmptyMessage = useMemo(() => {
    const saved = [
      ...new Set(
        semesterResources.map((resource) => resource.subject).filter(Boolean)
      ),
    ];

    if (saved.length) {
      return `No resource is saved under "${activeSubject}". Resources in this semester are saved under: ${saved.join(", ")}.`;
    }

    return "No one has shared a resource for this subject yet. Use the Upload page to add the first one.";
  }, [semesterResources, activeSubject]);

  /* ----- beyond the syllabus ----- */

  const commonResources = useMemo(
    () => resources.filter((resource) => isCommon(resource)),
    [resources]
  );

  const beyondCounts = useMemo(() => {
    const counts = {};

    (Array.isArray(BEYOND_CATEGORIES) ? BEYOND_CATEGORIES : []).forEach(
      (item) => {
        counts[item.title] = commonResources.filter((resource) =>
          matchSubject(resource.subject, item.title)
        ).length;
      }
    );

    return counts;
  }, [commonResources]);

  const beyondResources = useMemo(
    () =>
      activeBeyond
        ? commonResources.filter((resource) =>
            matchSubject(resource.subject, activeBeyond)
          )
        : [],
    [commonResources, activeBeyond]
  );

  /* ----- handlers ----- */

  function handleDepartmentChange(event) {
    setDepartment(event.target.value);
    setActiveSubject("");
  }

  function handleSemesterChange(event) {
    setSemester(event.target.value);
    setActiveSubject("");
  }

  function toggleSubject(subject) {
    setActiveSubject((current) => (current === subject ? "" : subject));
  }

  function toggleBeyond(title) {
    setActiveBeyond((current) => (current === title ? "" : title));
  }

  useEffect(() => {
    if (activeSubject) {
      subjectPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeSubject]);

  useEffect(() => {
    if (activeBeyond) {
      beyondPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeBeyond]);

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

      {loadError && (
        <div className="learn-status" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={loadResources}>
            Try Again
          </button>
        </div>
      )}

      {loading && !loadError && (
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
            <div className="learn-empty">
              <span>No resources found</span>
              <p>Try a different word, such as a subject name or “notes”.</p>
            </div>
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
                  Choose your department and semester to find your subjects.
                </p>
              </div>
            </div>

            <div className="learn-select-row">
              <label className="learn-select-field">
                <span>Department</span>
                <select value={department} onChange={handleDepartmentChange}>
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
                <select value={semester} onChange={handleSemesterChange}>
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
                <p>
                  Pick a department and a semester to see its subjects and the
                  resources shared for them.
                </p>
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
                        className={`learn-subject-card${
                          activeSubject === subject ? " active" : ""
                        }`}
                        type="button"
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        aria-pressed={activeSubject === subject}
                      >
                        <span className="learn-subject-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="learn-subject-name">
                          {subject}
                          <small className="learn-subject-meta">
                            {subjectCounts[subject] || 0}{" "}
                            {(subjectCounts[subject] || 0) === 1
                              ? "resource"
                              : "resources"}
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

                {activeSubject && (
                  <ResourcePanel
                    key={`${department}-${semester}-${activeSubject}`}
                    panelRef={subjectPanelRef}
                    title={activeSubject}
                    subtitle={`${departmentLabel(department)} · ${semester}`}
                    items={subjectResources}
                    emptyMessage={subjectEmptyMessage}
                  />
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
                  className={`beyond-card${
                    activeBeyond === item.title ? " active" : ""
                  }`}
                  key={item.title}
                  onClick={() => toggleBeyond(item.title)}
                  aria-pressed={activeBeyond === item.title}
                >
                  <span className="beyond-icon">{item.icon}</span>
                  <span className="beyond-type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span className="beyond-description">
                    {item.description}
                  </span>
                  <span className="beyond-arrow">
                    {beyondCounts[item.title] || 0}{" "}
                    {(beyondCounts[item.title] || 0) === 1
                      ? "resource"
                      : "resources"}{" "}
                    ↗
                  </span>
                </button>
              ))}
            </div>

            {activeBeyond && (
              <ResourcePanel
                key={activeBeyond}
                panelRef={beyondPanelRef}
                title={activeBeyond}
                subtitle="Beyond the Syllabus"
                items={beyondResources}
                emptyMessage="No one has shared a resource in this category yet. Use the Upload page and choose Beyond the Syllabus."
              />
            )}
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