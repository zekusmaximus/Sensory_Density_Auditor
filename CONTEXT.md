# Sensory Density Auditor

## Project Purpose
A Next.js web application that audits manuscript prose for sensory richness, identifies underwritten passages, and suggests enrichments using the author's established voice and sensory vocabulary. The tool processes manuscripts through four analysis phases to establish baselines, audit chapters, map motifs, and provide show-don't-tell revisions.

## Key Features
- Sensory baseline establishment from exemplary passages
- Richness scoring and audit across all chapters
- Motif tracking and echo-planting suggestions
- Show-don't-tell analysis and revision alternatives
- Multiple output formats: interactive HTML map, detailed Markdown reports, enrichment toolkit, CSV roadmap

## Architectural Decisions
- Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4
- Uses Bun as package manager
- Server-side processing via API routes for text analysis
- Regex-based heuristic analysis for sensory detection and scoring
- Client-side rendering of results with downloadable outputs

## Major Changes
- Initial setup: Basic Next.js template with Tailwind
- Added CONTEXT.md for documentation
- Updated package.json with app metadata and scripts