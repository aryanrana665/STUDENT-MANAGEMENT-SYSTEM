import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Bot,
  ChevronDown,
  LogOut,
  Menu,
  RotateCcw,
  Search,
} from "lucide-react";
import { AIAssistantView } from "./components/AIAssistantView";
import { AssignmentsView } from "./components/AssignmentsView";
import { AttendanceView } from "./components/AttendanceView";
import { DashboardView } from "./components/DashboardView";
import { LoginScreen } from "./components/LoginScreen";
import { PromptLabView } from "./components/PromptLabView";
import { Sidebar } from "./components/Sidebar";
import { StudentsView } from "./components/StudentsView";
import type {
  ActivityLog,
  Assignment,
  AttendanceStatus,
  DemoUser,
  EduTrackState,
  MarkEntry,
  NavTab,
  Student,
} from "./types";
import {
  loadEduTrackState,
  loadSavedUser,
  resetEduTrackState,
  saveDemoUser,
  saveEduTrackState,
} from "./utils/storage";

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: "Dashboard",
  students: "Student Management",
  attendance: "Attendance",
  assignments: "Assignments & Marks",
  assistant: "AI Academic Assistant",
  "prompt-lab": "Prompt Engineering Lab",
};

function nowStamp(): string {
  const d = new Date();
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);
  return `${date} · ${time}`;
}

function getInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function App() {
  const [user, setUser] = useState<DemoUser | null>(() => loadSavedUser());
  const [state, setState] = useState<EduTrackState>(() => loadEduTrackState());
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Top navbar interactive state
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readActivityIds, setReadActivityIds] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveEduTrackState(state);
  }, [state]);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  const makeActivity = (
    action: string,
    category: ActivityLog["category"]
  ): ActivityLog => ({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowStamp(),
    actor: user?.name || "System",
    action,
    category,
  });

  const handleLogin = (demoUser: DemoUser) => {
    setUser(demoUser);
    saveDemoUser(demoUser);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setUser(null);
    saveDemoUser(null);
  };

  const handleResetDemo = () => {
    const fresh = resetEduTrackState();
    setState(fresh);
    setReadActivityIds([]);
    setProfileOpen(false);
    showToast("Sample academic data restored.");
  };

  const handleAddStudent = (studentData: Omit<Student, "id">) => {
    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      ...studentData,
    };
    setState((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      activities: [
        makeActivity(
          `Enrolled student ${newStudent.name} (${newStudent.rollNo})`,
          "student"
        ),
        ...prev.activities,
      ],
    }));
    showToast(`Added ${newStudent.name}`);
  };

  const handleUpdateStudent = (updated: Student) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updated.id ? updated : s)),
      activities: [
        makeActivity(`Updated record for ${updated.name}`, "student"),
        ...prev.activities,
      ],
    }));
    showToast(`Updated ${updated.name}`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = state.students.find((s) => s.id === id);
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      attendance: prev.attendance.filter((a) => a.studentId !== id),
      marks: prev.marks.filter((m) => m.studentId !== id),
      activities: [
        makeActivity(`Removed student record ${target?.name || id}`, "student"),
        ...prev.activities,
      ],
    }));
    showToast("Student record removed.");
  };

  const handleSetAttendance = (
    date: string,
    course: string,
    studentId: string,
    status: AttendanceStatus
  ) => {
    setState((prev) => {
      const existingIdx = prev.attendance.findIndex(
        (r) =>
          r.date === date && r.course === course && r.studentId === studentId
      );
      const nextAttendance = [...prev.attendance];
      if (existingIdx >= 0) {
        nextAttendance[existingIdx] = {
          ...nextAttendance[existingIdx],
          status,
        };
      } else {
        nextAttendance.push({
          id: `att-${date}-${course}-${studentId}`,
          date,
          course,
          studentId,
          status,
        });
      }
      return { ...prev, attendance: nextAttendance };
    });
  };

  const handleMarkAllPresent = (date: string, course: string) => {
    setState((prev) => {
      const filtered = prev.attendance.filter(
        (r) => !(r.date === date && r.course === course)
      );
      const bulk = prev.students.map((s) => ({
        id: `att-${date}-${course}-${s.id}`,
        date,
        course,
        studentId: s.id,
        status: "Present" as AttendanceStatus,
      }));
      return {
        ...prev,
        attendance: [...filtered, ...bulk],
        activities: [
          makeActivity(
            `Marked all ${prev.students.length} students Present for ${
              course.split(" ")[0]
            } (${date})`,
            "attendance"
          ),
          ...prev.activities,
        ],
      };
    });
    showToast("All students marked Present.");
  };

  const handleCreateAssignment = (
    asgData: Omit<Assignment, "id" | "createdAt">
  ) => {
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      ...asgData,
    };
    setState((prev) => ({
      ...prev,
      assignments: [newAsg, ...prev.assignments],
      activities: [
        makeActivity(`Published assignment "${newAsg.title}"`, "assignment"),
        ...prev.activities,
      ],
    }));
    showToast("Assignment published.");
  };

  const handleDeleteAssignment = (id: string) => {
    const target = state.assignments.find((a) => a.id === id);
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
      marks: prev.marks.filter((m) => m.assignmentId !== id),
      activities: [
        makeActivity(
          `Deleted assignment "${target?.title || id}"`,
          "assignment"
        ),
        ...prev.activities,
      ],
    }));
    showToast("Assignment deleted.");
  };

  const handleSaveMarks = (assignmentId: string, entries: MarkEntry[]) => {
    const target = state.assignments.find((a) => a.id === assignmentId);
    setState((prev) => {
      const remaining = prev.marks.filter(
        (m) => m.assignmentId !== assignmentId
      );
      return {
        ...prev,
        marks: [...remaining, ...entries],
        activities: [
          makeActivity(
            `Saved ${entries.length} marks for "${
              target?.title || assignmentId
            }"`,
            "marks"
          ),
          ...prev.activities,
        ],
      };
    });
    showToast("Marks saved.");
  };

  const handleLogAIActivity = (action: string) => {
    setState((prev) => ({
      ...prev,
      activities: [makeActivity(action, "ai"), ...prev.activities].slice(0, 25),
    }));
  };

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { students: [], assignments: [] };
    return {
      students: state.students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.rollNo.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        )
        .slice(0, 4),
      assignments: state.assignments
        .filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.course.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [globalQuery, state.students, state.assignments]);

  const unreadCount = useMemo(() => {
    return state.activities
      .slice(0, 6)
      .filter((a) => !readActivityIds.includes(a.id)).length;
  }, [state.activities, readActivityIds]);

  const handleMarkAllRead = () => {
    setReadActivityIds(state.activities.map((a) => a.id));
  };

  if (!user) {
    return <LoginScreen students={state.students} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen midnight-grid-bg flex text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar: Breadcrumb + Search + Notifications + Profile */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-400/15 bg-[#060a18]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-4">
          {/* Left: Mobile trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">EduTrack</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-display font-medium text-white truncate">
                {TAB_TITLES[activeTab]}
              </span>
            </div>
          </div>

          {/* Center/Right: Global Search + Notifications + Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Global Search */}
            <div ref={searchRef} className="relative hidden md:block w-64 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search students, courses..."
                aria-label="Global workspace search"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a1024]/90 border border-indigo-400/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              />

              {searchFocused && globalQuery.trim() !== "" && (
                <div className="absolute right-0 left-0 mt-2 glass-panel rounded-xl p-2 shadow-2xl z-40 space-y-2 max-h-80 overflow-y-auto">
                  {searchResults.students.length === 0 &&
                  searchResults.assignments.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No matching students or assignments found.
                    </div>
                  ) : (
                    <>
                      {searchResults.students.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-medium text-slate-400">
                            Students
                          </div>
                          {searchResults.students.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setActiveTab("students");
                                setSearchFocused(false);
                                setGlobalQuery("");
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] flex items-center justify-between gap-2 text-xs cursor-pointer"
                            >
                              <span className="text-white font-medium truncate">
                                {s.name}
                              </span>
                              <span className="font-mono text-[11px] text-blue-400 shrink-0">
                                {s.rollNo}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.assignments.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-medium text-slate-400">
                            Assignments
                          </div>
                          {searchResults.assignments.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setActiveTab("assignments");
                                setSearchFocused(false);
                                setGlobalQuery("");
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] flex items-center justify-between gap-2 text-xs cursor-pointer"
                            >
                              <span className="text-slate-200 truncate">
                                {a.title}
                              </span>
                              <span className="font-mono text-[11px] text-violet-400 shrink-0">
                                {a.dueDate}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-xl bg-[#0a1024]/90 border border-indigo-400/20 hover:border-indigo-400/40 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-[10px] font-mono font-semibold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] glass-panel rounded-2xl p-4 shadow-2xl z-40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Recent Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                    {state.activities.slice(0, 5).map((act) => {
                      const unread = !readActivityIds.includes(act.id);
                      return (
                        <div
                          key={act.id}
                          className={`py-2.5 first:pt-0 last:pb-0 space-y-0.5 ${
                            unread ? "text-white" : "text-slate-400"
                          }`}
                        >
                          <div className="text-xs leading-snug">
                            {act.action}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {act.actor} · {act.timestamp}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-[#0a1024]/90 border border-indigo-400/20 hover:border-indigo-400/40 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-medium text-white max-w-[120px] truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-blue-400 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 glass-panel rounded-2xl p-2 shadow-2xl z-40 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-medium text-white truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("assistant");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open AI Assistant</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                    <span>Reset Sample Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Role / Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {activeTab === "dashboard" && (
                <DashboardView
                  state={state}
                  user={user}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "students" && (
                <StudentsView
                  state={state}
                  user={user}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                />
              )}
              {activeTab === "attendance" && (
                <AttendanceView
                  state={state}
                  user={user}
                  onSetAttendance={handleSetAttendance}
                  onMarkAllPresent={handleMarkAllPresent}
                />
              )}
              {activeTab === "assignments" && (
                <AssignmentsView
                  state={state}
                  user={user}
                  onCreateAssignment={handleCreateAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onSaveMarks={handleSaveMarks}
                />
              )}
              {activeTab === "assistant" && (
                <AIAssistantView
                  state={state}
                  user={user}
                  onLogActivity={handleLogAIActivity}
                />
              )}
              {activeTab === "prompt-lab" && (
                <PromptLabView onLogActivity={handleLogAIActivity} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Subtle Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#0c142e] border border-blue-400/40 text-xs font-medium text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
