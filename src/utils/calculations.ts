import type {
  Assignment,
  AttendanceRecord,
  MarkEntry,
  Student,
} from "../types";

export function calculateAttendancePercentage(
  records: AttendanceRecord[],
  studentId?: string
): number {
  const filtered = studentId
    ? records.filter((r) => r.studentId === studentId)
    : records;
  if (filtered.length === 0) return 0;

  // Present = 1, Late = 0.75, Absent = 0
  const points = filtered.reduce((acc, rec) => {
    if (rec.status === "Present") return acc + 1;
    if (rec.status === "Late") return acc + 0.75;
    return acc;
  }, 0);

  return Math.round((points / filtered.length) * 1000) / 10;
}

export function calculateStudentAverageScore(
  studentId: string,
  assignments: Assignment[],
  marks: MarkEntry[]
): number | null {
  const studentMarks = marks.filter((m) => m.studentId === studentId);
  if (studentMarks.length === 0) return null;

  let earned = 0;
  let possible = 0;
  studentMarks.forEach((m) => {
    const asg = assignments.find((a) => a.id === m.assignmentId);
    if (asg && asg.maxMarks > 0) {
      earned += m.score;
      possible += asg.maxMarks;
    }
  });

  if (possible === 0) return null;
  return Math.round((earned / possible) * 1000) / 10;
}

export function calculateOverallAverageScore(
  assignments: Assignment[],
  marks: MarkEntry[]
): number {
  if (marks.length === 0) return 0;
  let totalPct = 0;
  let count = 0;
  marks.forEach((m) => {
    const asg = assignments.find((a) => a.id === m.assignmentId);
    if (asg && asg.maxMarks > 0) {
      totalPct += (m.score / asg.maxMarks) * 100;
      count += 1;
    }
  });
  return count === 0 ? 0 : Math.round((totalPct / count) * 10) / 10;
}

export function getLetterGrade(pct: number): string {
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 75) return "C+";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

export function getAttendanceTrendSeries(
  records: AttendanceRecord[]
): Array<{ date: string; label: string; rate: number; presentCount: number; total: number }> {
  const byDate = new Map<string, AttendanceRecord[]>();
  records.forEach((r) => {
    const existing = byDate.get(r.date) || [];
    existing.push(r);
    byDate.set(r.date, existing);
  });

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([date, recs]) => {
      const presentCount = recs.filter(
        (r) => r.status === "Present" || r.status === "Late"
      ).length;
      const rate = calculateAttendancePercentage(recs);
      const parts = date.split("-");
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : date;
      return {
        date,
        label,
        rate,
        presentCount,
        total: recs.length,
      };
    });
}

export function getCoursePerformanceSeries(
  assignments: Assignment[],
  marks: MarkEntry[]
): Array<{ courseCode: string; courseName: string; average: number; submissions: number }> {
  const byCourse = new Map<string, { earnedPctSum: number; count: number }>();

  assignments.forEach((asg) => {
    const asgMarks = marks.filter((m) => m.assignmentId === asg.id);
    asgMarks.forEach((m) => {
      if (asg.maxMarks > 0) {
        const entry = byCourse.get(asg.course) || { earnedPctSum: 0, count: 0 };
        entry.earnedPctSum += (m.score / asg.maxMarks) * 100;
        entry.count += 1;
        byCourse.set(asg.course, entry);
      }
    });
  });

  return Array.from(byCourse.entries()).map(([course, val]) => {
    const [code, ...rest] = course.split(" ");
    return {
      courseCode: code,
      courseName: rest.join(" ") || course,
      average: val.count > 0 ? Math.round((val.earnedPctSum / val.count) * 10) / 10 : 0,
      submissions: val.count,
    };
  });
}

export function getDepartmentCounts(
  students: Student[]
): Array<{ department: string; count: number; avgGpa: number }> {
  const map = new Map<string, { count: number; gpaSum: number }>();
  students.forEach((s) => {
    const cur = map.get(s.department) || { count: 0, gpaSum: 0 };
    cur.count += 1;
    cur.gpaSum += s.gpa;
    map.set(s.department, cur);
  });
  return Array.from(map.entries()).map(([department, v]) => ({
    department,
    count: v.count,
    avgGpa: Math.round((v.gpaSum / v.count) * 100) / 100,
  }));
}
