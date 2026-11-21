import { COMMON_DEPARTMENT, departmentLabel } from "../data/academicData";

/* Tolerant matching.
   The Upload page saves department, semester and subject as plain text.
   A strict "===" hides a resource when the text differs even slightly
   ("Semester 2" vs "2", letter case, extra spaces). These helpers compare
   the meaning instead. Used by the Learn page and the two detail pages. */

export function keyOf(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function numberOf(value) {
  const match = (value || "").toString().match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function matchDepartment(resourceDepartment, selected) {
  const a = keyOf(resourceDepartment);

  if (a === "") return false;

  return a === keyOf(selected) || a === keyOf(departmentLabel(selected));
}

export function matchSemester(resourceSemester, selected) {
  const a = numberOf(resourceSemester);
  const b = numberOf(selected);

  if (a !== null && b !== null) return a === b;

  return (
    keyOf(resourceSemester) !== "" &&
    keyOf(resourceSemester) === keyOf(selected)
  );
}

export function matchSubject(resourceSubject, selected) {
  const a = keyOf(resourceSubject);

  return a !== "" && a === keyOf(selected);
}

export function isCommon(resource) {
  return keyOf(resource?.department) === keyOf(COMMON_DEPARTMENT);
}

export function typeClass(type) {
  return (type || "other")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export function formatDate(date) {
  if (!date) return "Recently uploaded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Recently uploaded";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getFileType(resource) {
  const extension = (resource.originalFilename || "").split(".").pop();
  return extension ? extension.toUpperCase() : "FILE";
}