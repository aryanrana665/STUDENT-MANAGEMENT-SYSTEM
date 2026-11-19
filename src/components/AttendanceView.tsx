import React, { useMemo, useState } from "react";
import { CalendarCheck, CheckCheck, Search } from "lucide-react";
import { COURSES } from "../data/seedData";
import type {
  AttendanceRecord,
  AttendanceStatus,
  DemoUser,
  EduTrackState,
} from "../types";
import { calculateAttendancePercentage } from "../utils/calculations";

interface AttendanceViewProps {
  state: EduTrackState;
  user: DemoUser;
  onSetAttendance: (
    date: string,
    course: string,
    studentId: string,
    status: AttendanceStatus
  ) => void;
  onMarkAllPresent: (date: string, course: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  state,
  user,
  onSetAttendance,
  onMarkAllPresent,
}) => {
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(state.attendance.map((r) => r.date))).sort(
      (a, b) => b.localeCompare(a)
    );
    return dates;
  }, [state.attendance]);

  const [selectedDate, setSelectedDate] = useState<string>(
    uniqueDates[0] || new Date().toISOString().slice(0, 10)
  );
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSES[0]);
  const [search, setSearch] = useState("");

  const isStudent = user.role === "student" && user.studentId;
  const canEdit = user.role === "admin" || user.role === "faculty";

  const sessionRecords = useMemo(() => {
    return state.attendance.filter(
      (r) => r.date === selectedDate && r.course === selectedCourse
    );
  }, [state.attendance, selectedDate, selectedCourse]);

  const getStudentSessionStatus = (
    studentId: string
  ): AttendanceStatus | null => {
    const rec = sessionRecords.find((r) => r.studentId === studentId);
    if (rec) return rec.status;
    const dateRec = state.attendance.find(
      (r) => r.date === selectedDate && r.studentId === studentId
    );
    return dateRec ? dateRec.status : null;
  };

  const sessionStats = useMemo(() => {
    const relevant = sessionRecords.length
      ? sessionRecords
      : state.attendance.filter((r) => r.date === selectedDate);
    const present = relevant.filter((r) => r.status === "Present").length;
    const late = relevant.filter((r) => r.status === "Late").length;
    const absent = relevant.filter((r) => r.status === "Absent").length;
    const rate = calculateAttendancePercentage(relevant);
    return { present, late, absent, rate, total: relevant.length };
  }, [sessionRecords, state.attendance, selectedDate]);

  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.students.filter((s) => {
      if (isStudent && s.id !== user.studentId) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.rollNo.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [state.students, isStudent, user.studentId, search]);

  const studentPersonalHistory = useMemo(() => {
    if (!isStudent || !user.studentId) return [];
    return state.attendance
      .filter((r) => r.studentId === user.studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.attendance, isStudent, user.studentId]);

  if (isStudent && user.studentId) {
    const personalRate = calculateAttendancePercentage(
      state.attendance,
      user.studentId
    );
    const presentCount = studentPersonalHistory.filter(
      (r) => r.status === "Present"
    ).length;
    const lateCount = studentPersonalHistory.filter(
      (r) => r.status === "Late"
    ).length;
    const absentCount = studentPersonalHistory.filter(
      (r) => r.status === "Absent"
    ).length;

    return (
      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <CalendarCheck className="w-4 h-4" />
            <span>Personal Attendance</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white mt-1">
            My Attendance Record
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Cumulative attendance across all recorded sessions
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-slate-400">Overall Rate</div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-blue-400 mt-1">
              {personalRate}%
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-slate-400">Present</div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-emerald-400 mt-1">
              {presentCount}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-slate-400">Late</div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-amber-400 mt-1">
              {lateCount}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-slate-400">Absent</div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-rose-400 mt-1">
              {absentCount}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-400/15 bg-[#090f24]/60 text-[11px] font-medium text-slate-400">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {studentPersonalHistory.map((rec: AttendanceRecord) => (
                <tr key={rec.id} className="hover:bg-indigo-500/[0.05]">
                  <td className="py-3.5 px-5 font-mono tabular-nums text-xs text-slate-300">
                    {rec.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">{rec.course}</td>
                  <td
                    className={`py-3.5 px-5 text-right text-xs font-medium ${
                      rec.status === "Present"
                        ? "text-emerald-400"
                        : rec.status === "Late"
                          ? "text-amber-400"
                          : "text-rose-400"
                    }`}
                  >
                    {rec.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <CalendarCheck className="w-4 h-4" />
            <span>Session Tracking</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Attendance Register
          </h1>
          <p className="text-sm text-slate-400">
            Mark Present, Late, or Absent and monitor real-time attendance rates
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => onMarkAllPresent(selectedDate, selectedCourse)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        )}
      </div>

      {/* Controls & KPI Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="sm:w-44">
            <label className="block text-[11px] text-slate-400 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-[11px] text-slate-400 mb-1">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-52">
            <label className="block text-[11px] text-slate-400 mb-1">
              Filter Student
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or Roll No"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Session Attendance</div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-white mt-0.5">
              {sessionStats.total > 0 ? `${sessionStats.rate}%` : "Unmarked"}
            </div>
          </div>
          <div className="text-right text-xs font-mono tabular-nums space-y-0.5">
            <div className="text-emerald-400">{sessionStats.present} Present</div>
            <div className="text-amber-400">{sessionStats.late} Late</div>
            <div className="text-rose-400">{sessionStats.absent} Absent</div>
          </div>
        </div>
      </div>

      {/* Quick recent session dates */}
      {uniqueDates.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 shrink-0">
            Recent sessions:
          </span>
          {uniqueDates.slice(0, 10).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums transition-colors cursor-pointer shrink-0 ${
                selectedDate === d
                  ? "bg-blue-600/25 text-blue-300 border border-blue-400/45"
                  : "bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Attendance Roster Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-400/15 bg-[#090f24]/60 text-[11px] font-medium text-slate-400">
                <th className="py-3.5 px-5">Roll No</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-right">Cumulative Rate</th>
                <th className="py-3.5 px-5 text-right">
                  Status ({selectedDate})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {visibleStudents.map((stu) => {
                const curStatus = getStudentSessionStatus(stu.id);
                const cumulative = calculateAttendancePercentage(
                  state.attendance,
                  stu.id
                );

                return (
                  <tr
                    key={stu.id}
                    className="hover:bg-indigo-500/[0.05] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono tabular-nums text-xs text-blue-300">
                      {stu.rollNo}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {stu.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {stu.department}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono tabular-nums text-xs font-semibold ${
                        cumulative >= 85
                          ? "text-emerald-400"
                          : cumulative >= 75
                            ? "text-amber-400"
                            : "text-rose-400"
                      }`}
                    >
                      {cumulative}%
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#080d20] border border-slate-800">
                        {(
                          ["Present", "Late", "Absent"] as AttendanceStatus[]
                        ).map((st) => {
                          const active = curStatus === st;
                          const activeStyles =
                            st === "Present"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : st === "Late"
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-rose-600 text-white shadow-sm";

                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={!canEdit}
                              onClick={() =>
                                onSetAttendance(
                                  selectedDate,
                                  selectedCourse,
                                  stu.id,
                                  st
                                )
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                active
                                  ? activeStyles
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
