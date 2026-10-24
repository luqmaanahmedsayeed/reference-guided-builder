# Sahai Setu API setup

## Groq assistant

Set `GROQ_API_KEY` as a server-side Vercel project environment variable for Preview and Production, then redeploy. Do not use a `VITE_` or `NEXT_PUBLIC_` prefix.

The endpoint defaults to `llama-3.1-8b-instant`, a currently supported Groq chat model. Set the optional server-side `GROQ_CHAT_MODEL` only to a model shown by Groq's current model catalog and enabled for your account. Free-tier availability and rate limits are account- and model-dependent; the app does not enable billing or switch models automatically.

The assistant is available at `POST /api/assistant`. It limits prompts to 800 characters and requests to eight per minute per forwarded client address. Registration, validation, token generation, and browser speech continue to work when Groq is unavailable.

## Troubleshooting

- A 503 means `GROQ_API_KEY` is not present in the deployed runtime.
- A 429 means the local request limit or Groq rate limit was reached; wait and try again.
- A 502 means Groq returned a service/model error. Check the selected model in Groq's dashboard and redeploy after changing `GROQ_CHAT_MODEL`.
- Never log or expose the key. Rotate it in Vercel if it is accidentally disclosed.
