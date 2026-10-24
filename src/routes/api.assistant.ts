import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_MODEL = "openai/gpt-oss-20b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 15_000;
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

function requestId() {
  return crypto.randomUUID();
}

function failure(error: string, code: string, id: string, status: number) {
  return json({ error, code, requestId: id }, status);
}

function classifyUpstream(status: number) {
  if (status === 401 || status === 403) return { code: "GROQ_AUTH", message: "The assistant configuration is not authorized." };
  if (status === 404) return { code: "GROQ_MODEL", message: "The assistant model is unavailable." };
  if (status === 400) return { code: "GROQ_REQUEST", message: "The assistant request was rejected." };
  if (status === 429) return { code: "GROQ_RATE_LIMIT", message: "The assistant is temporarily busy. Please try again shortly." };
  if (status >= 500) return { code: "GROQ_SERVER", message: "The assistant service is temporarily unavailable." };
  return { code: "GROQ_RESPONSE", message: "The assistant returned an unexpected response." };
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
        const id = requestId();
        if (!allowed(clientKey(request))) return failure("The assistant is temporarily busy. Please try again shortly.", "RATE_LIMIT", id, 429);
        let body: AssistantBody;
        try { body = await request.json() as AssistantBody; } catch { return failure("Send a valid JSON request.", "INVALID_REQUEST", id, 400); }
        const message = typeof body.message === "string" ? body.message.trim() : "";
        const language = body.language === "hi" || body.language === "ta" ? body.language : "en";
        if (!message || message.length > MAX_MESSAGE_LENGTH) return failure("Message must be between 1 and 800 characters.", "INVALID_REQUEST", id, 400);
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error(JSON.stringify({ requestId: id, stage: "configuration", code: "MISSING_GROQ_API_KEY", keyPresent: false }));
          return failure("The assistant is not configured. Guided registration and help pages are still available.", "MISSING_CONFIG", id, 503);
        }
        const model = DEFAULT_MODEL;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
          const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
            body: JSON.stringify({ model, temperature: 0.2, max_tokens: MAX_OUTPUT_TOKENS, messages: [
              { role: "system", content: `${SYSTEM_PROMPT}\nLanguage code: ${language}.` },
              { role: "user", content: message },
            ] }),
            signal: controller.signal,
          });
          if (!response.ok) {
            const category = classifyUpstream(response.status);
            console.error(JSON.stringify({ requestId: id, stage: "groq", code: category.code, upstreamStatus: response.status, model }));
            return failure(category.message, category.code, id, response.status === 429 ? 429 : 502);
          }
          const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
          const answer = payload.choices?.[0]?.message?.content;
          if (typeof answer !== "string" || !answer.trim()) {
            console.error(JSON.stringify({ requestId: id, stage: "parse", code: "UNEXPECTED_RESPONSE", model }));
            return failure("The assistant returned an unexpected response.", "UNEXPECTED_RESPONSE", id, 502);
          }
          return json({ answer: answer.trim(), requestId: id });
        } catch (error) {
          const code = error instanceof DOMException && error.name === "AbortError" ? "GROQ_TIMEOUT" : "GROQ_NETWORK";
          console.error(JSON.stringify({ requestId: id, stage: "network", code, model }));
          return failure("The assistant service could not be reached. Please try again shortly.", code, id, 502);
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  },
});
