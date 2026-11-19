import type {
  ActivityLog,
  Assignment,
  AttendanceRecord,
  DemoUser,
  EduTrackState,
  MarkEntry,
  PromptLabTemplate,
  Student,
} from "../types";

export const COURSES = [
  "CS-301 Algorithms & Data Structures",
  "CS-340 Database Systems",
  "AI-210 Applied Machine Learning",
  "SE-220 Software Architecture",
];

export const DEPARTMENTS = [
  "Computer Science",
  "Data Science",
  "Software Engineering",
  "Electrical Engineering",
];

export const DEMO_USERS: DemoUser[] = [
  {
    id: "user-admin",
    name: "Dr. Elena Vance",
    email: "elena.vance@edutrack.edu",
    role: "admin",
    title: "Academic Dean",
  },
  {
    id: "user-faculty",
    name: "Prof. Marcus Reid",
    email: "marcus.reid@edutrack.edu",
    role: "faculty",
    title: "Senior CS Lecturer",
  },
  {
    id: "user-student",
    name: "Maya Lin",
    email: "maya.lin@edutrack.edu",
    role: "student",
    title: "B.S. Computer Science · Sem 5",
    studentId: "stu-1",
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: "stu-1",
    rollNo: "ET-2401",
    name: "Maya Lin",
    email: "maya.lin@edutrack.edu",
    department: "Computer Science",
    semester: 5,
    gpa: 3.92,
    status: "Active",
    enrolledDate: "2024-09-02",
    advisor: "Prof. Marcus Reid",
  },
  {
    id: "stu-2",
    rollNo: "ET-2402",
    name: "Liam Patel",
    email: "liam.patel@edutrack.edu",
    department: "Data Science",
    semester: 5,
    gpa: 3.68,
    status: "Active",
    enrolledDate: "2024-09-02",
    advisor: "Dr. Priya Nair",
  },
  {
    id: "stu-3",
    rollNo: "ET-2403",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@edutrack.edu",
    department: "Software Engineering",
    semester: 4,
    gpa: 3.84,
    status: "Active",
    enrolledDate: "2025-01-14",
    advisor: "Prof. Marcus Reid",
  },
  {
    id: "stu-4",
    rollNo: "ET-2404",
    name: "Noah Brooks",
    email: "noah.brooks@edutrack.edu",
    department: "Computer Science",
    semester: 6,
    gpa: 3.12,
    status: "Probation",
    enrolledDate: "2023-09-04",
    advisor: "Dr. Hannah Cole",
  },
  {
    id: "stu-5",
    rollNo: "ET-2405",
    name: "Amara Okafor",
    email: "amara.okafor@edutrack.edu",
    department: "Data Science",
    semester: 5,
    gpa: 3.76,
    status: "Active",
    enrolledDate: "2024-09-02",
    advisor: "Dr. Priya Nair",
  },
  {
    id: "stu-6",
    rollNo: "ET-2406",
    name: "Ethan Kim",
    email: "ethan.kim@edutrack.edu",
    department: "Electrical Engineering",
    semester: 3,
    gpa: 3.55,
    status: "Active",
    enrolledDate: "2025-09-01",
    advisor: "Prof. David Grant",
  },
  {
    id: "stu-7",
    rollNo: "ET-2407",
    name: "Chloe Tremblay",
    email: "chloe.tremblay@edutrack.edu",
    department: "Software Engineering",
    semester: 5,
    gpa: 3.89,
    status: "Active",
    enrolledDate: "2024-09-02",
    advisor: "Prof. Marcus Reid",
  },
  {
    id: "stu-8",
    rollNo: "ET-2408",
    name: "Arjun Mehta",
    email: "arjun.mehta@edutrack.edu",
    department: "Computer Science",
    semester: 4,
    gpa: 3.41,
    status: "On Leave",
    enrolledDate: "2025-01-14",
    advisor: "Dr. Hannah Cole",
  },
  {
    id: "stu-9",
    rollNo: "ET-2409",
    name: "Zara Hassan",
    email: "zara.hassan@edutrack.edu",
    department: "Data Science",
    semester: 6,
    gpa: 3.95,
    status: "Active",
    enrolledDate: "2023-09-04",
    advisor: "Dr. Priya Nair",
  },
  {
    id: "stu-10",
    rollNo: "ET-2410",
    name: "Lucas Weber",
    email: "lucas.weber@edutrack.edu",
    department: "Electrical Engineering",
    semester: 4,
    gpa: 3.29,
    status: "Active",
    enrolledDate: "2025-01-14",
    advisor: "Prof. David Grant",
  },
  {
    id: "stu-11",
    rollNo: "ET-2411",
    name: "Nadia Chen",
    email: "nadia.chen@edutrack.edu",
    department: "Software Engineering",
    semester: 6,
    gpa: 3.87,
    status: "Active",
    enrolledDate: "2023-09-04",
    advisor: "Prof. Marcus Reid",
  },
  {
    id: "stu-12",
    rollNo: "ET-2412",
    name: "Samuel Osei",
    email: "samuel.osei@edutrack.edu",
    department: "Computer Science",
    semester: 3,
    gpa: 3.63,
    status: "Active",
    enrolledDate: "2025-09-01",
    advisor: "Dr. Hannah Cole",
  },
];

const SESSION_DATES = [
  "2026-10-30",
  "2026-11-02",
  "2026-11-04",
  "2026-11-06",
  "2026-11-08",
  "2026-11-10",
  "2026-11-12",
  "2026-11-14",
  "2026-11-16",
  "2026-11-18",
];

function buildInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  SESSION_DATES.forEach((date, dIdx) => {
    const course = COURSES[dIdx % COURSES.length];
    INITIAL_STUDENTS.forEach((student, sIdx) => {
      let status: AttendanceRecord["status"] = "Present";
      if (student.id === "stu-4" && (dIdx === 1 || dIdx === 4 || dIdx === 7)) {
        status = "Absent";
      } else if (student.id === "stu-8" && dIdx >= 7) {
        status = "Absent";
      } else if ((dIdx + sIdx) % 13 === 0) {
        status = "Absent";
      } else if ((dIdx + sIdx) % 10 === 0) {
        status = "Late";
      }
      records.push({
        id: `att-${date}-${student.id}`,
        date,
        course,
        studentId: student.id,
        status,
      });
    });
  });
  return records;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    title: "Graph Traversal & Shortest Path Lab",
    course: COURSES[0],
    dueDate: "2026-11-12",
    maxMarks: 100,
    description:
      "Implement Dijkstra and Bellman-Ford algorithms in TypeScript or Python, benchmark runtime complexity across sparse and dense graphs, and document edge cases.",
    createdAt: "2026-11-01",
  },
  {
    id: "asg-2",
    title: "Relational Normalization & Indexing Audit",
    course: COURSES[1],
    dueDate: "2026-11-16",
    maxMarks: 50,
    description:
      "Normalize an unindexed university enrollment schema up to BCNF and design composite B-Tree indexes to optimize reporting queries.",
    createdAt: "2026-11-03",
  },
  {
    id: "asg-3",
    title: "Linear vs. Tree Ensemble Classification",
    course: COURSES[2],
    dueDate: "2026-11-22",
    maxMarks: 100,
    description:
      "Train logistic regression and gradient-boosted trees on a student retention dataset, compare ROC-AUC, and interpret top feature importances.",
    createdAt: "2026-11-08",
  },
  {
    id: "asg-4",
    title: "Event-Driven Microservice Design Spec",
    course: COURSES[3],
    dueDate: "2026-11-26",
    maxMarks: 100,
    description:
      "Draft an architectural decision record (ADR) detailing idempotency keys, dead-letter queues, and eventual consistency trade-offs.",
    createdAt: "2026-11-10",
  },
  {
    id: "asg-5",
    title: "Dynamic Programming Problem Set",
    course: COURSES[0],
    dueDate: "2026-11-29",
    maxMarks: 50,
    description:
      "Solve four optimization problems using both memoized top-down recursion and bottom-up tabulation with space optimization.",
    createdAt: "2026-11-14",
  },
  {
    id: "asg-6",
    title: "Query Execution Plan Optimization Lab",
    course: COURSES[1],
    dueDate: "2026-12-03",
    maxMarks: 100,
    description:
      "Analyze EXPLAIN ANALYZE outputs across multi-table analytical queries and eliminate sequential scans with covering indexes.",
    createdAt: "2026-11-17",
  },
];

function buildInitialMarks(): MarkEntry[] {
  const baseScores: Record<string, number[]> = {
    "stu-1": [96, 48, 93, 94, 47, 95],
    "stu-2": [86, 44, 91, 84, 42, 88],
    "stu-3": [91, 46, 88, 92, 45, 90],
    "stu-4": [68, 34, 71, 69, 32, 0],
    "stu-5": [89, 45, 94, 87, 44, 91],
    "stu-6": [82, 41, 79, 81, 39, 83],
    "stu-7": [94, 47, 90, 95, 46, 93],
    "stu-8": [76, 39, 74, 0, 0, 0],
    "stu-9": [98, 49, 96, 97, 48, 97],
    "stu-10": [79, 38, 82, 77, 37, 80],
    "stu-11": [92, 46, 89, 91, 45, 92],
    "stu-12": [85, 42, 84, 86, 41, 84],
  };

  const entries: MarkEntry[] = [];
  INITIAL_STUDENTS.forEach((student) => {
    const scores = baseScores[student.id] || [80, 40, 80, 80, 40, 80];
    INITIAL_ASSIGNMENTS.forEach((asg, idx) => {
      const score = scores[idx];
      if (score > 0) {
        entries.push({
          assignmentId: asg.id,
          studentId: student.id,
          score,
          feedback:
            score / asg.maxMarks >= 0.9
              ? "Strong analytical rigor and clear documentation."
              : score / asg.maxMarks >= 0.78
                ? "Solid implementation; review edge-case test coverage."
                : "Needs deeper complexity analysis and structural refinement.",
          updatedAt: "2026-11-18",
        });
      }
    });
  });
  return entries;
}

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-1",
    timestamp: "2026-11-18 · 16:40",
    actor: "Prof. Marcus Reid",
    action: "Published grades for Relational Normalization & Indexing Audit",
    category: "marks",
  },
  {
    id: "act-2",
    timestamp: "2026-11-18 · 11:15",
    actor: "Prof. Marcus Reid",
    action: "Recorded attendance for SE-220 Software Architecture (92% present)",
    category: "attendance",
  },
  {
    id: "act-3",
    timestamp: "2026-11-17 · 15:05",
    actor: "Dr. Elena Vance",
    action: "Published Query Execution Plan Optimization Lab (100 pts)",
    category: "assignment",
  },
  {
    id: "act-4",
    timestamp: "2026-11-16 · 14:20",
    actor: "Dr. Elena Vance",
    action: "Created assignment Dynamic Programming Problem Set (50 pts)",
    category: "assignment",
  },
  {
    id: "act-5",
    timestamp: "2026-11-15 · 09:50",
    actor: "Dr. Elena Vance",
    action: "Updated academic standing review for Noah Brooks",
    category: "student",
  },
];

export const INITIAL_STATE: EduTrackState = {
  students: INITIAL_STUDENTS,
  attendance: buildInitialAttendance(),
  assignments: INITIAL_ASSIGNMENTS,
  marks: buildInitialMarks(),
  activities: INITIAL_ACTIVITIES,
};

export const PROMPT_LAB_TEMPLATES: PromptLabTemplate[] = [
  {
    id: "zero-shot",
    label: "Zero-Shot Prompting",
    summary:
      "Instruct the model directly with zero examples. Clear constraints, audience level, and output structure dramatically outperform vague one-liners.",
    whenToUse:
      "Fast conceptual explanations, definitions, checklists, and straightforward summaries where formatting rules keep quality high.",
    keyUpgrades: [
      "Specifies target audience (sophomore CS student)",
      "Defines exact output sections (Intuition, Complexity, Pitfall)",
      "Caps length to avoid rambling",
    ],
    basicPrompt: "Explain Dijkstra's algorithm.",
    improvedPrompt:
      "Explain Dijkstra's shortest path algorithm to an undergraduate computer science student.\n\nStructure your response into 3 concise sections:\n1. Core Intuition (under 60 words using a road-map analogy)\n2. Step-by-Step Priority Queue Walkthrough on a 4-node weighted graph\n3. Time Complexity & Critical Limitation (why negative edge weights break it)\n\nKeep the entire explanation under 240 words.",
  },
  {
    id: "few-shot",
    label: "Few-Shot Prompting",
    summary:
      "Provide 2–3 input/output demonstrations so the model mirrors your exact grading rubric tone, structure, and brevity without guesswork.",
    whenToUse:
      "Standardized rubric feedback, structured quiz generation, classification, or consistent institutional tone.",
    keyUpgrades: [
      "Provides two calibrated grading feedback examples",
      "Enforces Praise + Actionable Next Step pattern",
      "Prevents generic filler commentary",
    ],
    basicPrompt:
      "Write assignment feedback for a student who got 74/100 on database normalization because they missed transitive dependencies in 3NF.",
    improvedPrompt:
      "Generate concise faculty grading feedback matching the exact format and constructive tone of these examples:\n\nExample 1:\nSubmission: Graph Lab (94/100) — Clean BFS/DFS, minor memory overhead on adjacency matrix.\nFeedback: [Strength] Clean traversal invariants and readable recursion. [Next Step] Switch dense matrices to adjacency lists for sparse graphs to trim memory from O(V^2) to O(V+E).\n\nExample 2:\nSubmission: SQL Tuning (81/100) — Correct joins, missing composite index on foreign key.\nFeedback: [Strength] Accurate multi-table join logic and clean grouping. [Next Step] Add a composite index on (student_id, term_id) to eliminate full-table scans on large cohorts.\n\nNow generate feedback for:\nSubmission: Relational Normalization Audit (74/100) — 1NF and 2NF handled well, missed transitive dependencies required for 3NF.\nFeedback:",
  },
  {
    id: "role-based",
    label: "Role-Based Prompting",
    summary:
      "Assign an explicit expert persona and pedagogical mission via system instruction so the response adopts domain-appropriate rigor and Socratic guidance.",
    whenToUse:
      "Tutoring, code reviews, study coaching, and multi-perspective academic advising.",
    keyUpgrades: [
      "Sets Senior Systems Architect & Academic Mentor persona",
      "Forbids giving away direct homework solutions",
      "Guides student with diagnostic questions and tradeoffs",
    ],
    systemInstruction:
      "You are a Senior Software Architecture Professor and Socratic Mentor. Never write final graded code or complete essays directly; instead guide students through architectural tradeoffs, failure modes, and design checklists.",
    basicPrompt:
      "Help me with my event-driven microservice assignment on idempotency and dead-letter queues.",
    improvedPrompt:
      "I am drafting an Architectural Decision Record (ADR) for an enrollment billing service that handles duplicate webhook retries and occasional consumer crashes.\n\nAs my architecture mentor:\n1. Identify the 2 biggest failure risks in naive message consumption.\n2. Walk me through how idempotency keys and dead-letter queues (DLQs) mitigate them.\n3. Ask me 2 sharp design questions I must answer in my ADR before submitting.",
  },
  {
    id: "context-based",
    label: "Context-Based Prompting",
    summary:
      "Ground the prompt in real student metrics, course syllabus constraints, and upcoming deadlines so the AI produces tailored, actionable schedules.",
    whenToUse:
      "Personalized study plans, academic intervention planning, and assignment breakdowns tied to real student records.",
    keyUpgrades: [
      "Injects actual student attendance (88%), recent scores, and deadline",
      "Specifies available evening study hours",
      "Produces a realistic day-by-day execution table",
    ],
    basicPrompt: "Make me a study plan for my exams and assignments next week.",
    improvedPrompt:
      "Create a focused 5-day evening study plan (Monday to Friday, 90 minutes/evening) using the student context below:\n\n- Student: Maya Lin (Computer Science, Sem 5)\n- Recent Performance: Algorithms Lab 96%, Database Audit 96%, ML Assignment pending\n- Upcoming Deadlines:\n  1. AI-210 Linear vs. Tree Ensemble Classification (Due Nov 22, 100 pts)\n  2. SE-220 Event-Driven Microservice ADR (Due Nov 26, 100 pts)\n- Constraint: Needs extra practice on ROC-AUC interpretation and idempotency failure scenarios.\n\nOutput a compact day-by-day table with Topic, Concrete Deliverable, and 15-minute Self-Test Check.",
  },
];
