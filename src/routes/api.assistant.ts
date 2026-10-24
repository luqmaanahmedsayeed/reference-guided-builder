import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_MODEL = "llama-3.1-8b-instant";
const MAX_MESSAGE_LENGTH = 800;
const MAX_OUTPUT_TOKENS = 220;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const requestLog = new Map<string, number[]>();

const SYSTEM_PROMPT = `You are Sahai Setu, a concise hospital navigation assistant. Answer only general, non-sensitive questions about OPD registration, choosing departments, tokens/slips, finding places, and using this app. Never request or repeat patient names, ages, genders, phone numbers, tokens, medical details, or registration transcripts. Do not diagnose or give medical advice. Use the user's language (English, Hindi, or Tamil). If you do not know a room location, say so and direct the user to the Help Desk. Keep answers short and suitable for speech playback.`;

type AssistantBody = { message?: unknown; language?: unknown };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function allowed(key: string) {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return false;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!allowed(clientKey(request))) return json({ error: "Too many requests. Please try again shortly." }, 429);
        let body: AssistantBody;
        try { body = await request.json() as AssistantBody; } catch { return json({ error: "Send a valid JSON request." }, 400); }
        const message = typeof body.message === "string" ? body.message.trim() : "";
        const language = body.language === "hi" || body.language === "ta" ? body.language : "en";
        if (!message || message.length > MAX_MESSAGE_LENGTH) return json({ error: "Message must be between 1 and 800 characters." }, 400);
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return json({ error: "The assistant is temporarily unavailable. Guided registration and help pages are still available." }, 503);
        const model = process.env.GROQ_CHAT_MODEL || DEFAULT_MODEL;
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
            body: JSON.stringify({ model, temperature: 0.2, max_tokens: MAX_OUTPUT_TOKENS, messages: [
              { role: "system", content: `${SYSTEM_PROMPT}\nLanguage code: ${language}.` },
              { role: "user", content: message },
            ] }),
          });
          if (!response.ok) return json({ error: "The assistant is temporarily unavailable. Please use the guided options or try again later." }, response.status === 429 ? 429 : 502);
          const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
          const answer = payload.choices?.[0]?.message?.content;
          if (typeof answer !== "string" || !answer.trim()) return json({ error: "The assistant did not return an answer. Please try again." }, 502);
          return json({ answer: answer.trim() });
        } catch { return json({ error: "The assistant is temporarily unavailable. Please use the guided options or try again later." }, 502); }
      },
    },
  },
});
