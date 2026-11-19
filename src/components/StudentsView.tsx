import React, { useMemo, useState } from "react";
import {
  Eye,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { DEPARTMENTS } from "../data/seedData";
import type {
  DemoUser,
  EduTrackState,
  Student,
  StudentStatus,
} from "../types";
import {
  calculateAttendancePercentage,
  calculateStudentAverageScore,
  getLetterGrade,
} from "../utils/calculations";

interface StudentsViewProps {
  state: EduTrackState;
  user: DemoUser;
  onAddStudent: (student: Omit<Student, "id">) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

const EMPTY_FORM: Omit<Student, "id"> = {
  rollNo: "",
  name: "",
  email: "",
  department: DEPARTMENTS[0],
  semester: 1,
  gpa: 3.5,
  status: "Active",
  enrolledDate: "2026-09-01",
  advisor: "Prof. Marcus Reid",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  state,
  user,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, "id">>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const canManage = user.role === "admin" || user.role === "faculty";
  const canDelete = user.role === "admin";

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.students.filter((s) => {
      if (deptFilter !== "ALL" && s.department !== deptFilter) return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.rollNo.toLowerCase().includes(q) &&
        !s.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [state.students, search, deptFilter, statusFilter]);

  const meanGpa = useMemo(() => {
    if (state.students.length === 0) return "0.00";
    const total = state.students.reduce((sum, s) => sum + s.gpa, 0);
    return (total / state.students.length).toFixed(2);
  }, [state.students]);

  const activeCount = state.students.filter((s) => s.status === "Active").length;

  const openAddModal = () => {
    const nextNum = 2401 + state.students.length;
    setEditingStudent(null);
    setFormData({
      ...EMPTY_FORM,
      rollNo: `ET-${nextNum}`,
      enrolledDate: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setFormOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    const { id: _id, ...rest } = student;
    setFormData(rest);
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim() || !formData.email.trim()) {
      setFormError("Roll number, full name, and email are required.");
      return;
    }
    if (formData.gpa < 0 || formData.gpa > 4) {
      setFormError("GPA must be between 0.00 and 4.00.");
      return;
    }

    if (editingStudent) {
      onUpdateStudent({ id: editingStudent.id, ...formData });
    } else {
      onAddStudent(formData);
    }
    setFormOpen(false);
  };

  const statusColor = (status: StudentStatus) => {
    if (status === "Active") return "text-emerald-400";
    if (status === "Probation") return "text-rose-400";
    return "text-amber-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <Users className="w-4 h-4" />
            <span>Cohort Directory</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Student Management
          </h1>
          <p className="text-sm text-slate-400">
            {state.students.length} enrolled · {activeCount} active standing · Cohort mean GPA{" "}
            <span className="font-mono text-slate-200">{meanGpa}</span>
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter by department"
          className="px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Probation">Probation</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-300">
              No student records match your current search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDeptFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-indigo-400/15 bg-[#090f24]/60 text-[11px] font-medium text-slate-400">
                  <th className="py-3.5 px-5">Roll No</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-right">Sem</th>
                  <th className="py-3.5 px-4 text-right">GPA</th>
                  <th className="py-3.5 px-4 text-right">Attendance</th>
                  <th className="py-3.5 px-4 text-right">Avg Marks</th>
                  <th className="py-3.5 px-4">Standing</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredStudents.map((stu) => {
                  const attPct = calculateAttendancePercentage(
                    state.attendance,
                    stu.id
                  );
                  const avgScore = calculateStudentAverageScore(
                    stu.id,
                    state.assignments,
                    state.marks
                  );
                  const isSelf = user.studentId === stu.id;

                  return (
                    <tr
                      key={stu.id}
                      className={`transition-colors hover:bg-indigo-500/[0.06] ${
                        isSelf ? "bg-blue-500/[0.08]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono tabular-nums text-xs text-blue-300 whitespace-nowrap">
                        {stu.rollNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-indigo-400/25 flex items-center justify-center text-xs font-semibold text-blue-200 shrink-0">
                            {initials(stu.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">
                              {stu.name}
                              {isSelf && (
                                <span className="ml-2 text-[11px] text-blue-400 font-normal">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {stu.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {stu.department}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                        {stu.semester}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-white font-medium">
                        {stu.gpa.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                        {attPct}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                        {avgScore !== null ? `${avgScore}%` : "—"}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-xs font-medium whitespace-nowrap ${statusColor(
                          stu.status
                        )}`}
                      >
                        {stu.status}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(stu)}
                            title="View student record"
                            aria-label={`View ${stu.name}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => openEditModal(stu)}
                              title="Edit student"
                              aria-label={`Edit ${stu.name}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(stu)}
                              title="Delete student"
                              aria-label={`Delete ${stu.name}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                {editingStudent ? "Edit Student Record" : "Enroll New Student"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNo: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        semester: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    value={formData.gpa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gpa: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StudentStatus,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Faculty Advisor
                </label>
                <input
                  type="text"
                  value={formData.advisor}
                  onChange={(e) =>
                    setFormData({ ...formData, advisor: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white cursor-pointer"
                >
                  {editingStudent ? "Save Changes" : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Record Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-600/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-mono text-xs text-blue-400">
                    {viewingStudent.rollNo} · {viewingStudent.status}
                  </div>
                  <h2 className="font-display text-xl font-semibold text-white mt-0.5">
                    {viewingStudent.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {viewingStudent.email} · {viewingStudent.department} · Semester{" "}
                    {viewingStudent.semester}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                aria-label="Close record"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-slate-800/80">
              <div>
                <div className="text-xs text-slate-400">GPA</div>
                <div className="font-mono tabular-nums text-lg font-semibold text-white">
                  {viewingStudent.gpa.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Attendance</div>
                <div className="font-mono tabular-nums text-lg font-semibold text-blue-400">
                  {calculateAttendancePercentage(
                    state.attendance,
                    viewingStudent.id
                  )}
                  %
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Advisor</div>
                <div className="text-sm font-medium text-slate-200 truncate mt-1">
                  {viewingStudent.advisor}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-300">
                Assignment Marks Breakdown
              </h3>
              <div className="divide-y divide-slate-800/80">
                {state.assignments.map((asg) => {
                  const mark = state.marks.find(
                    (m) =>
                      m.assignmentId === asg.id &&
                      m.studentId === viewingStudent.id
                  );
                  const pct = mark
                    ? Math.round((mark.score / asg.maxMarks) * 100)
                    : null;

                  return (
                    <div
                      key={asg.id}
                      className="py-2.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">
                          {asg.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {asg.course}
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums text-xs shrink-0">
                        {mark ? (
                          <>
                            <span className="text-white font-semibold">
                              {mark.score}/{asg.maxMarks}
                            </span>
                            <span className="text-slate-400 ml-2">
                              {pct}% ({getLetterGrade(pct ?? 0)})
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500">Not graded</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="font-display text-lg font-semibold text-white">
              Remove Student Record
            </h2>
            <p className="text-sm text-slate-300">
              Delete{" "}
              <span className="font-medium text-white">
                {deletingStudent.name}
              </span>{" "}
              ({deletingStudent.rollNo})? Associated attendance and mark entries
              will also be removed.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
