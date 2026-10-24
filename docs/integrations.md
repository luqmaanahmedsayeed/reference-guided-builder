# Optional integrations

Sahai Setu is currently a local-first demo. Queue data is intentionally stored in browser storage so the prototype works offline and across open tabs.

## Groq triage

Use a server-only route when adding AI triage. Keep `GROQ_API_KEY` out of client bundles, validate the submitted symptom text, and return a safe fallback when the key is absent. Never send names, phone numbers, tokens, or other identifying fields to the model.

## n8n notifications

Use a server-only webhook proxy for `N8N_WEBHOOK_URL`. Validate the event shape, send only the minimum operational data, apply a timeout, and never expose the webhook URL to the browser.

These values are optional and are documented in `.env.example`.
