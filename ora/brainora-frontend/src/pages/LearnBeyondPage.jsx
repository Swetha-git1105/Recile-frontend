import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAllResources from "../hooks/useAllResources";
import ResourceGroups from "../components/ResourceGroups";
import NoResultsRequest from "../components/NoResultsRequest";
import { BEYOND_CATEGORIES } from "../data/academicData";
import { isCommon, matchSubject } from "../utils/resourceMatching";
import "../styles/LearnPage.css";

// Opens when a Beyond the Syllabus card is clicked on the Learn page:
// /learn/beyond?category=GitHub Basics
export default function LearnBeyondPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const category = params.get("category") || "";

  const { resources, loading, error, reload } = useAllResources();

  const details = BEYOND_CATEGORIES.find((item) => item.title === category);

  const items = useMemo(
    () =>
      resources.filter(
        (resource) =>
          isCommon(resource) && matchSubject(resource.subject, category)
      ),
    [resources, category]
  );

  return (
    <main className="learn-page">
      <button
        type="button"
        className="learn-back"
        onClick={() => navigate("/learn")}
      >
        ← Back to Learn
      </button>

      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">BEYOND THE SYLLABUS</span>
          <h1>{category || "Category"}</h1>
          <p>
            {loading
              ? "Loading resources..."
              : `${details?.description ? `${details.description} · ` : ""}${items.length} ${items.length === 1 ? "resource" : "resources"} available`}
          </p>
        </div>
      </section>

      {error && (
        <div className="learn-status" role="alert">
          <span>{error}</span>
          <button type="button" onClick={reload}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ResourceGroups items={items} />
      )}

      {/* Nothing here yet: let the student ask for it */}
      {!loading && !error && items.length === 0 && (
        <NoResultsRequest
          query={category}
          title={`No resources for “${category}” yet`}
          message="Nobody has shared one yet. Request it and every student will be notified, or upload the first one yourself from the Upload page."
          department="Beyond the Syllabus"
          subject={category}
        />
      )}
    </main>
  );
}
