import { NextRequest, NextResponse } from "next/server";

interface SensoryBaseline {
  exemplary_chapters: string[];
  richness_threshold: number;
  target_sensory_palette?: {
    fire?: string;
    cold?: string;
    documentation?: string;
    touch?: string;
    light?: string;
  };
}

interface FlaggedChapter {
  chapter: number;
  section?: string;
  issue: string;
  type: "Underwritten sensory detail" | "Show-don't-tell" | "Sensory foreshadowing opportunity";
}

interface AuditInput {
  manuscript_text: string;
  sensory_baseline: SensoryBaseline;
  chapters_flagged_for_enrichment?: FlaggedChapter[];
}

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

function splitIntoChapters(text: string): { chapter: number; content: string }[] {
  // Simple regex to split by "Chapter X" or similar
  const chapterRegex = /Chapter\s+(\d+)|CH(\d+)|Ch\.?\s*(\d+)/gi;
  const chapters: { chapter: number; content: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = chapterRegex.exec(text)) !== null) {
    if (chapters.length > 0) {
      chapters[chapters.length - 1].content = text.slice(lastIndex, match.index).trim();
    }
    const chapterNum = parseInt(match[1] || match[2] || match[3]);
    chapters.push({ chapter: chapterNum, content: "" });
    lastIndex = match.index;
  }

  if (chapters.length > 0) {
    chapters[chapters.length - 1].content = text.slice(lastIndex).trim();
  } else {
    // If no chapters found, treat whole text as chapter 1
    chapters.push({ chapter: 1, content: text.trim() });
  }

  return chapters;
}

function countSensoryReferences(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const lowerText = text.toLowerCase();

  for (const [sense, keywords] of Object.entries(SENSORY_KEYWORDS)) {
    counts[sense] = keywords.reduce((count, keyword) =>
      count + (lowerText.split(keyword).length - 1), 0);
  }

  return counts;
}

function calculateRichnessScore(counts: Record<string, number>, wordCount: number): number {
  const totalSensoryRefs = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const refsPer500Words = (totalSensoryRefs / wordCount) * 500;
  // Scale to 1-10, assuming 8-12 refs per 500 words is excellent
  return Math.min(10, Math.max(1, (refsPer500Words / 10) * 10));
}

interface SensoryFingerprint {
  favored_senses: string[];
  syntax_signature: string;
  vocabulary_preference: string;
  metaphor_type: string;
  sensory_density_per_page: string;
  baseline_richness_score: number;
}

interface ExemplaryPassage {
  source: string;
  quote: string;
  sensory_breakdown: Record<string, number>;
  richness_score: number;
}

interface Phase1Result {
  sensory_fingerprint: SensoryFingerprint;
  exemplary_passages_analyzed: ExemplaryPassage[];
}

function phase1_SensoryBaselineEstablishment(manuscript: string, exemplaryChapters: string[]): Phase1Result {
  // Find exemplary passages
  const chapters = splitIntoChapters(manuscript);
  const exemplaryPassages: ExemplaryPassage[] = [];

  for (const chap of exemplaryChapters) {
    // Simple matching - could be improved
    const found = chapters.find(c => manuscript.includes(chap));
    if (found) {
      const counts = countSensoryReferences(found.content);
      const wordCount = found.content.split(/\s+/).length;
      const score = calculateRichnessScore(counts, wordCount);
      exemplaryPassages.push({
        source: chap,
        quote: found.content.slice(0, 200) + "...",
        sensory_breakdown: counts,
        richness_score: score
      });
    }
  }

  // Calculate fingerprint
  const allCounts = exemplaryPassages.reduce((acc, p) => {
    Object.entries(p.sensory_breakdown).forEach(([sense, count]) => {
      acc[sense] = (acc[sense] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const favoredSenses = Object.entries(allCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([sense]) => sense);

  const avgScore = exemplaryPassages.reduce((sum, p) => sum + p.richness_score, 0) / exemplaryPassages.length;

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

interface RichnessScorecard {
  chapter: number;
  section: string;
  baseline: number;
  your_score: number;
  status: string;
  key_sensory_gaps: string[];
}

interface Phase2Result {
  richness_scorecard: RichnessScorecard[];
  summary: {
    chapters_at_baseline: number;
    chapters_below_baseline: number[];
    consistent_weak_points: string;
  };
}

function phase2_SensoryRichnessAudit(manuscript: string, threshold: number): Phase2Result {
  const chapters = splitIntoChapters(manuscript);
  const scorecard: RichnessScorecard[] = [];

  for (const chap of chapters) {
    const sections = chap.content.match(/.{1,1000}/g) || [chap.content]; // Split into ~500 word sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const wordCount = section.split(/\s+/).length;
      const counts = countSensoryReferences(section);
      const score = calculateRichnessScore(counts, wordCount);
      const status = score >= threshold ? "✓ GREEN" : score >= threshold - 2 ? "⚠ YELLOW" : "✗ RED";

      scorecard.push({
        chapter: chap.chapter,
        section: `Section ${i + 1}`,
        baseline: threshold,
        your_score: score,
        status,
        key_sensory_gaps: Object.entries(counts).filter(([,count]) => count === 0).map(([sense]) => sense)
      });
    }
  }

  const greenCount = scorecard.filter(s => s.status === "✓ GREEN").length;
  const redChapters = [...new Set(scorecard.filter(s => s.status === "✗ RED").map(s => s.chapter))];

  return {
    richness_scorecard: scorecard,
    summary: {
      chapters_at_baseline: greenCount,
      chapters_below_baseline: redChapters,
      consistent_weak_points: "Touch and temperature often underrepresented"
    }
  };
}

interface MotifPresence {
  incarnation: string;
  chapter: number;
  presence: string;
  description: string;
}

interface EchoOpportunity {
  chapter: number;
  reason: string;
  suggested_revision: string;
}

interface MotifMapping {
  chapters_present: MotifPresence[];
  echo_planting_opportunities: EchoOpportunity[];
}

interface Phase3Result {
  motif_mapping: Record<string, MotifMapping>;
}

function phase3_SensoryEchoDetector(manuscript: string, targetPalette: Record<string, string> | undefined): Phase3Result {
  const motifMapping: Record<string, MotifMapping> = {};

  for (const motif of Object.keys(targetPalette || {})) {
    const keywords = MOTIF_KEYWORDS[motif as keyof typeof MOTIF_KEYWORDS] || [];
    const chapters = splitIntoChapters(manuscript);

    const chaptersPresent: MotifPresence[] = chapters.map(chap => {
      const lowerContent = chap.content.toLowerCase();
      const count = keywords.reduce((c, kw) => c + (lowerContent.split(kw).length - 1), 0);
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

interface AlternativeRevision {
  alternative_number: number;
  approach: string;
  revised_text: string;
  why_this_works: string[];
}

interface PassageAnalysis {
  source: string;
  current_telling_text: string;
  what_is_conveyed: string;
  problems: string[];
  alternative_revisions: AlternativeRevision[];
}

interface Phase4Result {
  per_passage: PassageAnalysis[];
}

function phase4_ShowDontTellAnalyzer(manuscript: string, _flaggedChapters?: FlaggedChapter[]): Phase4Result {
  // Simple implementation - detect abstract emotion words
  const tellWords = ["feel", "think", "believe", "know", "understand", "realize", "emotion", "sad", "happy", "angry"];
  const chapters = splitIntoChapters(manuscript);
  const passages: PassageAnalysis[] = [];

  for (const chap of chapters) {
    const lowerContent = chap.content.toLowerCase();
    const tellCount = tellWords.reduce((c, word) => c + (lowerContent.split(word).length - 1), 0);

    if (tellCount > 2) {
      passages.push({
        source: `Chapter ${chap.chapter}`,
        current_telling_text: chap.content.slice(0, 100) + "...",
        what_is_conveyed: "Emotional state or realization",
        problems: ["Abstract emotion narration"],
        alternative_revisions: [{
          alternative_number: 1,
          approach: "Sensory/Action-Based",
          revised_text: "Revised version with sensory details...",
          why_this_works: ["Grounds emotion in physical sensation"]
        }]
      });
    }
  }

  return { per_passage: passages };
}

export async function POST(request: NextRequest) {
  try {
    const body: AuditInput = await request.json();
    const { manuscript_text, sensory_baseline, chapters_flagged_for_enrichment } = body;

    // Run all phases
    const phase1 = phase1_SensoryBaselineEstablishment(manuscript_text, sensory_baseline.exemplary_chapters);
    const phase2 = phase2_SensoryRichnessAudit(manuscript_text, sensory_baseline.richness_threshold);
    const phase3 = phase3_SensoryEchoDetector(manuscript_text, sensory_baseline.target_sensory_palette);
    const phase4 = phase4_ShowDontTellAnalyzer(manuscript_text, chapters_flagged_for_enrichment);

    // Generate outputs
    const interactive_map_html = `<html><body><h1>Sensory Map</h1><p>Timeline visualization would go here</p></body></html>`;
    const audit_report_md = `# Audit Report\n\n${JSON.stringify({ ...phase1, ...phase2 }, null, 2)}`;
    const enrichment_toolkit_md = `# Enrichment Toolkit\n\nSensory vocabulary extracted...`;
    const revisions_md = `# Revisions\n\n${JSON.stringify(phase4, null, 2)}`;
    const roadmap_csv = `Motif,Chapters Present,Opportunities\n${Object.keys(phase3.motif_mapping).join(',')}`;

    const result = {
      ...phase1,
      ...phase2,
      ...phase3,
      ...phase4,
      interactive_map_html,
      audit_report_md,
      enrichment_toolkit_md,
      revisions_md,
      roadmap_csv
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed to process audit" }, { status: 500 });
  }
}