import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getResources,
  getMyUploads,
  deleteResource,
} from "../services/api";
import useResourceFile from "../hooks/useResourceFile";
import ResourceRating from "../components/ResourceRating";
import TopRecommended from "../components/TopRecommended";
import "../styles/ResourcesPage.css";

function formatDate(date) {
  if (!date) return "Recently uploaded";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently uploaded";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileType(resource) {
  const filename = resource.originalFilename || "";
  const extension = filename.split(".").pop();

  return extension ? extension.toUpperCase() : "FILE";
}

// Turns a type like "Previous Year Questions" into "previous-year-questions"
// so it can be used as a CSS class for colouring the badge.
function typeClass(type) {
  return (type || "other")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

// One card on this page. Preview and Download use the fast direct link,
// and every card has the star rating.
function ResourceCard({ resource, canDelete, deleting, onDelete, disabled }) {
  const { busy, error, opened, preview, download } = useResourceFile(resource);

  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <div className="resource-file-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M6 3.75h8l4 4v12.5H6z" />
            <path d="M14 3.75v4h4M9 12h6m-6 3h6" />
          </svg>
        </div>

        <div className="resource-badges">
          <span className={`resource-kind kind-${typeClass(resource.type)}`}>
            {resource.type || "Other"}
          </span>

          <span className="resource-type">{getFileType(resource)}</span>
        </div>
      </div>

      <h3 className="resource-card-title">{resource.title}</h3>

      {resource.semester && (
        <p className="resource-card-subject">{resource.semester}</p>
      )}

      <p className="resource-card-uploader">
        Uploaded by {resource.uploaderName || "Student"}
      </p>

      {resource.department && (
        <p className="resource-card-department">{resource.department}</p>
      )}

      <ResourceRating resourceId={resource.id} nudge={opened} />

      <div className="resource-card-footer">
        <span />
        <time className="resource-date">{formatDate(resource.uploadedAt)}</time>
      </div>

      {error && <p className="resources-error" role="alert">{error}</p>}

      <div className="resource-card-actions">
        <button
          type="button"
          onClick={preview}
          disabled={busy !== "" || disabled}
        >
          {busy === "preview" ? "Opening..." : "Preview"}
        </button>

        <button
          type="button"
          onClick={download}
          disabled={busy !== "" || disabled}
        >
          {busy === "download" ? "Preparing..." : "Download"}
        </button>

        {canDelete && (
          <button
            type="button"
            className="resource-delete-button"
            onClick={() => onDelete(resource)}
            disabled={busy !== "" || disabled}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [activeTab, setActiveTab] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeAction, setActiveAction] = useState(null);

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        activeTab === "mine"
          ? await getMyUploads()
          : await getResources();

      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to load resources. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const departments = useMemo(
    () => [
      "All",
      ...new Set(
        resources
          .map((resource) => resource.department)
          .filter(Boolean)
      ),
    ],
    [resources]
  );

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchableText = [
        resource.title,
        resource.subject,
        resource.type,
        resource.description,
        resource.originalFilename,
        resource.department,
        resource.semester,
        resource.uploaderName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(normalizedSearch);

      const matchesDepartment =
        selectedDepartment === "All" ||
        resource.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [resources, searchTerm, selectedDepartment]);

  // Group the filtered resources by subject (A-Z). Resources with no
  // subject go into "Other" at the end.
  const groupedResources = useMemo(() => {
    const groups = {};

    filteredResources.forEach((resource) => {
      const subject = resource.subject?.trim() || "Other";

      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(resource);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
  }, [filteredResources]);

  async function handleDelete(resource) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.title}"?`
    );

    if (!confirmed) return;

    try {
      setActiveAction(`${resource.id}-delete`);
      setActionError("");

      await deleteResource(resource.id);

      setResources((current) =>
        current.filter((item) => item.id !== resource.id)
      );
    } catch (err) {
      setActionError(err.message || "Unable to delete this resource.");
    } finally {
      setActiveAction(null);
    }
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setSelectedDepartment("All");
    setSearchTerm("");
    setFiltersOpen(false);
    setActionError("");
  }

  return (
    <main className="resources-page">
      <h1 className="resources-title">Resources</h1>

      {activeTab === "all" && !searchTerm.trim() && selectedDepartment === "All" && (
        <section className="top-recommended" aria-labelledby="top-recommended-title">
          <h2 className="subject-title" id="top-recommended-title">
            Top Recommended
          </h2>
          <TopRecommended limit={6} />
        </section>
      )}

      <div className="resources-tabs">
        <button
          type="button"
          className={activeTab === "all" ? "active" : ""}
          onClick={() => changeTab("all")}
        >
          All Resources
        </button>

        <button
          type="button"
          className={activeTab === "mine" ? "active" : ""}
          onClick={() => changeTab("mine")}
        >
          My Uploads
        </button>
      </div>

      <div className="resources-toolbar">
        <label className="resources-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search resources"
          />
        </label>

        <div className="resources-filter-wrap">
          <button
            type="button"
            className={`resources-filter-button${filtersOpen ? " is-open" : ""}`}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="resources-filter-menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M7 12h10m-7 5h4" />
              <circle cx="8" cy="7" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="12" cy="17" r="1.5" />
            </svg>

            <span>Filters</span>

            {selectedDepartment !== "All" && (
              <span className="resources-filter-count">1</span>
            )}

            <svg
              className="resources-chevron"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </button>

          {filtersOpen && (
            <div
              className="resources-filter-menu"
              id="resources-filter-menu"
            >
              <p className="resources-filter-heading">
                Department
              </p>

              {departments.map((department) => (
                <button
                  type="button"
                  key={department}
                  className={`resources-filter-option${
                    selectedDepartment === department ? " selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedDepartment(department);
                    setFiltersOpen(false);
                  }}
                >
                  <span>
                    {department === "All"
                      ? "All departments"
                      : department}
                  </span>

                  {selectedDepartment === department && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <p className="resources-error" role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="resources-empty">
          <p>Loading resources...</p>
        </div>
      ) : error ? (
        <div className="resources-empty">
          <p>{error}</p>

          <button type="button" onClick={loadResources}>
            Try Again
          </button>
        </div>
      ) : groupedResources.length ? (
        <div className="resources-groups">
          {groupedResources.map(([subject, items]) => (
            <section
              className="subject-section"
              key={subject}
              aria-labelledby={`subject-${subject}`}
            >
              <h2 className="subject-title" id={`subject-${subject}`}>
                {subject}
                <span className="subject-count">{items.length}</span>
              </h2>

              <div
                className="resources-grid"
                aria-label={`${subject} resources`}
              >
                {items.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    canDelete={activeTab === "mine"}
                    deleting={activeAction === `${resource.id}-delete`}
                    onDelete={handleDelete}
                    disabled={activeAction !== null}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="resources-empty">
          <p>
            {activeTab === "mine"
              ? "You haven't uploaded any resources yet."
              : "No resources found."}
          </p>

          <span>
            {activeTab === "mine"
              ? "Your uploaded study materials will appear here."
              : "Try another search or department."}
          </span>
        </div>
      )}
    </main>
  );
}