import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { requestWantedResource } from "../services/api";
import "../styles/RequestResource.css";

// The popup: "Request a resource". It asks for the title (already filled with
// what the student searched for) and an optional note, then notifies everyone.
export default function RequestResourceModal({
  open,
  onClose,
  initialTitle = "",
  department = "",
  semester = "",
  subject = "",
}) {
  const [title, setTitle] = useState("");
  const [subjectText, setSubjectText] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const titleRef = useRef(null);

  // Start fresh every time the popup opens
  useEffect(() => {
    if (!open) return;

    setTitle(initialTitle);
    setSubjectText(subject);
    setDetails("");
    setError("");
    setDoneMessage("");
    setBusy(false);

    const timer = window.setTimeout(() => titleRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open, initialTitle, subject]);

  // Escape closes it, and the page behind it does not scroll
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError("Please type what you are looking for (at least 3 letters).");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const result = await requestWantedResource({
        title: title.trim(),
        department,
        semester,
        subject: subjectText.trim(),
        details: details.trim(),
      });

      setDoneMessage(result?.message || "Request sent.");
    } catch (err) {
      // 409 = already requested today. Everyone was notified, so say so kindly.
      if (err?.status === 409) {
        setDoneMessage(err.message);
      } else {
        setError(err?.message || "Unable to send the request.");
      }
    } finally {
      setBusy(false);
    }
  }

  const where = [department, semester].filter(Boolean).join(" · ");

  return createPortal(
    <div className="rr-backdrop" onMouseDown={onClose}>
      <div
        className="rr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rr-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="rr-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {doneMessage ? (
          <div className="rr-done">
            <span className="rr-done-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h2 id="rr-title">Request sent</h2>
            <p>{doneMessage}</p>
            <button type="button" className="rr-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <span className="rr-eyebrow">CAN'T FIND IT?</span>
            <h2 id="rr-title">Request a resource</h2>
            <p className="rr-lead">
              Every student will get a notification, so someone who has this
              file can upload it.
            </p>

            {where && <p className="rr-where">{where}</p>}

            <label className="rr-field">
              <span>What do you need?</span>
              <input
                ref={titleRef}
                type="text"
                value={title}
                maxLength={150}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example: OS unit 3 notes"
              />
            </label>

            <label className="rr-field">
              <span>Subject <em>(optional)</em></span>
              <input
                type="text"
                value={subjectText}
                maxLength={150}
                onChange={(event) => setSubjectText(event.target.value)}
                placeholder="For example: Operating Systems"
              />
            </label>

            <label className="rr-field">
              <span>Anything else? <em>(optional)</em></span>
              <textarea
                rows={3}
                value={details}
                maxLength={300}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Year, faculty name, exam type..."
              />
            </label>

            {error && <p className="rr-error" role="alert">{error}</p>}

            <div className="rr-actions">
              <button type="button" className="rr-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="rr-primary" disabled={busy}>
                {busy ? "Sending..." : "Send request"}
              </button>
            </div>

            <p className="rr-note">Your name is not shown. Others only see "Someone".</p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
