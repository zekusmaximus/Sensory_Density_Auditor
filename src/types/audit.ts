export interface SensoryPalette {
  [key: string]: string | undefined;
  fire?: string;
  cold?: string;
  documentation?: string;
  touch?: string;
  light?: string;
}

export interface SensoryBaseline {
  exemplary_chapters: string[];
  richness_threshold: number;
  target_sensory_palette?: SensoryPalette;
}

export interface FlaggedChapter {
  chapter: number;
  section?: string;
  issue: string;
  type: "Underwritten sensory detail" | "Show-don't-tell" | "Sensory foreshadowing opportunity";
}

export interface AuditInput {
  manuscript_text: string;
  sensory_baseline: SensoryBaseline;
  chapters_flagged_for_enrichment?: FlaggedChapter[];
}

export interface SensoryFingerprint {
  favored_senses: string[];
  syntax_signature: string;
  vocabulary_preference: string;
  metaphor_type: string;
  sensory_density_per_page: string;
  baseline_richness_score: number;
}

export interface ExemplaryPassage {
  source: string;
  quote: string;
  sensory_breakdown: Record<string, number>;
  richness_score: number;
}

export interface Phase1Result {
  sensory_fingerprint: SensoryFingerprint;
  exemplary_passages_analyzed: ExemplaryPassage[];
}

export interface RichnessScorecard {
  chapter: number;
  section: string;
  baseline: number;
  your_score: number;
  status: string;
  key_sensory_gaps: string[];
}

export interface Phase2Result {
  richness_scorecard: RichnessScorecard[];
  summary: {
    chapters_at_baseline: number;
    chapters_below_baseline: number[];
    consistent_weak_points: string;
  };
}

export interface MotifIncarnation {
  incarnation: string;
  chapter: number;
  presence: string;
  description: string;
}

export interface EchoOpportunity {
  chapter: number;
  reason: string;
  suggested_revision: string;
}

export interface MotifMapping {
  chapters_present: MotifIncarnation[];
  echo_planting_opportunities: EchoOpportunity[];
}

export interface ShowDontTellRevision {
  alternative_number: number;
  approach: string;
  revised_text: string;
  why_this_works: string[];
}

export interface ShowDontTellResult {
  source: string;
  current_telling_text: string;
  what_is_conveyed: string;
  problems: string[];
  alternative_revisions: ShowDontTellRevision[];
}

export interface AuditResult {
  sensory_fingerprint: SensoryFingerprint;
  exemplary_passages_analyzed: ExemplaryPassage[];
  richness_scorecard: RichnessScorecard[];
  summary: {
    chapters_at_baseline: number;
    chapters_below_baseline: number[];
    consistent_weak_points: string;
  };
  motif_mapping: Record<string, MotifMapping>;
  per_passage: ShowDontTellResult[];
  interactive_map_html: string;
  audit_report_md: string;
  enrichment_toolkit_md: string;
  revisions_md: string;
  roadmap_csv: string;
}
