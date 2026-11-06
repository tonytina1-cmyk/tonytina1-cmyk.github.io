# TBT conversational AI assistant — prepared, NOT active

The live website continues to use `trip-help.js` until the Worker is deployed. Do not publish an untested placeholder URL, a Cloudflare API token, or account credentials in this public repository.

## Cloudflare deployment

1. In the existing TBT Cloudflare account, open Workers & Pages and create a Worker named `tbt-bali-ai` from the contents of `cloudflare/tbt-ai/src/index.js`.
2. In Settings > Bindings add a **Workers AI** binding with variable name `AI`. Add a **Rate Limiting** binding with variable name `RATE_LIMITER` (6 requests per 60 seconds, namespace 1001); equivalent Wrangler settings are provided in `cloudflare/tbt-ai/wrangler.jsonc`.
3. Confirm Workers stays on **Free**: do not upgrade or attach paid billing to enable higher AI usage. Workers AI has a daily free neuron allowance, with errors when exhausted. The rate limit reduces misuse but is not a strict global spend quota. Test requests consume free allowance.
4. Publish the Worker and test `POST https://<your-actual-worker-url>/chat` from an allowed TBT site origin (the Worker deliberately restricts CORS origins). Test a multi-turn conversation, wrong-origin request, rate-limiting, and failures before enabling publicly.
5. Activate the interface by placing this **above the closing body tag** on the site pages that already load `trip-help.js`, after confirming the endpoint:
```html
<script>window.TBT_AI_ENDPOINT = 'https://YOUR-ACTUAL-WORKER-DOMAIN/chat';</script>
<script src="/tbt-ai-chat.js?v=1" defer></script>
```
Replace the URL with the real deployed Worker endpoint. Once the script loads successfully it hides the existing guided helper and shows the AI version. Keep the old guided helper as the fallback when the AI script is not enabled.
6. Test on iPhone Safari, desktop Safari and Chrome; check real WhatsApp/email handover opens a DRAFT, never auto-sends. Confirm Cloudflare usage and monitoring.

## Safety and behaviour
- No server-side API token in page JavaScript: Workers AI binding only.
- Backend checks origin and HTTP method, limits payload length and conversation history, rate-limits requests, and returns non-cacheable responses.
- Visitors are told explicitly it is AI, not Budi. It does not quote live availability or claim bookings are confirmed.
- The browser retains messages in memory only (not local storage). History is submitted to the AI for each answer; no personal data is persisted by this code.
- This initial handover includes the visitor's own messages only, so they should review the WhatsApp/email draft for completeness.
- For production hardening, add Cloudflare Turnstile or WAF bot protection, monitoring, and reconsider whether an IP rate limit unintentionally affects visitors sharing networks.

## Status
Backend Worker source staged in GitHub; frontend widget staged in GitHub. **Not deployed to Cloudflare or enabled on live pages.** Direct Cloudflare account/deploy access is necessary to finish.
