import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { DEMO_USERS } from "../data/seedData";
import type { DemoUser, Student, UserRole } from "../types";

interface LoginScreenProps {
  students: Student[];
  onLogin: (user: DemoUser) => void;
}

const ROLE_DETAILS: Record<
  UserRole,
  {
    badge: string;
    description: string;
    capabilities: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  admin: {
    badge: "Institution Administrator",
    description:
      "Full academic control across student cohorts, attendance registers, grading, and AI tools.",
    capabilities:
      "Add/Edit/Delete Students · Attendance · Assignments · AI & Prompt Lab",
    icon: ShieldCheck,
  },
  faculty: {
    badge: "Faculty & Lecturer",
    description:
      "Manage daily session attendance, publish assignments, grade marks, and test AI workflows.",
    capabilities:
      "Mark Attendance · Create Assignments · Grade Marks · AI Assistant",
    icon: UserCheck,
  },
  student: {
    badge: "Student Portal",
    description:
      "Track personal attendance, review assignment marks, and study with the AI Academic Assistant.",
    capabilities:
      "Personal Attendance · Grades & Feedback · AI Tutor · Prompt Lab",
    icon: BookOpen,
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  students,
  onLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || "stu-1"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUser =
      DEMO_USERS.find((u) => u.role === selectedRole) || DEMO_USERS[0];
    if (selectedRole === "student") {
      const stu =
        students.find((s) => s.id === selectedStudentId) || students[0];
      if (stu) {
        onLogin({
          id: `user-student-${stu.id}`,
          name: stu.name,
          email: stu.email,
          role: "student",
          title: `${stu.department} · Sem ${stu.semester}`,
          studentId: stu.id,
        });
        return;
      }
    }
    onLogin(baseUser);
  };

  return (
    <div className="min-h-screen midnight-grid-bg flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left value overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-white block leading-none">
                EduTrack
              </span>
              <span className="text-xs text-blue-300/80">
                University Academic Platform
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight [text-wrap:balance]">
            Unified student records, attendance, grading, and AI study workflows.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Built for university cohorts—monitor real-time attendance rates,
            manage assignment gradebooks, and compare prompt engineering patterns
            in one workspace.
          </p>

          <ul className="space-y-2.5 text-sm text-slate-300">
            {[
              "Live cohort analytics & course performance charts",
              "Instant session attendance & assignment gradebook",
              "Server-secured Gemini AI Tutor & Prompt Engineering Lab",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-indigo-400/15 grid grid-cols-3 gap-4">
            <div>
              <div className="font-mono tabular-nums text-xl font-semibold text-white">
                {students.length}
              </div>
              <div className="text-xs text-slate-400">Students</div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-xl font-semibold text-blue-400">
                4
              </div>
              <div className="text-xs text-slate-400">Core Courses</div>
            </div>
            <div>
              <div className="font-mono tabular-nums text-xl font-semibold text-violet-400">
                3 Roles
              </div>
              <div className="text-xs text-slate-400">Instant Demo</div>
            </div>
          </div>
        </div>

        {/* Right Demo Sign-in Panel */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">
                Choose Demo Workspace Role
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sign in instantly. Changes are persisted locally in your browser.
              </p>
            </div>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label="Demo roles">
            {(["admin", "faculty", "student"] as UserRole[]).map((role) => {
              const info = ROLE_DETAILS[role];
              const demoUser = DEMO_USERS.find((u) => u.role === role)!;
              const Icon = info.icon;
              const isSelected = selectedRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600/18 to-violet-600/12 border-blue-400/55 shadow-md shadow-blue-950/30"
                      : "bg-[#090f24]/75 border-slate-700/55 hover:border-indigo-400/35 hover:bg-[#0d1532]/85"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/25"
                          : "bg-slate-800/90 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-white">
                          {info.badge}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          {role === "student" ? "Select profile" : demoUser.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {info.description}
                      </p>
                      <p className="text-[11px] text-blue-300/80 mt-1.5">
                        {info.capabilities}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRole === "student" && students.length > 0 && (
            <div className="space-y-1.5">
              <label
                htmlFor="demo-student-select"
                className="block text-xs font-medium text-slate-300"
              >
                Sign in as Student Profile
              </label>
              <select
                id="demo-student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d20] border border-slate-700/75 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo}) — {s.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-blue-600/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>Enter EduTrack Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
