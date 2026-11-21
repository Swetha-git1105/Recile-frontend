import { useMemo } from "react";
import { RESOURCE_TYPES } from "../data/academicData";
import { keyOf } from "../utils/resourceMatching";
import ResourceItem from "./ResourceItem";

const TYPE_TITLES = {
  notes: "Notes",
  qp: "Question Papers",
  assignment: "Assignments",
  video: "Videos",
  other: "Other",
};

function titleFor(type) {
  return TYPE_TITLES[keyOf(type)] || type || "Other";
}

// Shows resources grouped by their type (Notes, Question Papers, Videos...).
export default function ResourceGroups({ items, emptyMessage }) {
  const groups = useMemo(() => {
    const byType = new Map();

    items.forEach((resource) => {
      const key = keyOf(resource.type) || "other";

      if (!byType.has(key)) {
        byType.set(key, { key, title: titleFor(resource.type), items: [] });
      }

      byType.get(key).items.push(resource);
    });

    // Known types first, in the usual order; unknown types after them.
    const order = RESOURCE_TYPES.map((type) => keyOf(type));

    return [...byType.values()].sort((a, b) => {
      const ia = order.indexOf(a.key);
      const ib = order.indexOf(b.key);

      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [items]);

  function jumpTo(key) {
    document
      .getElementById(`group-${key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!groups.length) {
    return (
      <div className="learn-empty">
        <span>Nothing here yet</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {groups.length > 1 && (
        <div className="learn-chips" role="group" aria-label="Jump to a type">
          {groups.map((group) => (
            <button
              type="button"
              key={group.key}
              className="learn-chip"
              onClick={() => jumpTo(group.key)}
            >
              {group.title} ({group.items.length})
            </button>
          ))}
        </div>
      )}

      {groups.map((group) => (
        <section
          className="learn-group"
          id={`group-${group.key}`}
          key={group.key}
        >
          <div className="learn-group-heading">
            <h3>{group.title}</h3>
            <span>
              {group.items.length}{" "}
              {group.items.length === 1 ? "resource" : "resources"}
            </span>
          </div>

          <div className="learn-resource-grid">
            {group.items.map((resource) => (
              <ResourceItem resource={resource} key={resource.id} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}