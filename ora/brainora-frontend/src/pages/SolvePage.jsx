import { useEffect, useRef, useState } from "react";
import {
  getQuestions,
  askQuestion,
  answerQuestion,
  deleteQuestion,
  deleteAnswer,
  getQuestionAttachmentBlob,
} from "../services/api";
import "../styles/LearnPage.css";
import "../styles/SolvePage.css";
import "../styles/SolveTabs.css";

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

// "Name" or "Anonymous". Your own anonymous posts say "You (anonymous)".
function authorLabel(item) {
  if (item.anonymous) return item.mine ? "You (anonymous)" : "Anonymous";

  return item.mine ? `${item.authorName} (you)` : item.authorName;
}

const MAX_PDF_MB = 10;

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// "Attach a PDF (optional)": picks one PDF and shows it with a remove button
function PdfPicker({ file, onChange, onError }) {
  const inputRef = useRef(null);

  function handlePick(event) {
    const picked = event.target.files?.[0];

    event.target.value = "";

    if (!picked) return;

    const isPdf =
      picked.type === "application/pdf" || /\.pdf$/i.test(picked.name);

    if (!isPdf) {
      onError("Only PDF files can be attached.");
      return;
    }

    if (picked.size > MAX_PDF_MB * 1024 * 1024) {
      onError(`The PDF must be ${MAX_PDF_MB} MB or smaller.`);
      return;
    }

    onError("");
    onChange(picked);
  }

  return (
    <div className="solve-file">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handlePick}
        hidden
      />

      {file ? (
        <span className="solve-pdf chosen">
          <b>PDF</b>
          <span className="solve-pdf-name">{file.name}</span>
          <small>{formatSize(file.size)}</small>
          <button
            type="button"
            className="solve-pdf-remove"
            aria-label="Remove the PDF"
            onClick={() => onChange(null)}
          >
            ×
          </button>
        </span>
      ) : (
        <button
          type="button"
          className="solve-attach"
          onClick={() => inputRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9" />
          </svg>
          Attach a PDF <em>(optional, up to {MAX_PDF_MB} MB)</em>
        </button>
      )}
    </div>
  );
}

// A PDF attached to a question or an answer: click to open it in a new tab
function PdfLink({ attachment }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!attachment) return null;

  async function openPdf() {
    // Open the tab right away (allowed by the browser), fill it when the file arrives
    const tab = window.open("", "_blank");

    try {
      setBusy(true);
      setError("");

      const blob = await getQuestionAttachmentBlob(attachment.id);
      const url = URL.createObjectURL(blob);

      if (tab) {
        tab.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.filename;
        link.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (tab) tab.close();
      setError(err.message || "Unable to open the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="solve-file">
      <button
        type="button"
        className="solve-pdf"
        onClick={openPdf}
        disabled={busy}
        title="Open the PDF"
      >
        <b>PDF</b>
        <span className="solve-pdf-name">{attachment.filename}</span>
        <small>{busy ? "Opening..." : formatSize(attachment.sizeBytes)}</small>
      </button>

      {error && <p className="solve-error">{error}</p>}
    </div>
  );
}

// One question with its answers and the answer form
function QuestionCard({ question, onChanged, onRemoved }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitAnswer(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      const updated = await answerQuestion(question.id, { body, anonymous, file });

      onChanged(updated);
      setBody("");
      setFile(null);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Unable to post your answer.");
    } finally {
      setBusy(false);
    }
  }

  async function removeQuestion() {
    if (!window.confirm("Delete this question and all its answers?")) return;

    try {
      await deleteQuestion(question.id);
      onRemoved(question.id);
    } catch (err) {
      setError(err.message || "Unable to delete the question.");
    }
  }

  async function removeAnswer(answerId) {
    if (!window.confirm("Delete your answer?")) return;

    try {
      await deleteAnswer(answerId);

      onChanged({
        ...question,
        answers: question.answers.filter((answer) => answer.id !== answerId),
      });
    } catch (err) {
      setError(err.message || "Unable to delete the answer.");
    }
  }

  return (
    <article className="solve-question">
      <header>
        <h3>{question.title}</h3>

        <p className="solve-meta">
          {authorLabel(question)} · {formatWhen(question.createdAt)}
        </p>
      </header>

      <p className="solve-body">{question.body}</p>

      <PdfLink attachment={question.attachment} />

      <div className="solve-card-actions">
        <button type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Cancel" : "Add a solution"}
        </button>

        {question.mine && (
          <button type="button" className="danger" onClick={removeQuestion}>
            Delete
          </button>
        )}
      </div>

      {open && (
        <form className="solve-form inline" onSubmit={submitAnswer}>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write your solution..."
            maxLength={4000}
            rows={4}
            required={!file}
          />

          <PdfPicker file={file} onChange={setFile} onError={setError} />

          <label className="solve-check">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
            />
            Answer anonymously
          </label>

          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Posting..." : "Post solution"}
          </button>
        </form>
      )}

      {error && <p className="solve-error">{error}</p>}

      <div className="solve-answers">
        <h4>
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "solution" : "solutions"}
        </h4>

        {question.answers.map((answer) => (
          <div className="solve-answer" key={answer.id}>
            <p className="solve-meta">
              {authorLabel(answer)} · {formatWhen(answer.createdAt)}
            </p>

            <p className="solve-body">{answer.body}</p>

            <PdfLink attachment={answer.attachment} />

            {answer.mine && (
              <button
                type="button"
                className="solve-link danger"
                onClick={() => removeAnswer(answer.id)}
              >
                Delete my answer
              </button>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function SolvePage() {
  // The two options on this page: "solve" (answer others' questions) or "post"
  const [tab, setTab] = useState("solve");
  const [notice, setNotice] = useState("");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getQuestions();

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message || "Unable to load questions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function switchTab(next) {
    setTab(next);
    setNotice("");
  }

  async function postQuestion(event) {
    event.preventDefault();

    try {
      setPosting(true);
      setPostError("");

      const created = await askQuestion({ title, body, anonymous, file });

      setQuestions((current) => [created, ...current]);
      setTitle("");
      setBody("");
      setFile(null);
      setAnonymous(false);

      // Show the new question at the top of the "Solve Questions" tab
      setTab("solve");
      setNotice("Your question was posted.");
    } catch (err) {
      setPostError(err.message || "Unable to post your question.");
    } finally {
      setPosting(false);
    }
  }

  function replaceQuestion(updated) {
    setQuestions((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
  }

  function removeQuestion(id) {
    setQuestions((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="learn-page solve-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">HELP EACH OTHER</span>
          <h1>Time for Solving</h1>
          <p>
            Stuck on something? Post your question, and let other students add
            their solutions, by name or anonymously.
          </p>
        </div>
      </section>

      <div className="solve-tabs" role="tablist" aria-label="Solve options">
        <button
          type="button"
          role="tab"
          id="solve-tab-solve"
          aria-selected={tab === "solve"}
          className={`solve-tab${tab === "solve" ? " active" : ""}`}
          onClick={() => switchTab("solve")}
        >
          Solve Questions
          {questions.length > 0 && (
            <span className="solve-tab-count">{questions.length}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="solve-tab-post"
          aria-selected={tab === "post"}
          className={`solve-tab${tab === "post" ? " active" : ""}`}
          onClick={() => switchTab("post")}
        >
          Post a Question
        </button>
      </div>

      {tab === "post" && (
        <section
          className="learn-explorer solve-card"
          role="tabpanel"
          aria-labelledby="solve-tab-post"
        >
          <div className="learn-section-heading">
            <div>
              <span className="learn-eyebrow">ASK A QUESTION</span>
              <h2>What do you need help with?</h2>
            </div>
          </div>

          <form className="solve-form" onSubmit={postQuestion}>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Short title, for example: Why does my loop never end?"
              maxLength={200}
              required
            />

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Explain your question with as much detail as you can..."
              maxLength={4000}
              rows={5}
              required={!file}
            />

            <PdfPicker file={file} onChange={setFile} onError={setPostError} />

            <label className="solve-check">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              Post anonymously
            </label>

            {postError && <p className="solve-error">{postError}</p>}

            <button type="submit" className="primary" disabled={posting}>
              {posting ? "Posting..." : "Post question"}
            </button>
          </form>
        </section>
      )}

      {tab === "solve" && (
        <div role="tabpanel" aria-labelledby="solve-tab-solve" className="solve-panel">
          {notice && (
            <p className="solve-notice" role="status">
              {notice}
            </p>
          )}

          {loadError && (
            <div className="learn-status" role="alert">
              <span>{loadError}</span>
              <button type="button" onClick={load}>
                Try Again
              </button>
            </div>
          )}

          {loading && !questions.length && !loadError && (
            <p className="learn-status-text">Loading questions...</p>
          )}

          {!loading && !loadError && !questions.length && (
            <div className="learn-empty">
              <span>No questions yet</span>
              <p>Be the first to ask something.</p>

              <button
                type="button"
                className="solve-empty-action"
                onClick={() => switchTab("post")}
              >
                Post a Question
              </button>
            </div>
          )}

          <section className="solve-list" aria-label="Questions">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onChanged={replaceQuestion}
                onRemoved={removeQuestion}
              />
            ))}
          </section>
        </div>
      )}
    </main>
  );
}