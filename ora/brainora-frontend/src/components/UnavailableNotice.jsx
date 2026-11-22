import { useState } from "react";
import { requestResource } from "../services/api";
import "../styles/ResourceAccess.css";

// Shown instead of Preview / Download when a resource's file is missing.
// "Request this resource" tells every other student that someone needs it.
export default function UnavailableNotice({ resource }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function handleRequest() {
    try {
      setBusy(true);
      setError("");

      const result = await requestResource(resource.id);

      setDone(result?.message || "Request sent.");
    } catch (err) {
      // 409 means this student has already requested it
      if (err?.status === 409) {
        setDone(err.message || "You have already requested this resource.");
      } else {
        setError(err?.message || "Unable to send the request.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="resource-unavailable" role="status">
      <strong>Resource unavailable</strong>

      <p>
        The file for this resource is no longer on the server. You can ask for
        it, and every student will be notified that it is needed.
      </p>

      {done ? (
        <p className="request-done">{done}</p>
      ) : (
        <button type="button" onClick={handleRequest} disabled={busy}>
          {busy ? "Sending..." : "Request this resource"}
        </button>
      )}

      {error && <p className="request-error">{error}</p>}
    </div>
  );
}
