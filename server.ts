import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  isGeminiConfigured,
  runAcademicAssistant,
  runPromptComparison,
  type AssistantRequest,
  type CompareRequest,
} from "./server/geminiService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/ai/status", (_req, res) => {
    res.json({
      configured: isGeminiConfigured(),
      model: "gemini-4-hydrogen",
    });
  });

  app.post("/api/ai/assistant", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({
          code: "API_KEY_MISSING",
          error:
            "GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in your environment secrets to activate the AI Academic Assistant.",
        });
      }

      const body = req.body as AssistantRequest;
      if (!body?.message || !body.message.trim()) {
        return res.status(400).json({ error: "Message is required." });
      }

      const result = await runAcademicAssistant(body);
      return res.json(result);
    } catch (error: unknown) {
      const err = error as { status?: number; code?: string; message?: string };
      const status = err.status || 500;
      return res.status(status).json({
        code: err.code || "AI_REQUEST_FAILED",
        error: err.message || "Failed to generate academic response.",
      });
    }
  });

  app.post("/api/ai/compare", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({
          code: "API_KEY_MISSING",
          error:
            "GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in your environment secrets to run live prompt comparisons.",
        });
      }

      const body = req.body as CompareRequest;
      if (!body?.basicPrompt?.trim() || !body?.improvedPrompt?.trim()) {
        return res
          .status(400)
          .json({ error: "Both basicPrompt and improvedPrompt are required." });
      }

      const result = await runPromptComparison(body);
      return res.json(result);
    } catch (error: unknown) {
      const err = error as { status?: number; code?: string; message?: string };
      const status = err.status || 500;
      return res.status(status).json({
        code: err.code || "AI_COMPARE_FAILED",
        error: err.message || "Failed to compare prompts.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build not found. Run npm run build first.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduTrack server listening on http://localhost:${PORT}`);
  });
}

startServer();
