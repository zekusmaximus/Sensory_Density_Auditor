import {
  AuditInput,
  AuditResult,
  Phase1Result,
  Phase2Result,
  RichnessScorecard,
  ExemplaryPassage,
  MotifMapping,
  ShowDontTellResult,
  SensoryPalette,
  FlaggedChapter
} from "../types/audit";

// Sensory keywords for detection
const SENSORY_KEYWORDS = {
  touch: ["touch", "feel", "texture", "skin", "hand", "finger", "pressure", "smooth", "rough", "soft", "hard", "warmth", "contact"],
  sound: ["hear", "sound", "noise", "voice", "whisper", "echo", "ring", "hum", "crackle", "silence", "music", "tone"],
  sight: ["see", "look", "view", "color", "light", "dark", "shadow", "bright", "dim", "glimpse", "stare", "visual"],
  temperature: ["hot", "cold", "warm", "cool", "heat", "chill", "freeze", "burn", "temperature", "fever"],
  smell: ["smell", "scent", "odor", "aroma", "perfume", "stench", "fragrance", "whiff", "nose"]
};

const MOTIF_KEYWORDS = {
  fire: ["fire", "flame", "burn", "heat", "ash", "smoke", "ember", "ignite", "blaze"],
  cold: ["cold", "ice", "freeze", "frost", "chill", "snow", "winter", "freezing"],
  documentation: ["record", "document", "ledger", "scroll", "note", "write", "paper", "book", "archive"],
  touch: ["touch", "contact", "skin", "hand", "feel", "caress", "grip", "hold"],
  light: ["light", "bright", "glow", "shine", "illuminate", "clarity", "vision", "beam"]
};

const STATUS_GREEN = "GREEN";
const STATUS_YELLOW = "YELLOW";
const STATUS_RED = "RED";

const SENSORY_REGEXES: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(SENSORY_KEYWORDS).map(([sense, keywords]) => [
    sense,
    keywords.map((keyword) => new RegExp(`\\b${keyword}\\b`, "gi"))
  ])
);

const MOTIF_REGEXES: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(MOTIF_KEYWORDS).map(([motif, keywords]) => [
    motif,
    keywords.map((keyword) => new RegExp(`\\b${keyword}\\b`, "gi"))
  ])
);

export function splitIntoChapters(text: string): { chapter: number; content: string }[] {
  const chapterRegex = /Chapter\s+(\d+)|CH(\d+)|Ch\.?\s*(\d+)/gi;
  const chapters: { chapter: number; content: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = chapterRegex.exec(text)) !== null) {
    if (chapters.length > 0) {
      chapters[chapters.length - 1].content = text.slice(lastIndex, match.index).trim();
    }
    const chapterNum = parseInt(match[1] || match[2] || match[3], 10);
    chapters.push({ chapter: chapterNum, content: "" });
    lastIndex = match.index;
  }

  if (chapters.length > 0) {
    chapters[chapters.length - 1].content = text.slice(lastIndex).trim();
  } else {
    chapters.push({ chapter: 1, content: text.trim() });
  }

  return chapters;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countSensoryReferences(text: string): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const [sense, regexes] of Object.entries(SENSORY_REGEXES)) {
    counts[sense] = regexes.reduce((count, regex) => {
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  return counts;
}

function calculateRichnessScore(counts: Record<string, number>, wordCount: number): number {
  if (wordCount === 0) return 0;
  const totalSensoryRefs = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const refsPer500Words = (totalSensoryRefs / wordCount) * 500;
  // Scale to 1-10, assuming 8-12 refs per 500 words is excellent
  return Math.min(10, Math.max(1, (refsPer500Words / 10) * 10));
}

export function phase1_SensoryBaselineEstablishment(manuscript: string, exemplaryChapters: string[]): Phase1Result {
  const chapters = splitIntoChapters(manuscript);
  const exemplaryPassages: ExemplaryPassage[] = [];

  for (const chap of exemplaryChapters) {
    const normalized = chap.trim();
    const chapterNumberMatch = normalized.match(/\d+/);
    const targetChapterNumber = chapterNumberMatch ? parseInt(chapterNumberMatch[0], 10) : null;
    const found = targetChapterNumber
      ? chapters.find((c) => c.chapter === targetChapterNumber)
      : chapters.find((c) => c.content.toLowerCase().includes(normalized.toLowerCase()));
    if (found && found.content) {
      const counts = countSensoryReferences(found.content);
      const wordCount = countWords(found.content);
      const score = calculateRichnessScore(counts, wordCount);
      exemplaryPassages.push({
        source: chap,
        quote: found.content.slice(0, 200) + "...",
        sensory_breakdown: counts,
        richness_score: score
      });
    }
  }

  const allCounts = exemplaryPassages.reduce((acc, p) => {
    Object.entries(p.sensory_breakdown).forEach(([sense, count]) => {
      acc[sense] = (acc[sense] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const favoredSenses = Object.entries(allCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([sense]) => sense);

  const avgScore = exemplaryPassages.length > 0
    ? exemplaryPassages.reduce((sum, p) => sum + p.richness_score, 0) / exemplaryPassages.length
    : 7.5;

  return {
    sensory_fingerprint: {
      favored_senses: favoredSenses,
      syntax_signature: "Declarative with sensory escalation",
      vocabulary_preference: "Precise and visceral",
      metaphor_type: "Physical grounding",
      sensory_density_per_page: "8-12 references",
      baseline_richness_score: avgScore
    },
    exemplary_passages_analyzed: exemplaryPassages
  };
}

export function phase2_SensoryRichnessAudit(manuscript: string, threshold: number): Phase2Result {
  const chapters = splitIntoChapters(manuscript);
  const scorecard: RichnessScorecard[] = [];
  const chaptersBelowBaseline = new Set<number>();
  const gapCounts: Record<string, number> = {};

  for (const chap of chapters) {
    const sections = chap.content.match(/.{1,2500}/g) || [chap.content];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const wordCount = countWords(section);
      const counts = countSensoryReferences(section);
      const score = calculateRichnessScore(counts, wordCount);
      const status = score >= threshold ? STATUS_GREEN : score >= threshold - 2 ? STATUS_YELLOW : STATUS_RED;

      scorecard.push({
        chapter: chap.chapter,
        section: `Section ${i + 1}`,
        baseline: threshold,
        your_score: score,
        status,
        key_sensory_gaps: Object.entries(counts).filter(([, count]) => count === 0).map(([sense]) => sense)
      });

      scorecard[scorecard.length - 1].key_sensory_gaps.forEach((gap) => {
        gapCounts[gap] = (gapCounts[gap] || 0) + 1;
      });

      if (status !== STATUS_GREEN) {
        chaptersBelowBaseline.add(chap.chapter);
      }
    }
  }

  const belowBaseline = Array.from(chaptersBelowBaseline);
  const totalChapters = new Set(scorecard.map((s) => s.chapter)).size;

  return {
    richness_scorecard: scorecard,
    summary: {
      chapters_at_baseline: totalChapters - belowBaseline.length,
      chapters_below_baseline: belowBaseline,
      consistent_weak_points: Object.entries(gapCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([sense]) => sense)
        .join(" and ") || "None identified"
    }
  };
}

export function phase3_SensoryEchoDetector(manuscript: string, targetPalette: SensoryPalette | undefined): { motif_mapping: Record<string, MotifMapping> } {
  const motifMapping: Record<string, MotifMapping> = {};
  const chapters = splitIntoChapters(manuscript);

  for (const motif of Object.keys(targetPalette || {})) {
    const regexes = MOTIF_REGEXES[motif as keyof typeof MOTIF_REGEXES] || [];

    const chaptersPresent = chapters.map(chap => {
      const count = regexes.reduce((c, regex) => {
        const matches = chap.content.match(regex);
        return c + (matches ? matches.length : 0);
      }, 0);
      const presence = count > 2 ? "Central" : count > 0 ? "Secondary" : "Absent";

      return {
        incarnation: `${motif} in Ch.${chap.chapter}`,
        chapter: chap.chapter,
        presence,
        description: presence !== "Absent" ? `Appears ${count} times` : "Not present"
      };
    });

    motifMapping[motif] = {
      chapters_present: chaptersPresent,
      echo_planting_opportunities: []
    };
  }

  return { motif_mapping: motifMapping };
}

export function phase4_ShowDontTellAnalyzer(manuscript: string): { per_passage: ShowDontTellResult[] } {
  const tellWords = ["feel", "think", "believe", "know", "understand", "realize", "emotion", "sad", "happy", "angry"];
  const chapters = splitIntoChapters(manuscript);
  const passages: ShowDontTellResult[] = [];

  for (const chap of chapters) {
    const tellCount = tellWords.reduce((c, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = chap.content.match(regex);
      return c + (matches ? matches.length : 0);
    }, 0);

    if (tellCount > 2) {
      const excerpt = chap.content.slice(0, 140).replace(/\s+/g, " ").trim();
      passages.push({
        source: `Chapter ${chap.chapter}`,
        current_telling_text: chap.content.slice(0, 100) + "...",
        what_is_conveyed: "Emotional state or realization",
        problems: ["Abstract emotion narration"],
        alternative_revisions: [{
          alternative_number: 1,
          approach: "Sensory/Action-Based",
          revised_text: `Replace abstract emotion verbs with observable actions or sensations in this passage: "${excerpt}..."`,
          why_this_works: ["Connects emotion to concrete physical cues"]
        }]
      });
    }
  }

  return { per_passage: passages };
}

function buildAuditReportMarkdown(result: AuditResult): string {
  const summaryLines = [
    `Baseline richness score: ${result.sensory_fingerprint.baseline_richness_score.toFixed(1)}`,
    `Chapters at baseline: ${result.summary.chapters_at_baseline}`,
    `Chapters below baseline: ${result.summary.chapters_below_baseline.join(", ") || "None"}`,
    `Consistent weak points: ${result.summary.consistent_weak_points}`
  ];

  const scorecardLines = result.richness_scorecard.map((row) => (
    `- Chapter ${row.chapter} ${row.section}: ${row.your_score.toFixed(1)} (${row.status})`
  ));

  return [
    "# Sensory Audit Report",
    "",
    "## Summary",
    ...summaryLines.map((line) => `- ${line}`),
    "",
    "## Scorecard",
    ...scorecardLines
  ].join("\n");
}

function buildEnrichmentToolkitMarkdown(result: AuditResult): string {
  const gapCounts: Record<string, number> = {};
  result.richness_scorecard.forEach((row) => {
    row.key_sensory_gaps.forEach((gap) => {
      gapCounts[gap] = (gapCounts[gap] || 0) + 1;
    });
  });

  const topGaps = Object.entries(gapCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return [
    "# Enrichment Toolkit",
    "",
    "## Focus Areas",
    ...topGaps.map(([gap, count]) => `- ${gap}: missing in ${count} sections`),
    "",
    "## Suggested Techniques",
    "- Layer sensory cues into action beats.",
    "- Add concrete textures, temperatures, or sounds to dialogue-heavy scenes.",
    "- Use motif repetition to strengthen thematic continuity."
  ].join("\n");
}

function buildRevisionsMarkdown(result: AuditResult): string {
  if (result.per_passage.length === 0) {
    return "# Revisions\n\nNo show-don't-tell issues detected at current thresholds.";
  }

  const blocks = result.per_passage.map((passage) => [
    `## ${passage.source}`,
    `Current: ${passage.current_telling_text}`,
    `Issue: ${passage.what_is_conveyed}`,
    `Problems: ${passage.problems.join(", ")}`,
    ...passage.alternative_revisions.map((rev) => (
      `- Option ${rev.alternative_number} (${rev.approach}): ${rev.revised_text} — ${rev.why_this_works.join("; ")}`
    ))
  ].join("\n"));

  return ["# Revisions", "", blocks].join("\n");
}

function buildRoadmapCsv(result: AuditResult, flagged?: FlaggedChapter[]): string {
  const rows: string[] = ["Chapter,Issue,Priority"];

  result.richness_scorecard.forEach((row) => {
    if (row.status !== STATUS_GREEN) {
      const priority = row.status === STATUS_RED ? "High" : "Medium";
      rows.push(`${row.chapter},${row.section} below baseline,${priority}`);
    }
  });

  (flagged || []).forEach((flag) => {
    const section = flag.section ? `${flag.section} ` : "";
    rows.push(`${flag.chapter},${section}${flag.issue},High`);
  });

  return rows.join("\n");
}

function buildInteractiveMapHtml(result: AuditResult): string {
  const items = result.richness_scorecard
    .map((row) => `<li>Chapter ${row.chapter} ${row.section}: ${row.your_score.toFixed(1)} (${row.status})</li>`)
    .join("");
  return `<div><h3>Richness Map</h3><ul>${items}</ul></div>`;
}

export function performAudit(input: AuditInput): AuditResult {
  const phase1 = phase1_SensoryBaselineEstablishment(input.manuscript_text, input.sensory_baseline.exemplary_chapters);
  const phase2 = phase2_SensoryRichnessAudit(input.manuscript_text, input.sensory_baseline.richness_threshold);
  const phase3 = phase3_SensoryEchoDetector(input.manuscript_text, input.sensory_baseline.target_sensory_palette);
  const phase4 = phase4_ShowDontTellAnalyzer(input.manuscript_text);

  const result: AuditResult = {
    ...phase1,
    ...phase2,
    ...phase3,
    ...phase4,
    interactive_map_html: "",
    audit_report_md: "",
    enrichment_toolkit_md: "",
    revisions_md: "",
    roadmap_csv: ""
  };

  result.audit_report_md = buildAuditReportMarkdown(result);
  result.enrichment_toolkit_md = buildEnrichmentToolkitMarkdown(result);
  result.revisions_md = buildRevisionsMarkdown(result);
  result.roadmap_csv = buildRoadmapCsv(result, input.chapters_flagged_for_enrichment);
  result.interactive_map_html = buildInteractiveMapHtml(result);

  return result;
}
