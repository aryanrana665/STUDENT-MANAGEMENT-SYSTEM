export type UserRole = "admin" | "faculty" | "student";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  studentId?: string;
}

export type StudentStatus = "Active" | "On Leave" | "Probation";

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  gpa: number;
  status: StudentStatus;
  enrolledDate: string;
  advisor: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Late";

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  course: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  createdAt: string;
}

export interface MarkEntry {
  assignmentId: string;
  studentId: string;
  score: number;
  feedback?: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: "student" | "attendance" | "assignment" | "marks" | "ai";
}

export type NavTab =
  | "dashboard"
  | "students"
  | "attendance"
  | "assignments"
  | "assistant"
  | "prompt-lab";

export type PromptTechniqueId =
  | "zero-shot"
  | "few-shot"
  | "role-based"
  | "context-based";

export interface PromptLabTemplate {
  id: PromptTechniqueId;
  label: string;
  summary: string;
  whenToUse: string;
  keyUpgrades: string[];
  basicPrompt: string;
  improvedPrompt: string;
  systemInstruction?: string;
}

export interface EduTrackState {
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  marks: MarkEntry[];
  activities: ActivityLog[];
}
