# Sensory Density Auditor

Audit manuscript prose for sensory richness. Paste text, set a baseline, and get section-by-section scores, motif detection, and show-don't-tell flags.

## Prerequisites

- Node.js 18+ (or compatible with Next.js 15)
- npm (bundled with Node.js)

## Install

```bash
npm install
```

## Run (Dev)

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Build & Run (Prod)

```bash
npm run build
npm run start
```

## Lint & Typecheck

```bash
npm run lint
npm run typecheck
```

## How to Use

1. Paste your manuscript text into the main textarea.
2. Add any exemplary chapters (by chapter number or descriptive text) to establish the baseline.
3. Set the richness threshold (1.0–10.0).
4. Optionally define a target sensory palette for motif detection.
5. Click "Run Sensory Audit" to generate results.

## API

The app posts to `POST /api/audit` with JSON:

```json
{
  "manuscript_text": "Chapter 1 ...",
  "sensory_baseline": {
    "exemplary_chapters": ["Chapter 2"],
    "richness_threshold": 7.5,
    "target_sensory_palette": {
      "fire": "embers, heat, smoke"
    }
  },
  "chapters_flagged_for_enrichment": [
    {
      "chapter": 3,
      "section": "Section 2",
      "issue": "Sparse sensory detail",
      "type": "Underwritten sensory detail"
    }
  ]
}
```

Response includes:

- `richness_scorecard` with per-section scores and status (`GREEN`, `YELLOW`, `RED`)
- `summary` with baseline stats
- `motif_mapping` for target palette motifs
- `per_passage` show-don't-tell analysis
- Markdown outputs (`audit_report_md`, `enrichment_toolkit_md`, `revisions_md`)
- `roadmap_csv` with follow-up tasks
- `interactive_map_html` with a simple rendered list

## Notes

- The audit is heuristic and keyword-driven; it does not use an LLM.
- Input size is capped at 1,000,000 characters for basic request protection.
- The route is unauthenticated; add auth/rate limiting before deploying publicly.
