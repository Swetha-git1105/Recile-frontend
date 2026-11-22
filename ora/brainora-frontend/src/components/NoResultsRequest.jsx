import { useState } from "react";
import RequestResourceModal from "./RequestResourceModal";
import "../styles/RequestResource.css";

// Shown wherever a resource search / list comes back empty. It has a
// "Request this resource" button that opens the popup and notifies everyone.
//
//   <NoResultsRequest query={search} />
//
// Optional props:
//   title, message          replace the default texts
//   department, semester, subject   sent along with the request
export default function NoResultsRequest({
  query = "",
  title = "",
  message = "",
  department = "",
  semester = "",
  subject = "",
}) {
  const [open, setOpen] = useState(false);
  const term = query.trim();

  const heading =
    title ||
    (term ? `No resources found for “${term}”` : "No resources found");

  return (
    <div className="no-results" role="status">
      <span className="no-results-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>

      <strong>{heading}</strong>

      <p>
        {message ||
          "Can't find what you need? Request it and every student will be notified."}
      </p>

      <button
        type="button"
        className="rr-primary"
        onClick={() => setOpen(true)}
      >
        Request this resource
      </button>

      <RequestResourceModal
        open={open}
        onClose={() => setOpen(false)}
        initialTitle={term}
        department={department}
        semester={semester}
        subject={subject}
      />
    </div>
  );
}
