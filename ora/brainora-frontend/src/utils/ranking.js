// Picks the top recommended resources.
//
// A plain average is unfair: one 5-star vote would beat 40 votes averaging
// 4.8. So each resource is pulled toward the overall average until it has
// enough votes (a "Bayesian average"). Change MIN_VOTES to make it
// stricter (higher) or more forgiving (lower).
const MIN_VOTES = 3;

export function rankResources(resources, ratings, limit = 6) {
  const rated = resources
    .map((resource) => ({ resource, entry: ratings[resource.id] }))
    .filter(({ entry }) => entry && entry.count > 0);

  if (!rated.length) return [];

  const totalVotes = rated.reduce((sum, { entry }) => sum + entry.count, 0);
  const overallAverage =
    rated.reduce((sum, { entry }) => sum + entry.average * entry.count, 0) /
    totalVotes;

  return rated
    .map(({ resource, entry }) => ({
      resource,
      count: entry.count,
      score:
        (entry.count / (entry.count + MIN_VOTES)) * entry.average +
        (MIN_VOTES / (entry.count + MIN_VOTES)) * overallAverage,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.count - a.count ||
        new Date(b.resource.uploadedAt || 0) - new Date(a.resource.uploadedAt || 0)
    )
    .slice(0, limit)
    .map(({ resource }) => resource);
}