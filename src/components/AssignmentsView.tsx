import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus, Save, Trash2, X } from "lucide-react";
import { COURSES } from "../data/seedData";
import type { Assignment, DemoUser, EduTrackState, MarkEntry } from "../types";
import { getLetterGrade } from "../utils/calculations";

interface AssignmentsViewProps {
  state: EduTrackState;
  user: DemoUser;
  onCreateAssignment: (asg: Omit<Assignment, "id" | "createdAt">) => void;
  onDeleteAssignment: (id: string) => void;
  onSaveMarks: (assignmentId: string, entries: MarkEntry[]) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  state,
  user,
  onCreateAssignment,
  onDeleteAssignment,
  onSaveMarks,
}) => {
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [selectedAsgId, setSelectedAsgId] = useState<string>(
    state.assignments[0]?.id || ""
  );
  const [createOpen, setCreateOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState(COURSES[0]);
  const [newDueDate, setNewDueDate] = useState("2026-12-05");
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newDesc, setNewDesc] = useState("");

  const [draftMarks, setDraftMarks] = useState<
    Record<string, { score: string; feedback: string }>
  >({});
  const [savedNotice, setSavedNotice] = useState(false);

  const canEdit = user.role === "admin" || user.role === "faculty";
  const isStudent = user.role === "student" && user.studentId;

  const filteredAssignments = useMemo(() => {
    return state.assignments.filter(
      (a) => courseFilter === "ALL" || a.course === courseFilter
    );
  }, [state.assignments, courseFilter]);

  const selectedAsg =
    state.assignments.find((a) => a.id === selectedAsgId) ||
    filteredAssignments[0] ||
    null;

  useEffect(() => {
    if (!selectedAsg) return;
    const nextDraft: Record<string, { score: string; feedback: string }> = {};
    state.students.forEach((stu) => {
      const existing = state.marks.find(
        (m) => m.assignmentId === selectedAsg.id && m.studentId === stu.id
      );
      nextDraft[stu.id] = {
        score: existing ? String(existing.score) : "",
        feedback: existing?.feedback || "",
      };
    });
    setDraftMarks(nextDraft);
    setSavedNotice(false);
  }, [selectedAsg?.id, state.marks, state.students]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newMaxMarks <= 0) return;
    onCreateAssignment({
      title: newTitle.trim(),
      course: newCourse,
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
      description:
        newDesc.trim() ||
        "Complete the coursework deliverables by the due date.",
    });
    setNewTitle("");
    setNewDesc("");
    setCreateOpen(false);
  };

  const handleSaveMarks = () => {
    if (!selectedAsg) return;
    const today = new Date().toISOString().slice(0, 10);
    const entries: MarkEntry[] = [];

    Object.entries(draftMarks).forEach(([studentId, val]) => {
      if (val.score.trim() === "") return;
      const numeric = Math.max(
        0,
        Math.min(selectedAsg.maxMarks, Number(val.score) || 0)
      );
      entries.push({
        assignmentId: selectedAsg.id,
        studentId,
        score: numeric,
        feedback: val.feedback.trim(),
        updatedAt: today,
      });
    });

    onSaveMarks(selectedAsg.id, entries);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <ClipboardList className="w-4 h-4" />
            <span>Coursework & Evaluation</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Assignments & Marks
          </h1>
          <p className="text-sm text-slate-400">
            {isStudent
              ? "Review assignment briefs, scores, and instructor feedback"
              : "Publish coursework assignments and record student gradebook scores"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Filter assignments by course"
            className="px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Courses</option>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {canEdit && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Assignments Selector */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-3 space-y-2">
          {filteredAssignments.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">
              No assignments in this course yet.
            </div>
          ) : (
            filteredAssignments.map((asg) => {
              const active = selectedAsg?.id === asg.id;
              const gradedCount = state.marks.filter(
                (m) => m.assignmentId === asg.id
              ).length;
              const pct = Math.round(
                (gradedCount / Math.max(1, state.students.length)) * 100
              );

              return (
                <button
                  key={asg.id}
                  type="button"
                  onClick={() => setSelectedAsgId(asg.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    active
                      ? "bg-gradient-to-r from-blue-600/20 to-violet-600/12 border-blue-400/45 shadow-sm"
                      : "bg-[#090f24]/60 border-slate-800/70 hover:border-indigo-400/30 hover:bg-[#0c1430]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm text-white leading-snug">
                      {asg.title}
                    </div>
                    <span className="font-mono tabular-nums text-xs text-blue-300 shrink-0">
                      {asg.maxMarks} pts
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {asg.course}
                  </div>
                  {!isStudent && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                        <span>Due {asg.dueDate}</span>
                        <span>
                          {gradedCount}/{state.students.length} graded
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Gradebook Panel */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-5">
          {!selectedAsg ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Select an assignment to view details and marks.
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="text-xs text-blue-400 font-medium">
                    {selectedAsg.course} · Due {selectedAsg.dueDate} · Max{" "}
                    {selectedAsg.maxMarks} marks
                  </div>
                  <h2 className="font-display text-xl font-semibold text-white">
                    {selectedAsg.title}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedAsg.description}
                  </p>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveMarks}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-blue-600/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savedNotice ? "Marks Saved" : "Save Marks"}</span>
                    </button>
                    {user.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(selectedAsg.id)}
                        title="Delete assignment"
                        aria-label="Delete assignment"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isStudent && user.studentId ? (
                (() => {
                  const myMark = state.marks.find(
                    (m) =>
                      m.assignmentId === selectedAsg.id &&
                      m.studentId === user.studentId
                  );
                  const pct = myMark
                    ? Math.round((myMark.score / selectedAsg.maxMarks) * 100)
                    : null;

                  return (
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[#080d20] border border-slate-800">
                          <div className="text-xs text-slate-400">Your Score</div>
                          <div className="font-mono tabular-nums text-xl font-semibold text-white mt-1">
                            {myMark
                              ? `${myMark.score}/${selectedAsg.maxMarks}`
                              : "Pending"}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#080d20] border border-slate-800">
                          <div className="text-xs text-slate-400">Percentage</div>
                          <div className="font-mono tabular-nums text-xl font-semibold text-blue-400 mt-1">
                            {pct !== null ? `${pct}%` : "—"}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#080d20] border border-slate-800">
                          <div className="text-xs text-slate-400">Grade</div>
                          <div className="font-mono text-xl font-semibold text-violet-400 mt-1">
                            {pct !== null ? getLetterGrade(pct) : "—"}
                          </div>
                        </div>
                      </div>
                      {myMark?.feedback && (
                        <div className="p-4 rounded-xl bg-[#080d20] border border-slate-800">
                          <div className="text-xs font-medium text-slate-400 mb-1">
                            Instructor Feedback
                          </div>
                          <p className="text-sm text-slate-200">
                            {myMark.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-400/15 text-[11px] font-medium text-slate-400">
                        <th className="py-3 px-3">Student</th>
                        <th className="py-3 px-3 w-28">
                          Score (/{selectedAsg.maxMarks})
                        </th>
                        <th className="py-3 px-3 w-24 text-right">Grade</th>
                        <th className="py-3 px-3">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-sm">
                      {state.students.map((stu) => {
                        const draft = draftMarks[stu.id] || {
                          score: "",
                          feedback: "",
                        };
                        const num = Number(draft.score);
                        const hasScore =
                          draft.score.trim() !== "" && !Number.isNaN(num);
                        const pct = hasScore
                          ? Math.round((num / selectedAsg.maxMarks) * 100)
                          : null;

                        return (
                          <tr
                            key={stu.id}
                            className="hover:bg-indigo-500/[0.04]"
                          >
                            <td className="py-3 px-3">
                              <div className="font-medium text-white">
                                {stu.name}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400">
                                {stu.rollNo}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                min={0}
                                max={selectedAsg.maxMarks}
                                disabled={!canEdit}
                                value={draft.score}
                                placeholder="—"
                                onChange={(e) =>
                                  setDraftMarks((prev) => ({
                                    ...prev,
                                    [stu.id]: {
                                      ...draft,
                                      score: e.target.value,
                                    },
                                  }))
                                }
                                className="w-24 px-2.5 py-1.5 rounded-lg bg-[#080d20] border border-slate-700 text-sm font-mono tabular-nums text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-xs text-slate-300">
                              {pct !== null
                                ? `${pct}% · ${getLetterGrade(pct)}`
                                : "—"}
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                disabled={!canEdit}
                                value={draft.feedback}
                                placeholder="Add grading note..."
                                onChange={(e) =>
                                  setDraftMarks((prev) => ({
                                    ...prev,
                                    [stu.id]: {
                                      ...draft,
                                      feedback: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-[#080d20] border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Create Assignment
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., B-Tree Index Performance Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    required
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(Number(e.target.value) || 100)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Instructions / Rubric Summary
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe deliverables and grading criteria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-xs font-medium text-white cursor-pointer"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
