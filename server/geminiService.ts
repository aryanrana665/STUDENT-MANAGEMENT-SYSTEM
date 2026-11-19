import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const MODEL_NAME = "gemini-4-hydrogen";

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key.length > 8);
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const err = new Error(
      "GEMINI_API_KEY is not configured on the server. Add it in your environment secrets to enable live AI responses."
    ) as Error & { code?: string; status?: number };
    err.code = "API_KEY_MISSING";
    err.status = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export type AssistantMode = "topic" | "study-plan" | "assignment";

export interface AssistantRequest {
  mode: AssistantMode;
  message: string;
  studentName?: string;
  department?: string;
  assignmentContext?: {
    title: string;
    course: string;
    dueDate: string;
    maxMarks: number;
    description: string;
  } | null;
  history?: Array<{ role: "user" | "assistant"; text: string }>;
}

export async function runAcademicAssistant(
  payload: AssistantRequest
): Promise<{ reply: string; model: string }> {
  const ai = getClient();

  const modeInstructions: Record<AssistantMode, string> = {
    topic:
      "You are an insightful university academic tutor. Explain the requested topic clearly with intuitive analogies, core principles, a concise worked example, and 2 quick self-check questions at the end.",
    "study-plan":
      "You are an academic coach. Build a realistic, actionable study plan broken into concrete sessions, milestones, active recall exercises, and time blocks tailored to the student's request.",
    assignment:
      "You are a teaching assistant. Break down the assignment requirements, explain key concepts needed to succeed, outline a step-by-step approach, and highlight common pitfalls without writing a submission verbatim.",
  };

  const contextLines: string[] = [];
  if (payload.studentName) {
    contextLines.push(`Student: ${payload.studentName}`);
  }
  if (payload.department) {
    contextLines.push(`Department: ${payload.department}`);
  }
  if (payload.assignmentContext) {
    const a = payload.assignmentContext;
    contextLines.push(
      `Selected Assignment: "${a.title}" (${a.course}), Due: ${a.dueDate}, Max Marks: ${a.maxMarks}. Details: ${a.description}`
    );
  }

  const historyText =
    payload.history && payload.history.length > 0
      ? payload.history
          .slice(-6)
          .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`)
          .join("\n\n")
      : "";

  const fullPrompt = [
    contextLines.length > 0 ? `Context:\n${contextLines.join("\n")}` : "",
    historyText ? `Prior conversation:\n${historyText}` : "",
    `Current request:\n${payload.message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: fullPrompt,
    config: {
      systemInstruction: `${modeInstructions[payload.mode]} Use clean markdown headings and bullet lists where helpful. Keep responses crisp, structured, and encouraging.`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  return {
    reply: response.text ?? "No response generated.",
    model: MODEL_NAME,
  };
}

export interface CompareRequest {
  technique: string;
  basicPrompt: string;
  improvedPrompt: string;
  systemInstruction?: string;
}

export interface SinglePromptResult {
  text: string;
  latencyMs: number;
  wordCount: number;
}

export async function runPromptComparison(payload: CompareRequest): Promise<{
  basic: SinglePromptResult;
  improved: SinglePromptResult;
  model: string;
}> {
  const ai = getClient();

  const execute = async (
    prompt: string,
    sysInstruction?: string
  ): Promise<SinglePromptResult> => {
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        ...(sysInstruction ? { systemInstruction: sysInstruction } : {}),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    const latencyMs = Date.now() - start;
    const text = (response.text ?? "").trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    return { text, latencyMs, wordCount };
  };

  const [basic, improved] = await Promise.all([
    execute(payload.basicPrompt),
    execute(payload.improvedPrompt, payload.systemInstruction),
  ]);

  return {
    basic,
    improved,
    model: MODEL_NAME,
  };
}
