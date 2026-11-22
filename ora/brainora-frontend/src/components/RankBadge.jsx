import "../styles/LeaderboardPage.css";

const LABELS = {
  GOLD: "Gold medal",
  SILVER: "Silver medal",
  BRONZE: "Bronze medal",
};

// Rank 1-3 gold, 4-6 silver, 7-11 bronze. The server sends "medal";
// without a medal only the rank number is shown.
export default function RankBadge({ rank, medal }) {
  if (!medal) {
    return <span className="rank-plain">{rank}</span>;
  }

  return (
    <span
      className={`rank-badge rank-${medal.toLowerCase()}`}
      title={LABELS[medal]}
      aria-label={`${LABELS[medal]}, rank ${rank}`}
    >
      {rank}
    </span>
  );
}
