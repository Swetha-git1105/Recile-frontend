import { useEffect, useMemo, useRef, useState } from "react";
import { uploadResource } from "../services/api";
import {
  BEYOND_CATEGORIES,
  COMMON_DEPARTMENT,
  DEPARTMENTS,
  MAX_DOCUMENT_SIZE,
  MAX_VIDEO_SIZE,
  RESOURCE_TYPES,
  SEMESTERS,
  getCatalogueSubjects,
  hasCatalogue,
} from "../data/academicData";
import "../styles/LearnPage.css";
import "../styles/UploadResourcePage.css";

const ACCEPTED_EXTENSIONS = ".pdf,.ppt,.pptx,.doc,.docx,.mp4";

// Department and semester are pre-selected, so the subjects of that
// semester are listed as soon as the page opens (same as the Learn page).
const DEFAULT_DEPARTMENT = (() => {
  const list = Array.isArray(DEPARTMENTS) ? DEPARTMENTS : [];
  const cse = list.find((item) =>
    /computer\s*science|^cse$/i.test(`${item.label} ${item.value}`)
  );

  return (cse || list[0])?.value || "";
})();

const DEFAULT_SEMESTER = (Array.isArray(SEMESTERS) && SEMESTERS[0]) || "";

function fileKind(file) {
  const name = (file?.name || "").toLowerCase();

  if (name.endsWith(".mp4")) return "video";
  if (name.endsWith(".pdf")) return "pdf";

  return "other";
}

export default function UploadResourcePage({ onUpload, onCancel }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("SUBJECT");
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT);
  const [semester, setSemester] = useState(DEFAULT_SEMESTER);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isSubjectScope = scope === "SUBJECT";

  // A local preview of the chosen file, made in the browser (no upload).
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      setShowPreview(false);
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Verified subject list for this department + semester (if we have one).
  const subjects = useMemo(() => {
    try {
      const list = getCatalogueSubjects(department, semester);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, [department, semester]);

  // Departments without a verified list let the student type the subject.
  const departmentHasCatalogue = hasCatalogue(department);

  function handleScopeChange(value) {
    setScope(value);
    setDepartment(DEFAULT_DEPARTMENT);
    setSemester(DEFAULT_SEMESTER);
    setSubject("");
    setCategory("");
    setError("");
    setSuccess("");
  }

  function clearFile() {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(selectedFile) {
    setError("");
    setSuccess("");

    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();
    const isVideo = name.endsWith(".mp4");
    const validExtension = ACCEPTED_EXTENSIONS
      .split(",")
      .some((extension) => name.endsWith(extension));

    if (!validExtension) {
      setError("Please select a PDF, PPT, DOC or MP4 file.");
      return;
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_DOCUMENT_SIZE;

    if (selectedFile.size > maxSize) {
      setError(
        isVideo
          ? "Video size must not exceed 25 MB."
          : "Document size must not exceed 25 MB."
      );
      return;
    }

    setFile(selectedFile);
    setShowPreview(false);

    // Picking an mp4 switches the type to "Video" automatically.
    if (isVideo) {
      setType("Video");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a resource title.");
      return;
    }

    if (isSubjectScope && (!department || !semester || !subject.trim())) {
      setError("Please select department, semester and subject.");
      return;
    }

    if (!isSubjectScope && !category) {
      setError("Please choose a Beyond the Syllabus category.");
      return;
    }

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    // Beyond the Syllabus resources are saved with department "ALL" and the
    // category name in the subject field, so the Learn page can find them.
    const resource = {
      title: title.trim(),
      scope,
      department: isSubjectScope ? department : COMMON_DEPARTMENT,
      semester: isSubjectScope ? semester : "",
      subject: isSubjectScope ? subject.trim() : category,
      type,
      description: description.trim(),
      file,
    };

    try {
      setLoading(true);

      const result = await uploadResource(resource);

      if (onUpload) {
        onUpload(result);
      }

      // The server message includes the credits earned.
      setSuccess(result?.message || "Resource uploaded successfully!");

      // Department and semester stay selected for the next upload.
      setTitle("");
      setSubject("");
      setCategory("");
      setType("Notes");
      setDescription("");
      clearFile();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  }

  const kind = fileKind(file);

  return (
    <main className="learn-page upload-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">SHARE WITH STUDENTS</span>
          <h1>Upload</h1>
          <p>
            Upload useful academic materials and help your fellow students
            learn better.
          </p>
        </div>
      </section>

      <section className="learn-explorer upload-card">
        <div className="learn-section-heading">
          <div>
            <span className="learn-eyebrow">RESOURCE DETAILS</span>
            <h2>Share a learning resource</h2>
            <p>Tell us where this resource belongs, then add your file.</p>
          </div>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="upload-field">
            <span>Resource Title *</span>
            <input
              className="upload-control"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              maxLength={180}
              required
            />
          </label>

          <fieldset className="upload-scope-field">
            <legend>Where should this resource appear? *</legend>

            <div className="upload-scope-options">
              <button
                type="button"
                className={`upload-scope-option ${
                  scope === "SUBJECT" ? "selected" : ""
                }`}
                onClick={() => handleScopeChange("SUBJECT")}
                aria-pressed={scope === "SUBJECT"}
              >
                <strong>Subject-specific</strong>
                <small>For a particular department and subject</small>
              </button>

              <button
                type="button"
                className={`upload-scope-option ${
                  scope === "COMMON" ? "selected" : ""
                }`}
                onClick={() => handleScopeChange("COMMON")}
                aria-pressed={scope === "COMMON"}
              >
                <strong>Beyond the Syllabus</strong>
                <small>Useful resources for all students</small>
              </button>
            </div>
          </fieldset>

          {isSubjectScope ? (
            <>
              <div className="learn-select-row">
                <label className="learn-select-field">
                  <span>Department *</span>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setSubject("");
                    }}
                    required
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
                  <span>Semester *</span>
                  <select
                    value={semester}
                    onChange={(e) => {
                      setSemester(e.target.value);
                      setSubject("");
                    }}
                    required
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

              <div className="learn-select-row">
                {departmentHasCatalogue ? (
                  <label className="learn-select-field">
                    <span>Subject *</span>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={!semester}
                      required
                    >
                      <option value="">
                        {semester ? "Select subject" : "Select semester first"}
                      </option>
                      {subjects.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="upload-field">
                    <span>Subject *</span>
                    <input
                      className="upload-control"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={
                        semester
                          ? "Type the subject name"
                          : "Select semester first"
                      }
                      maxLength={180}
                      disabled={!semester}
                      required
                    />
                  </label>
                )}

                <label className="learn-select-field">
                  <span>Resource Type *</span>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    {RESOURCE_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className="learn-select-row">
              <label className="learn-select-field">
                <span>Beyond the Syllabus category *</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {BEYOND_CATEGORIES.map((item) => (
                    <option key={item.title} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="learn-select-field">
                <span>Resource Type *</span>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {RESOURCE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {!isSubjectScope && (
            <p className="upload-hint">
              This resource will be shared with all students and will not be
              linked to a particular department or semester.
            </p>
          )}

          <label className="upload-field">
            <span>Description (optional)</span>
            <textarea
              className="upload-control upload-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this resource..."
              maxLength={300}
              rows={4}
            />
            <small className="upload-counter">{description.length} / 300</small>
          </label>

          <div className="upload-field">
            <span>Upload File *</span>

            <div
              className={`upload-drop-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFileChange(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                hidden
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <span className="upload-drop-icon" aria-hidden="true">
                ↑
              </span>
              <strong>Click to browse or drag your file here</strong>
              <small>PDF, PPT, DOC up to 25 MB | MP4 up to 25 MB</small>
            </div>

            {file && (
              <>
                <div className="upload-selected-file">
                  <span>
                    {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>

                  <div className="upload-selected-buttons">
                    <button
                      type="button"
                      onClick={() => setShowPreview((open) => !open)}
                    >
                      {showPreview ? "Hide preview" : "Preview"}
                    </button>

                    <button type="button" onClick={clearFile}>
                      Remove
                    </button>
                  </div>
                </div>

                {showPreview && previewUrl && (
                  <div className="upload-preview">
                    {kind === "video" && (
                      <video
                        src={previewUrl}
                        controls
                        preload="metadata"
                        playsInline
                      />
                    )}

                    {kind === "pdf" && (
                      <iframe src={previewUrl} title="PDF preview" />
                    )}

                    {kind === "other" && (
                      <p className="upload-preview-note">
                        Your browser cannot show a preview of this file type.
                        It will upload normally, and students can download it.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="upload-error-message" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="upload-success-message" role="status">
              {success}
            </div>
          )}

          <div className="upload-actions">
            <button
              type="button"
              className="upload-cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="upload-submit-button"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Resource"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}