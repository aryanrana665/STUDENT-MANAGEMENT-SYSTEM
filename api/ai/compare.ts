import type { IncomingMessage, ServerResponse } from "http";
import {
  isGeminiConfigured,
  runPromptComparison,
  type CompareRequest,
} from "../../server/geminiService.ts";

interface VercelReq extends IncomingMessage {
  method?: string;
  body?: CompareRequest;
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req: VercelReq, res: ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  if (!isGeminiConfigured()) {
    return sendJson(res, 503, {
      code: "API_KEY_MISSING",
      error:
        "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in your Vercel Project Environment Variables to run live prompt comparisons.",
    });
  }

  try {
    const body = req.body;
    if (!body?.basicPrompt?.trim() || !body?.improvedPrompt?.trim()) {
      return sendJson(res, 400, {
        error: "Both basicPrompt and improvedPrompt are required.",
      });
    }
    const result = await runPromptComparison(body);
    return sendJson(res, 200, result);
  } catch (error: unknown) {
    const err = error as { status?: number; code?: string; message?: string };
    return sendJson(res, err.status || 500, {
      code: err.code || "AI_COMPARE_FAILED",
      error: err.message || "Failed to compare prompts.",
    });
  }
}
