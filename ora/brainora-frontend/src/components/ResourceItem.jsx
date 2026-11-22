import { Link } from "react-router-dom";
import useResourceFile from "../hooks/useResourceFile";
import { useResources } from "../context/ResourceContext";
import ResourceRating from "./ResourceRating";
import UnavailableNotice from "./UnavailableNotice";
import { formatCredits } from "../utils/credits";
import "../styles/ResourceAccess.css";
import {
  formatDate,
  getFileType,
  isCommon,
  typeClass,
} from "../utils/resourceMatching";

// One resource card: details, star rating, Preview and Download.
// Preview and Download use a direct streaming link, so a PDF shows and a
// video plays right away instead of waiting for the whole file.
export default function ResourceItem({ resource }) {
  const { busy, error, opened, unavailable, needsCredits, preview, download } =
    useResourceFile(resource);
  const { creditSummary, myUploads } = useResources();

  // The file is missing (the list says so, or opening it just failed)
  const isUnavailable = resource.available === false || unavailable;

  // What opening this resource costs this student
  const isMine = myUploads.some((item) => item.id === resource.id);
  const alreadyOpened = Boolean(
    creditSummary?.openedResourceIds?.includes(resource.id)
  );

  let accessLabel = "";
  let paid = false;

  if (isMine) {
    accessLabel = "Your upload: free for you";
  } else if (alreadyOpened) {
    accessLabel = "Already opened: free to open again";
  } else if (creditSummary) {
    if (creditSummary.freeLeft > 0) {
      accessLabel = `Free access (${creditSummary.freeLeft} left)`;
    } else {
      accessLabel = `Opening costs ${formatCredits(creditSummary.accessCost)} credits`;
      paid = true;
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

      {isUnavailable ? (
        <UnavailableNotice resource={resource} />
      ) : (
        <>
          <ResourceRating resourceId={resource.id} nudge={opened} />

          {accessLabel && (
            <p className={`learn-resource-access${paid ? " paid" : ""}`}>
              {accessLabel}
            </p>
          )}

          {error && <p className="learn-resource-error">{error}</p>}

          {needsCredits && (
            <Link className="learn-resource-credit-link" to="/credits">
              See how to earn credits
            </Link>
          )}

          <div className="learn-resource-actions">
            <button type="button" onClick={preview} disabled={busy !== ""}>
              {busy === "preview" ? "Opening..." : "Preview"}
            </button>

            <button type="button" onClick={download} disabled={busy !== ""}>
              {busy === "download" ? "Preparing..." : "Download"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}