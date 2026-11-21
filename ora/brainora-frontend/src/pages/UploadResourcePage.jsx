import { useMemo, useRef, useState } from "react";
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
import "../styles/UploadResourcePage.css";

const ACCEPTED_EXTENSIONS = ".pdf,.ppt,.pptx,.doc,.docx,.mp4";

export default function UploadResourcePage({ onUpload, onCancel }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("SUBJECT");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isSubjectScope = scope === "SUBJECT";

  // Verified subject list for this department + semester (if we have one).
  const subjects = useMemo(
    () => getCatalogueSubjects(department, semester),
    [department, semester]
  );

  // Departments without a verified list let the student type the subject.
  const departmentHasCatalogue = hasCatalogue(department);

  function handleScopeChange(value) {
    setScope(value);
    setDepartment("");
    setSemester("");
    setSubject("");
    setCategory("");
    setError("");
    setSuccess("");
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

      setTitle("");
      setDepartment("");
      setSemester("");
      setSubject("");
      setCategory("");
      setType("Notes");
      setDescription("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Share Learning Resources</h1>
          <p>
            Upload useful academic materials and help your fellow students
            learn better.
          </p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="upload-field">
            <label htmlFor="resource-title">Resource Title *</label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              maxLength={180}
              required
            />
          </div>

          <fieldset className="upload-scope-field">
            <legend>Where should this resource appear? *</legend>

            <div className="upload-scope-options">
              <button
                type="button"
                className={`upload-scope-option ${
                  scope === "SUBJECT" ? "selected" : ""
                }`}
                onClick={() => handleScopeChange("SUBJECT")}
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
              >
                <strong>Beyond the Syllabus</strong>
                <small>Useful resources for all students</small>
              </button>
            </div>
          </fieldset>

          {isSubjectScope ? (
            <div className="upload-academic-fields">
              <div className="upload-field">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setSemester("");
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
              </div>

              <div className="upload-field">
                <label htmlFor="semester">Semester *</label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setSubject("");
                  }}
                  disabled={!department}
                  required
                >
                  <option value="">Select semester</option>
                  {SEMESTERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-field">
                <label htmlFor="subject">Subject *</label>

                {departmentHasCatalogue ? (
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={!semester}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="subject"
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
                )}
              </div>
            </div>
          ) : (
            <div className="upload-field">
              <label htmlFor="category">Beyond the Syllabus category *</label>
              <select
                id="category"
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
              <small>
                This resource will be shared with all students and will not be
                linked to a particular department or semester.
              </small>
            </div>
          )}

          <div className="upload-field">
            <label htmlFor="resource-type">Resource Type *</label>
            <select
              id="resource-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {RESOURCE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="upload-field">
            <label htmlFor="resource-description">Description</label>
            <textarea
              id="resource-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this resource..."
              maxLength={300}
              rows={4}
            />
          </div>

          <div className="upload-field">
            <label>Upload File *</label>

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

              <span className="upload-drop-icon">↑</span>
              <strong>Click to browse or drag your file here</strong>
              <small>PDF, PPT, DOC up to 25 MB | MP4 up to 25 MB</small>
            </div>

            {file && (
              <div className="upload-selected-file">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remove
                </button>
              </div>
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
      </div>
    </div>
  );
}