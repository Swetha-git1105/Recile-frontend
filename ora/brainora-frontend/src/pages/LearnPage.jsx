
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LearnPage.css";

const curriculum = {
  "Computer Science and Engineering": {
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

const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Instrumentation and Control Engineering",
  "Robotics and Artificial Intelligence",
  "Artificial Intelligence and Data Science",
  "Electronics Engineering (VLSI Design and Technology)",
];

const beyondSyllabus = [
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

export default function LearnPage() {
  const navigate = useNavigate();

  const [department, setDepartment] = useState(
    "Computer Science and Engineering"
  );
  const [semester, setSemester] = useState("Semester 3");
  const [search, setSearch] = useState("");

  const subjects = useMemo(() => {
    const departmentCurriculum = curriculum[department];

    if (!departmentCurriculum) return [];

    return departmentCurriculum[semester] || [];
  }, [department, semester]);

  const filteredSubjects = subjects.filter((subject) =>
    subject.toLowerCase().includes(search.trim().toLowerCase())
  );

  function handleDepartmentChange(event) {
    setDepartment(event.target.value);
    setSemester("Semester 1");
    setSearch("");
  }

  function openSubject(subject) {
    navigate(
      `/learn/subject?department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semester)}&subject=${encodeURIComponent(subject)}`
    );
  }

  return (
    <main className="learn-page">
      <section className="learn-heading">
        <div>
          <span className="learn-eyebrow">YOUR ACADEMIC LIBRARY</span>
          <h1>Learn</h1>
          <p>
            Everything you need for your subjects, all in one place.
          </p>
        </div>
      </section>

      <section className="learn-search-section">
        <label className="learn-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            placeholder="Search for a subject..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="learn-explorer">
        <div className="learn-section-heading">
          <div>
            <span className="learn-eyebrow">ACADEMIC EXPLORER</span>
            <h2>Explore your curriculum</h2>
            <p>Choose your department and semester to find your subjects.</p>
          </div>
        </div>

        <div className="learn-select-row">
          <label className="learn-select-field">
            <span>Department</span>
            <select
              value={department}
              onChange={handleDepartmentChange}
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="learn-select-field">
            <span>Semester</span>
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
            >
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1}>
                  Semester {index + 1}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="learn-subject-heading">
          <h3>{semester} subjects</h3>
          <span>{filteredSubjects.length} subjects</span>
        </div>

        {filteredSubjects.length > 0 ? (
          <div className="learn-subject-grid">
            {filteredSubjects.map((subject, index) => (
              <button
                className="learn-subject-card"
                type="button"
                key={subject}
                onClick={() => openSubject(subject)}
              >
                <span className="learn-subject-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="learn-subject-name">{subject}</span>
                <span className="learn-subject-arrow">↗</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="learn-empty">
            <span>Subject catalogue coming soon</span>
            <p>
              The curriculum for this department is not added yet.
              We'll add the verified subject list before connecting it
              to the backend.
            </p>
          </div>
        )}
      </section>

      <section className="beyond-section">
        <div className="beyond-heading">
          <div>
            <span className="learn-eyebrow">LEARNING DOESN'T STOP HERE</span>
            <h2>Beyond the Syllabus</h2>
            <p>
              Explore useful skills and resources beyond your semester
              subjects.
            </p>
          </div>
          <span className="beyond-tag">COMMON FOR EVERYONE</span>
        </div>

        <div className="beyond-grid">
          {beyondSyllabus.map((item) => (
            <button
              type="button"
              className="beyond-card"
              key={item.title}
              onClick={() =>
                navigate(
                  `/learn/beyond?category=${encodeURIComponent(item.title)}`
                )
              }
            >
              <span className="beyond-icon">{item.icon}</span>
              <span className="beyond-type">{item.type}</span>
              <strong>{item.title}</strong>
              <span className="beyond-description">
                {item.description}
              </span>
              <span className="beyond-arrow">Explore resources ↗</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
