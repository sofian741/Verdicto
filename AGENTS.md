# Agent / Contributor Notes

This is a standard TanStack Start project (Vite + React 19 + TanStack Router).

- File-based routing lives under `src/routes/` — see `src/routes/README.md`
  for conventions. `src/routeTree.gen.ts` is auto-generated; never edit it
  by hand, it's regenerated on every dev/build run.
- AI calls go through `src/lib/ai-provider.server.ts`, which uses the
  official Google Gemini provider (`@ai-sdk/google`) configured entirely via
  environment variables (`AI_API_KEY`, `AI_MODEL`) — see `.env.example`.
