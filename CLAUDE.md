# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

There is no test suite configured in this project.

Requires `VITE_GEMINI_API_KEY` in `.env` (see `.env` — currently blank locally) for any Gemini-backed feature (AI Baholash, AI Assistant) to work.

## Architecture

React 19 + Vite SPA, Tailwind v4 (via `@tailwindcss/vite` plugin, no separate config file), routed with `react-router-dom` (`BrowserRouter`, all routes declared in `src/App.jsx`). Netlify hosts it (`netlify.toml` — SPA fallback rewrites `/*` to `/index.html`).

### Pages (`src/pages/`) and what they do
- `CompaniesPage` — home (`/`); lists ecological-expertise consultants aggregated from `public/companies.json`, sortable/searchable/paginated via `src/utils/dataUtils.js`.
- `CompanyDetailPage` (`/company/:id`) — a single consultant's project history.
- `AiPage` (`/ai-baholash`) — wraps `AiEvaluationPanel`, the Gemini document-scoring flow.
- `ArizalarPage` (`/arizalar`) — list of applications backed by `src/data/arizalar.js` / `arizaFiles.js`.
- `AiAssistantPage` (`/ai-assistant`) — chat assistant grounded on a single reference PDF.
- `XaritaPage` (`/xarita`) — interactive Leaflet map of Uzbekistan with region → district drill-down.

### Data layer: static JSON/JS, not a backend API
There is no application backend. All "data" is either:
- static files under `public/` (`companies.json`, PDFs in `public/arizalar/`, `234-qaror.pdf`) fetched at runtime with `fetch()`, or
- hand-authored JS modules under `src/data/` and `src/utils/uzbekistanGeoJson/data/` (GeoJSON split per region, one file per viloyat, aggregated by `data/regions.js`).

`src/utils/dataUtils.js` loads and caches `public/companies.json` once (`_cache`) and derives everything (company aggregates, dashboard chart series) from that single flat record list client-side — there is no server-side aggregation. Records use Cyrillic Uzbek fields transliterated to Latin via the `toLatin()` map in the same file; reuse that helper rather than adding a new transliteration table.

### Gemini integration (two independent call sites)
Both use `@google/genai` directly from the browser with `import.meta.env.VITE_GEMINI_API_KEY` — no proxy/backend.
- `src/utils/gemini.js` (`evaluateProject`) — scores an uploaded/linked ariza PDF against the rubric in `src/utils/prompt.js` (`SYSTEM_PROMPT`/`USER_MESSAGE`, written in Uzbek, encodes the actual scoring rules from Resolution No. 234). It also pulls PDF link-annotations out of the ariza via `src/utils/pdfLinks.js` (pdfjs-dist) to find and attach referenced project documents before sending everything to `gemini-2.5-flash`. The model's own `total_score` is not trusted — `normalizeScore()` recomputes it from `evaluation_matrix` and hard-caps it at 95 (100 is defined as unreachable by design).
- `src/utils/assistant.js` (`sendAssistantMessage`) — a Q&A assistant scoped to `public/234-qaror.pdf` only. It uploads the PDF once via the Files API (`ai.files.upload`, memoized in a module-level promise, polled until `ACTIVE`), then primes every conversation with a synthetic user/model turn pair referencing that file before appending real history. The system instruction enforces strict language/script mirroring (Uzbek Latin vs Cyrillic vs Russian) matching the user's own input — preserve this behavior if touching the prompt.

When editing either prompt, keep the JSON output contract intact — UI components (`AiEvaluationPanel`, `AiEvaluationModal`) parse the model's JSON response directly.

### Map page (`XaritaPage.jsx`)
Single large (~2200 line) component ported from a separate reference project (`geojson_uz/`, gitignored, not part of this repo). It composes `react-leaflet` primitives with local helper components (`MapClickHandler`, `MapZoomController`, `MapAutoResize`) and drives region/district drill-down from the GeoJSON data modules plus `src/data/xaritaFakeData.json`. `MapAutoResize` exists specifically because `MapContainer` remounts on drill-down navigation inside a flex layout and needs a forced `invalidateSize()`.

### Language
UI copy, data field values, and both Gemini prompts are in Uzbek (mix of Latin/Cyrillic script depending on context) — match the existing script/language when adding user-facing strings or model instructions rather than defaulting to English.
