// Shared by LearnPage.jsx and UploadResourcePage.jsx.
// Keeping the department codes, semesters and subject names in ONE place
// guarantees that what a student uploads is exactly what Learn page finds.

// Resources that belong to "Beyond the Syllabus" are saved with this
// department value, and their category name is saved in the subject field.
export const COMMON_DEPARTMENT = "ALL";

export const DEPARTMENTS = [
  { value: "CIVIL", label: "B.E. Civil Engineering" },
  { value: "CSE", label: "B.E. Computer Science and Engineering" },
  { value: "EEE", label: "B.E. Electrical and Electronics Engineering" },
  { value: "ECE", label: "B.E. Electronics and Communication Engineering" },
  { value: "ICE", label: "B.E. Instrumentation and Control Engineering" },
  { value: "MECH", label: "B.E. Mechanical Engineering" },
  { value: "RAI", label: "B.E. Robotics and Artificial Intelligence" },
  { value: "AIDS", label: "B.Tech. Artificial Intelligence and Data Science" },
  { value: "VLSI", label: "B.Tech. Electronics Engineering (VLSI Design & Technology)" },
  { value: "DESIGN", label: "B.Des. Design" },
];

export const SEMESTERS = Array.from(
  { length: 8 },
  (_, index) => `Semester ${index + 1}`
);

export const RESOURCE_TYPES = ["Notes", "QP", "Assignment", "Video", "Other"];

// Upload limits (must match the backend: StudyResourceService + multipart settings)
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

// Verified subject lists. Add other departments here when you have them.
// A department that is missing here still works: the Learn page then shows
// the subjects that students have uploaded resources for.
export const CURRICULUM = {
  CSE: {
    "Semester 1": [
      "Calculus and its Applications",
      "C Programming",
      "Basics of Electrical and Electronic Systems",
      "English Language Proficiency",
      "Heritage of Tamils",
      "C Programming Laboratory",
      "Engineering Skills Laboratory",
      "Design Thinking for Innovation",
    ],
    "Semester 2": [
      "Transforms and Applications",
      "Sensors for Engineering Applications",
      "Applied Chemistry",
      "Python Programming",
      "Digital Design",
      "Tamils and Technology",
      "Python Programming Laboratory",
      "Physics and Chemistry Laboratory",
      "Engineering Graphics",
      "Workplace Communication Skills",
    ],
    "Semester 3": [
      "Linear Algebra",
      "Discrete Structures",
      "Data Structures",
      "Computer Organization and Architecture",
      "Object Oriented Programming",
      "Project and Finance Management",
      "Data Structures Laboratory",
      "Foundations of Problem Solving",
    ],
    "Semester 4": [
      "Statistical Methods and Stochastic Processes",
      "Database Management Systems",
      "Design and Analysis of Algorithms",
      "Theory of Computation",
      "Software Engineering",
      "DBMS Laboratory",
      "Application Development Laboratory",
      "Mini Project I",
    ],
    "Semester 5": [
      "Operating Systems",
      "Compiler Design",
      "Computer Networks",
      "Artificial Intelligence",
      "Professional Elective I",
      "Operating Systems Laboratory",
      "Computer Networks Laboratory",
    ],
    "Semester 6": [
      "Graph Theory",
      "Machine Learning",
      "Embedded Systems",
      "Professional Elective II",
      "Open Elective I",
      "Machine Learning Laboratory",
      "Mini Project II",
    ],
    "Semester 7": [
      "Parallel and Distributed Systems",
      "Cryptography and Network Security",
      "Professional Elective III",
      "Professional Elective IV",
      "Open Elective II",
      "Parallel and Distributed Systems Laboratory",
      "Project Work I",
    ],
    "Semester 8": [
      "Professional Elective V",
      "Professional Elective VI",
      "Project Work II",
    ],
  },
};

// "Beyond the Syllabus" categories (common for every student)
export const BEYOND_CATEGORIES = [
  {
    title: "Programming Fundamentals",
    description: "Build your coding foundation",
    icon: "⌘",
    type: "Programming",
  },
  {
    title: "GitHub Basics",
    description: "Version control and collaboration",
    icon: "⌁",
    type: "Tools",
  },
  {
    title: "Web Development",
    description: "Explore frontend and backend",
    icon: "◇",
    type: "Development",
  },
  {
    title: "Career Preparation",
    description: "Build skills beyond academics",
    icon: "↗",
    type: "Career",
  },
];

export function hasCatalogue(departmentCode) {
  return Boolean(CURRICULUM[departmentCode]);
}

export function getCatalogueSubjects(departmentCode, semester) {
  return CURRICULUM[departmentCode]?.[semester] || [];
}

export function departmentLabel(code) {
  if (code === COMMON_DEPARTMENT) return "Beyond the Syllabus";
  return DEPARTMENTS.find((item) => item.value === code)?.label || code || "";
}