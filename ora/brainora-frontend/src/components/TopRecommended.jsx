import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../context/RatingContext";
import { useResources } from "../context/ResourceContext";
import { rankResources } from "../utils/ranking";
import ResourceItem from "./ResourceItem";
import "../styles/LearnPage.css";

// Top recommended resources, ranked by student ratings.
// Updates instantly when someone rates a resource.
//
//     <TopRecommended limit={3} seeAllTo="/updates" />
//
export default function TopRecommended({ limit = 6, seeAllTo }) {
  const { resources, loading: resourcesLoading } = useResources();
  const { ratings, loading: ratingsLoading } = useRatings();

  const top = useMemo(
    () => rankResources(resources, ratings, limit),
    [resources, ratings, limit]
  );

  if ((resourcesLoading || ratingsLoading) && !top.length) {
    return <p className="learn-status-text">Loading recommendations...</p>;
  }

  if (!top.length) {
    return (
      <div className="learn-empty">
        <span>No recommendations yet</span>
        <p>Rate a resource and the best ones will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="learn-resource-grid">
        {top.map((resource) => (
          <ResourceItem resource={resource} key={resource.id} />
        ))}
      </div>

      {seeAllTo && (
        <Link className="learn-see-all" to={seeAllTo}>
          See all resources →
        </Link>
      )}
    </>
  );
}