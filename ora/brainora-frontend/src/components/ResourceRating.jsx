import { useState } from "react";
import { useRatings } from "../context/RatingContext";
import { useResources } from "../context/ResourceContext";
import RatingSummary from "./RatingSummary";
import StarRating from "./StarRating";

// Average + the reader's own stars for one resource.
// `nudge` highlights it right after the reader previews or downloads.
// The person who uploaded a resource can see its rating but cannot rate it.
export default function ResourceRating({ resourceId, nudge = false }) {
  const { getRating, rate } = useRatings();
  const { myUploads } = useResources();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { average, count, myRating } = getRating(resourceId);

  const isOwn = myUploads.some(
    (item) => String(item.id) === String(resourceId)
  );

  async function handleRate(stars) {
    try {
      setSaving(true);
      setError("");
      await rate(resourceId, stars);
    } catch (err) {
      setError(err.message || "Unable to save your rating.");
    } finally {
      setSaving(false);
    }
  }

  if (isOwn) {
    return (
      <div className="learn-rating">
        <div className="learn-rating-row">
          <RatingSummary average={average} count={count} />
          <span className="learn-rating-hint">Your upload</span>
        </div>
      </div>
    );
  }

  const hint = myRating
    ? "Your rating"
    : nudge
      ? "Enjoyed it? Rate this resource"
      : "Rate this";

  return (
    <div className={`learn-rating${nudge && !myRating ? " nudge" : ""}`}>
      <div className="learn-rating-row">
        <RatingSummary average={average} count={count} />
        <span className="learn-rating-hint">{hint}</span>
      </div>

      <StarRating value={myRating} onRate={handleRate} disabled={saving} />

      {error && <p className="learn-resource-error">{error}</p>}
    </div>
  );
}