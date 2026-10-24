# Sahai Setu API setup

## Groq assistant

Set `GROQ_API_KEY` as a server-side Vercel project environment variable for Preview and Production, then redeploy. Do not use a `VITE_` or `NEXT_PUBLIC_` prefix.

The endpoint uses `openai/gpt-oss-20b`, verified against the configured account's current Groq model catalog. Free-tier availability and rate limits are account- and model-dependent; the app does not enable billing or switch models automatically.

The assistant is available at `POST /api/assistant`. It limits prompts to 800 characters and requests to eight per minute per forwarded client address. Registration, validation, token generation, and browser speech continue to work when Groq is unavailable.

## Troubleshooting

- A 503 means `GROQ_API_KEY` is not present in the deployed runtime.
- A 429 means the local request limit or Groq rate limit was reached; wait and try again.
- A 502 means Groq returned a service, model, network, or response-format error. Use the returned `code` and `requestId` with the server logs to identify the cause.
- Never log or expose the key. Rotate it in Vercel if it is accidentally disclosed.
