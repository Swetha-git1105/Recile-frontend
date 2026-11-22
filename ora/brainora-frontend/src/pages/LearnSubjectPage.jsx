import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAllResources from "../hooks/useAllResources";
import ResourceGroups from "../components/ResourceGroups";
import NoResultsRequest from "../components/NoResultsRequest";
import { departmentLabel } from "../data/academicData";
import {
  isCommon,
  matchDepartment,
  matchSemester,
  matchSubject,
} from "../utils/resourceMatching";
import "../styles/LearnPage.css";

// Opens when a subject is clicked on the Learn page:
// /learn/subject?department=CSE&semester=Semester 3&subject=Data Structures
export default function LearnSubjectPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const department = params.get("department") || "";
  const semester = params.get("semester") || "";
  const subject = params.get("subject") || "";

  const { resources, loading, error, reload } = useAllResources();

  const items = useMemo(
    () =>
      resources.filter(
        (resource) =>
          !isCommon(resource) &&
          matchDepartment(resource.department, department) &&
          matchSemester(resource.semester, semester) &&
          matchSubject(resource.subject, subject)
      ),
    [resources, department, semester, subject]
  );

  function goBack() {
    navigate(`/learn?${new URLSearchParams({ department, semester })}`);
  }

  return (
    <main className="learn-page">
      <button type="button" className="learn-back" onClick={goBack}>
        ← Back to Learn
      </button>

      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">
            {departmentLabel(department)} · {semester}
          </span>
          <h1>{subject || "Subject"}</h1>
          <p>
            {loading
              ? "Loading resources..."
              : `${items.length} ${items.length === 1 ? "resource" : "resources"} available`}
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
          query={subject}
          title={`No resources for “${subject}” yet`}
          message="Nobody has shared one yet. Request it and every student will be notified, or upload the first one yourself from the Upload page."
          department={departmentLabel(department)}
          semester={semester}
          subject={subject}
        />
      )}
    </main>
  );
}
