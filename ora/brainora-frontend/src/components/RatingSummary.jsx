// "★ 4.5 (12)" or "No ratings yet".
export default function RatingSummary({ average = 0, count = 0 }) {
  if (!count) {
    return <span className="learn-rating-none">No ratings yet</span>;
  }

  return (
    <span className="learn-rating-average">
      <span className="learn-rating-star" aria-hidden="true">★</span>
      <strong>{average.toFixed(1)}</strong>
      <span className="learn-rating-count">({count})</span>
    </span>
  );
}