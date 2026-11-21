
import { useMemo, useRef, useState } from "react";
import { uploadResource } from "../services/api";
import "../styles/UploadResourcePage.css";

const DEPARTMENTS = [
  { value: "CIVIL", label: "B.E. Civil Engineering" },
  { value: "CSE", label: "B.E. Computer Science and Engineering" },
  { value: "EEE", label: "B.E. Electrical and Electronics Engineering" },
  { value: "ECE", label: "B.E. Electronics and Communication Engineering" },
  { value: "ICE", label: "B.E. Instrumentation and Control Engineering" },
  { value: "MECH", label: "B.E. Mechanical Engineering" },
  { value: "RAI", label: "B.E. Robotics and Artificial Intelligence" },
  { value: "AIDS", label: "B.Tech. Artificial Intelligence and Data Science" },
  { value: "VLSI", label: "B.Tech. Electronics Engineering (VLSI Design & Technology)" },
  { value: "DESIGN", label: "B.Des. Design" },
];

const SUBJECTS_BY_SEMESTER = {
  "Semester 1": [
    "Calculus and its Applications",
    "Programming for Problem Solving",
    "English Language Proficiency",
    "Basics of Electrical and Electronic Systems",
  ],
  "Semester 2": [
    "Transforms and Applications",
    "Sensors for Engineering Applications",
    "Applied Chemistry",
    "Python Programming",
    "Digital Design",
    "Tamils and Technology",
  ],
  "Semester 3": [
    "Linear Algebra",
    "Discrete Structures",
    "Data Structures",
    "Computer Organization and Architecture",
    "Object Oriented Programming",
    "Project and Finance Management",
  ],
  "Semester 4": [
    "Statistical Methods and Stochastic Processes",
    "Database Management Systems",
    "Design and Analysis of Algorithms",
    "Theory of Computation",
    "Software Engineering",
  ],
  "Semester 5": [
    "Operating Systems",
    "Compiler Design",
    "Computer Networks",
    "Artificial Intelligence",
  ],
  "Semester 6": [
    "Graph Theory",
    "Machine Learning",
    "Embedded Systems",
  ],
  "Semester 7": [
    "Parallel and Distributed Systems",
    "Cryptography and Network Security",
  ],
  "Semester 8": [
    "Project Work II",
  ],
};

const RESOURCE_TYPES = ["Notes", "QP", "Assignment", "Video", "Other"];
const ACCEPTED_EXTENSIONS = ".pdf,.ppt,.pptx,.doc,.docx,.mp4";
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export default function UploadResourcePage({ onUpload, onCancel }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("SUBJECT");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const subjects = useMemo(() => {
    return SUBJECTS_BY_SEMESTER[semester] || [];
  }, [semester]);

  const isSubjectScope = scope === "SUBJECT";

  function handleScopeChange(value) {
    setScope(value);
    setDepartment("");
    setSemester("");
    setSubject("");
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
          ? "Video size must not exceed 100 MB."
          : "Document size must not exceed 25 MB."
      );
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a resource title.");
      return;
    }

    if (isSubjectScope && (!department || !semester || !subject)) {
      setError("Please select department, semester and subject.");
      return;
    }

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const resource = {
      title: title.trim(),
      scope,
      department: isSubjectScope ? department : "ALL",
      semester: isSubjectScope ? semester : "",
      subject: isSubjectScope ? subject : "",
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

      setSuccess("Resource uploaded successfully!");

      setTitle("");
      setDepartment("");
      setSemester("");
      setSubject("");
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
                  {Object.keys(SUBJECTS_BY_SEMESTER).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-field">
                <label htmlFor="subject">Subject *</label>
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
              </div>
            </div>
          ) : (
            <div className="upload-common-notice">
              This resource will be shared in Beyond the Syllabus and will
              not be linked to a particular department or semester.
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
              <small>PDF, PPT, DOC up to 25 MB | MP4 up to 100 MB</small>
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
