import React from "react";
import {
  Bot,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import type { DemoUser, NavTab } from "../types";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: DemoUser;
  onLogout: () => void;
  onResetDemo: () => void;
}

const ACADEMIC_NAV: Array<{
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "assignments", label: "Assignments & Marks", icon: ClipboardList },
];

const AI_NAV: Array<{
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "assistant", label: "AI Academic Assistant", icon: Bot },
  { id: "prompt-lab", label: "Prompt Eng. Lab", icon: FlaskConical },
];

function getInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  user,
  onLogout,
  onResetDemo,
}) => {
  const renderNavGroup = (
    title: string,
    items: Array<{
      id: NavTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }>
  ) => (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-slate-500">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={collapsed ? item.label : undefined}
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active
                ? "bg-gradient-to-r from-blue-600/22 via-indigo-600/18 to-violet-600/10 text-white border border-blue-400/35 shadow-sm shadow-blue-950/40"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
            } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active
                  ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-slate-800/70 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            {!collapsed && (
              <span className="truncate whitespace-nowrap">{item.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  const sidebarBody = (
    <div className="h-full flex flex-col bg-[#070b1a]/95 backdrop-blur-2xl border-r border-indigo-400/15 select-none">
      {/* Brand header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-indigo-400/12 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg tracking-tight text-white truncate">
              EduTrack
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-4 space-y-5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {renderNavGroup("Academic Workspace", ACADEMIC_NAV)}
        {renderNavGroup("AI & Prompt Studio", AI_NAV)}
      </nav>

      {/* Account footer */}
      <div className="p-3 border-t border-indigo-400/12 space-y-2.5 shrink-0">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-[#0c132b]/90 border border-indigo-400/15 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/40 to-violet-600/40 border border-blue-400/30 flex items-center justify-center text-xs font-semibold text-blue-200 shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} ·{" "}
                {user.title}
              </div>
            </div>
          </div>
        )}

        <div className={`flex gap-1.5 ${collapsed ? "flex-col" : ""}`}>
          <button
            type="button"
            onClick={onResetDemo}
            title="Reset sample data"
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Reset Data</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Switch role / Sign out"
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out h-screen sticky top-0 ${
          collapsed ? "w-[78px]" : "w-[264px]"
        }`}
      >
        {sidebarBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[84vw] h-full z-10">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
};
