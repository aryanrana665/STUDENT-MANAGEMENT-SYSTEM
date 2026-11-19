import type { IncomingMessage, ServerResponse } from "http";
import { isGeminiConfigured } from "../../server/geminiService.ts";

export default function handler(
  _req: IncomingMessage,
  res: ServerResponse & {
    status?: (code: number) => typeof res;
    json?: (data: unknown) => void;
  }
) {
  const payload = JSON.stringify({
    configured: isGeminiConfigured(),
    model: "gemini-4-hydrogen",
  });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(payload);
}
