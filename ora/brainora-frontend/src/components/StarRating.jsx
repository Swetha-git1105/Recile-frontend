import { useState } from "react";

// Five clickable stars. Hovering previews a rating, clicking saves it.
// readOnly shows a fixed value (used for the average).
export default function StarRating({
  value = 0,
  onRate,
  disabled = false,
  readOnly = false,
}) {
  const [hover, setHover] = useState(0);

  const shown = readOnly ? Math.round(value) : hover || value;

  return (
    <div
      className={`learn-stars${readOnly ? " read-only" : ""}`}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value.toFixed(1)} out of 5 stars` : "Rate this resource"}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          role={readOnly ? undefined : "radio"}
          aria-checked={readOnly ? undefined : value === star}
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          className={`learn-star${star <= shown ? " filled" : ""}`}
          disabled={disabled || readOnly}
          tabIndex={readOnly ? -1 : 0}
          onMouseEnter={() => !disabled && !readOnly && setHover(star)}
          onClick={() => onRate?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}