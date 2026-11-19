import React from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DemoUser, EduTrackState, NavTab } from "../types";
import {
  calculateAttendancePercentage,
  calculateOverallAverageScore,
  calculateStudentAverageScore,
  getAttendanceTrendSeries,
  getCoursePerformanceSeries,
  getDepartmentCounts,
} from "../utils/calculations";
import {
  AttendanceTrendChart,
  CoursePerformanceChart,
  DepartmentDonutChart,
} from "./Charts";

interface DashboardViewProps {
  state: EduTrackState;
  user: DemoUser;
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  user,
  onNavigate,
}) => {
  const isStudent = user.role === "student" && user.studentId;
  const studentObj = isStudent
    ? state.students.find((s) => s.id === user.studentId)
    : undefined;

  const relevantAttendance = isStudent
    ? state.attendance.filter((r) => r.studentId === user.studentId)
    : state.attendance;

  const overallAttendance = calculateAttendancePercentage(
    state.attendance,
    isStudent ? user.studentId : undefined
  );
  const activeStudentsCount = state.students.filter(
    (s) => s.status === "Active"
  ).length;
  const meanScore =
    isStudent && user.studentId
      ? calculateStudentAverageScore(
          user.studentId,
          state.assignments,
          state.marks
        ) ?? 0
      : calculateOverallAverageScore(state.assignments, state.marks);

  const presentTotal = relevantAttendance.filter(
    (r) => r.status === "Present"
  ).length;
  const lateTotal = relevantAttendance.filter((r) => r.status === "Late").length;
  const absentTotal = relevantAttendance.filter(
    (r) => r.status === "Absent"
  ).length;
  const totalAttRecords = Math.max(1, relevantAttendance.length);

  const trendSeries = getAttendanceTrendSeries(relevantAttendance);
  const courseSeries = getCoursePerformanceSeries(
    state.assignments,
    isStudent
      ? state.marks.filter((m) => m.studentId === user.studentId)
      : state.marks
  );
  const deptBreakdown = getDepartmentCounts(state.students);

  const upcomingAssignments = [...state.assignments]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="space-y-1.5 relative">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <GraduationCap className="w-4 h-4" />
            <span>
              {isStudent ? "Student Academic Portal" : "Academic Operations"} · Fall Term 2026
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-300">
            {isStudent && studentObj
              ? `${studentObj.rollNo} · ${studentObj.department} · Semester ${studentObj.semester} · Advisor: ${studentObj.advisor}`
              : `Monitoring ${state.students.length} enrolled students across ${state.assignments.length} active assignments and 4 core courses.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
          {user.role !== "student" && (
            <button
              type="button"
              onClick={() => onNavigate("attendance")}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Take Attendance
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate("assistant")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white transition-all shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span>Open AI Assistant</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Premium KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isStudent ? "Cumulative GPA" : "Enrolled Students"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-3xl font-semibold text-white">
              {isStudent && studentObj
                ? studentObj.gpa.toFixed(2)
                : state.students.length}
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              {isStudent
                ? "Scale 4.00 · Honors standing"
                : `${activeStudentsCount} active · ${
                    state.students.length - activeStudentsCount
                  } leave or probation`}
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
              style={{
                width:
                  isStudent && studentObj
                    ? `${(studentObj.gpa / 4) * 100}%`
                    : `${(activeStudentsCount / Math.max(1, state.students.length)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Attendance Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center text-violet-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-3xl font-semibold text-white">
              {overallAttendance}%
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              {overallAttendance >= 85
                ? "Exceeds 85% institutional benchmark"
                : "Below 85% attendance target"}
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              style={{ width: `${Math.min(100, overallAttendance)}%` }}
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Active Assignments
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-400">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-3xl font-semibold text-white">
              {state.assignments.length}
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              {state.marks.length} graded submissions recorded
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (state.marks.length /
                      Math.max(1, state.assignments.length * state.students.length)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Mean Assessment Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-3xl font-semibold text-white">
              {meanScore}%
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              Normalized across all graded coursework
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              style={{ width: `${Math.min(100, meanScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Attendance Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily cohort attendance rate across the last {trendSeries.length} sessions
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("attendance")}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/25 text-xs font-medium text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Open Register
            </button>
          </div>
          <AttendanceTrendChart data={trendSeries} />
        </section>

        <section className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Course Performance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Average normalized score by course
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("assignments")}
              className="px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/25 text-xs font-medium text-violet-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Gradebook
            </button>
          </div>
          <CoursePerformanceChart data={courseSeries} />
        </section>
      </div>

      {/* Attendance Overview + Upcoming Assignments + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Attendance Overview & Cohort Split */}
        <section className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Attendance & Cohort Overview
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution of recorded attendance and department enrollment
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(presentTotal / totalAttRecords) * 100}%` }}
                title={`Present: ${presentTotal}`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(lateTotal / totalAttRecords) * 100}%` }}
                title={`Late: ${lateTotal}`}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(absentTotal / totalAttRecords) * 100}%` }}
                title={`Absent: ${absentTotal}`}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-300">
              <span className="text-emerald-400">{presentTotal} Present</span>
              <span className="text-amber-400">{lateTotal} Late</span>
              <span className="text-rose-400">{absentTotal} Absent</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <DepartmentDonutChart
              data={deptBreakdown}
              totalStudents={state.students.length}
            />
          </div>
        </section>

        {/* Upcoming Assignments */}
        <section className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Upcoming Assignments
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Next coursework deadlines
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("assignments")}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((asg) => (
              <div
                key={asg.id}
                onClick={() => onNavigate("assignments")}
                className="p-3.5 rounded-xl bg-[#0a1026]/65 border border-slate-800/80 hover:border-indigo-400/35 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-white leading-snug">
                    {asg.title}
                  </div>
                  <span className="font-mono tabular-nums text-xs text-blue-300 shrink-0">
                    {asg.maxMarks} pts
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="truncate">{asg.course}</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-300 shrink-0">
                    <Clock className="w-3 h-3 text-violet-400" />
                    {asg.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Recent Activities
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest academic & grading logs
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-800/80">
            {state.activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="text-sm text-slate-200 leading-snug">
                  {act.action}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {act.actor} · {act.timestamp}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
