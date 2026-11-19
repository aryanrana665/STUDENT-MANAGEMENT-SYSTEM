import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CalendarClock,
  Check,
  Copy,
  FileQuestion,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
import type { Assignment, DemoUser, EduTrackState } from "../types";

type AssistantMode = "topic" | "study-plan" | "assignment";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode: AssistantMode;
}

interface AIAssistantViewProps {
  state: EduTrackState;
  user: DemoUser;
  onLogActivity: (action: string) => void;
}

const MODE_OPTIONS: Array<{
  id: AssistantMode;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  starters: string[];
}> = [
  {
    id: "topic",
    label: "Understand Topic",
    subtitle: "Intuition, examples & self-checks",
    icon: BookOpen,
    placeholder:
      "Ask about any concept (e.g., How does BCNF differ from 3NF, or explain ROC-AUC)...",
    starters: [
      "Explain Dijkstra's algorithm vs. Bellman-Ford with an example.",
      "Clarify Boyce-Codd Normal Form (BCNF) with a concise table example.",
      "How do idempotency keys prevent duplicate microservice side effects?",
    ],
  },
  {
    id: "study-plan",
    label: "Create Study Plan",
    subtitle: "Time-blocked weekly roadmaps",
    icon: CalendarClock,
    placeholder:
      "Describe your upcoming exams, hours available per day, and weak topics...",
    starters: [
      "Build a 5-day evening study plan (90 mins/day) for Algorithms & Database Systems.",
      "Create a weekend crash-review schedule for Machine Learning ROC-AUC and trees.",
      "Plan a 7-day preparation roadmap for Dynamic Programming interviews.",
    ],
  },
  {
    id: "assignment",
    label: "Explain Assignment",
    subtitle: "Break down specs & edge cases",
    icon: FileQuestion,
    placeholder:
      "Ask how to approach the selected assignment, break down requirements, or clarify pitfalls...",
    starters: [
      "Break this assignment into a step-by-step execution checklist.",
      "What edge cases and grading pitfalls should I watch out for?",
      "Explain the core theoretical concepts needed before starting this task.",
    ],
  },
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  state,
  user,
  onLogActivity,
}) => {
  const [mode, setMode] = useState<AssistantMode>("topic");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    state.assignments[0]?.id || ""
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        if (mounted) {
          setApiConfigured(Boolean(data.configured));
        }
      })
      .catch(() => {
        if (mounted) setApiConfigured(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeModeMeta =
    MODE_OPTIONS.find((m) => m.id === mode) || MODE_OPTIONS[0];

  const selectedAssignment: Assignment | null =
    mode === "assignment"
      ? state.assignments.find((a) => a.id === selectedAssignmentId) || null
      : null;

  const currentStudent = user.studentId
    ? state.students.find((s) => s.id === user.studentId)
    : undefined;

  const sendMessage = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || loading) return;

    setErrorBanner(null);

    if (apiConfigured === false) {
      setErrorBanner(
        "GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in your environment secrets to enable live AI Academic Assistant responses."
      );
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      mode,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          message: text,
          studentName: currentStudent?.name || user.name,
          department: currentStudent?.department,
          assignmentContext: selectedAssignment
            ? {
                title: selectedAssignment.title,
                course: selectedAssignment.course,
                dueDate: selectedAssignment.dueDate,
                maxMarks: selectedAssignment.maxMarks,
                description: selectedAssignment.description,
              }
            : null,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        code?: string;
      };

      if (!response.ok) {
        if (data.code === "API_KEY_MISSING") {
          setApiConfigured(false);
        }
        setErrorBanner(
          data.error || "Unable to reach the AI Academic Assistant service."
        );
        return;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        text: data.reply || "No response received.",
        mode,
      };
      setMessages((prev) => [...prev, aiMsg]);
      onLogActivity(`Used AI Academic Assistant (${activeModeMeta.label})`);
    } catch {
      setErrorBanner("Network error while contacting /api/ai/assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <Bot className="w-4 h-4" />
            <span>Guided Academic Tutoring</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">
            AI Academic Assistant
          </h1>
          <p className="text-sm text-slate-400">
            Clarify tough concepts, build study plans, and break down course assignments
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setErrorBanner(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Thread</span>
          </button>
        )}
      </div>

      {/* Missing API Key Setup Notice */}
      {(apiConfigured === false || errorBanner) && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/35 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100 space-y-1">
            <div className="font-medium">
              {apiConfigured === false
                ? "Server AI Configuration Required"
                : "Assistant Request Notice"}
            </div>
            <p className="text-xs text-amber-200/85 leading-relaxed">
              {errorBanner ||
                "GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in your environment secrets (Settings > Secrets or .env) to enable live Gemini responses."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 space-y-5">
          <div className="space-y-2.5">
            <div className="text-xs font-medium text-slate-300">
              Assistant Mode
            </div>
            <div className="space-y-2">
              {MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      active
                        ? "bg-gradient-to-r from-blue-600/20 to-violet-600/12 text-white border-blue-400/45"
                        : "bg-[#080d20] text-slate-400 hover:text-white border-slate-800/80 hover:border-indigo-400/30"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {opt.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "assignment" && state.assignments.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <label
                htmlFor="ai-assignment-select"
                className="block text-xs font-medium text-slate-300"
              >
                Linked Course Assignment
              </label>
              <select
                id="ai-assignment-select"
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {state.assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.course.split(" ")[0]})
                  </option>
                ))}
              </select>
              {selectedAssignment && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Due {selectedAssignment.dueDate} ·{" "}
                  {selectedAssignment.maxMarks} pts —{" "}
                  {selectedAssignment.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="text-xs font-medium text-slate-300">
              Suggested Prompts
            </div>
            <div className="space-y-2">
              {activeModeMeta.starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(starter)}
                  className="w-full text-left p-3 rounded-xl bg-[#080d20] hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-400/35 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Conversation Workspace */}
        <div className="lg:col-span-8 glass-panel rounded-2xl flex flex-col min-h-[540px] max-h-[74vh]">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-indigo-400/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-6 h-6" />
                </div>
                <h2 className="font-display text-lg font-semibold text-white">
                  {activeModeMeta.label}
                </h2>
                <p className="text-sm text-slate-400 max-w-md">
                  Select a suggested prompt on the left or ask your own academic
                  question below. Responses are served securely via the
                  server-side Gemini endpoint.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/30"
                        : "bg-[#080d20]/90 border border-indigo-400/20 text-slate-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.role === "assistant" && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Generating academic guidance...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-4 border-t border-indigo-400/15 flex items-end gap-2.5"
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={activeModeMeta.placeholder}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#080d20] border border-slate-700 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer shrink-0 h-[44px] shadow-md shadow-blue-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
