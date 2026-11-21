import useResourceFile from "../hooks/useResourceFile";
import ResourceRating from "./ResourceRating";
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
  const { busy, error, opened, preview, download } = useResourceFile(resource);

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

      <ResourceRating resourceId={resource.id} nudge={opened} />

      {error && <p className="learn-resource-error">{error}</p>}

      <div className="learn-resource-actions">
        <button type="button" onClick={preview} disabled={busy !== ""}>
          {busy === "preview" ? "Opening..." : "Preview"}
        </button>

        <button type="button" onClick={download} disabled={busy !== ""}>
          {busy === "download" ? "Preparing..." : "Download"}
        </button>
      </div>
    </article>
  );
}