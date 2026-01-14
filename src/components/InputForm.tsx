"use client";

import { useState } from "react";

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

interface AuditResult {
  sensory_fingerprint: {
    favored_senses: string[];
    syntax_signature: string;
    vocabulary_preference: string;
    metaphor_type: string;
    sensory_density_per_page: string;
    baseline_richness_score: number;
  };
  exemplary_passages_analyzed: {
    source: string;
    quote: string;
    sensory_breakdown: Record<string, number>;
    richness_score: number;
  }[];
  richness_scorecard: {
    chapter: number;
    section: string;
    baseline: number;
    your_score: number;
    status: string;
    key_sensory_gaps: string[];
  }[];
  summary: {
    chapters_at_baseline: number;
    chapters_below_baseline: number[];
    consistent_weak_points: string;
  };
  motif_mapping: Record<string, {
    chapters_present: {
      incarnation: string;
      chapter: number;
      presence: string;
      description: string;
    }[];
    echo_planting_opportunities: {
      chapter: number;
      reason: string;
      suggested_revision: string;
    }[];
  }>;
  per_passage: {
    source: string;
    current_telling_text: string;
    what_is_conveyed: string;
    problems: string[];
    alternative_revisions: {
      alternative_number: number;
      approach: string;
      revised_text: string;
      why_this_works: string[];
    }[];
  }[];
  interactive_map_html: string;
  audit_report_md: string;
  enrichment_toolkit_md: string;
  revisions_md: string;
  roadmap_csv: string;
}

export default function InputForm() {
  const [input, setInput] = useState<AuditInput>({
    manuscript_text: "",
    sensory_baseline: {
      exemplary_chapters: [],
      richness_threshold: 7.5,
    },
  });
  const [results, setResults] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBaseline = (field: keyof SensoryBaseline, value: string | number | Record<string, string>) => {
    setInput(prev => ({
      ...prev,
      sensory_baseline: { ...prev.sensory_baseline, [field]: value }
    }));
  };

  const addExemplaryChapter = () => {
    setInput(prev => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: [...prev.sensory_baseline.exemplary_chapters, ""]
      }
    }));
  };

  const updateExemplaryChapter = (index: number, value: string) => {
    setInput(prev => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: prev.sensory_baseline.exemplary_chapters.map((chap, i) => i === index ? value : chap)
      }
    }));
  };

  const removeExemplaryChapter = (index: number) => {
    setInput(prev => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: prev.sensory_baseline.exemplary_chapters.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Sensory Density Auditor</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manuscript Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Manuscript Text</label>
          <textarea
            value={input.manuscript_text}
            onChange={(e) => setInput(prev => ({ ...prev, manuscript_text: e.target.value }))}
            className="w-full h-64 p-3 border rounded-md"
            placeholder="Paste your full manuscript text here..."
            required
          />
        </div>

        {/* Sensory Baseline */}
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Sensory Baseline</h2>

          {/* Exemplary Chapters */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Exemplary Chapters</label>
            {input.sensory_baseline.exemplary_chapters.map((chapter, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => updateExemplaryChapter(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="e.g., Chandra (Ch. 4-8)"
                />
                <button
                  type="button"
                  onClick={() => removeExemplaryChapter(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExemplaryChapter}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Exemplary Chapter
            </button>
          </div>

          {/* Richness Threshold */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Richness Threshold (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={input.sensory_baseline.richness_threshold}
              onChange={(e) => updateBaseline("richness_threshold", parseFloat(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          {/* Target Sensory Palette */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Sensory Palette (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              {["fire", "cold", "documentation", "touch", "light"].map((motif) => (
                <div key={motif}>
                  <label className="block text-xs font-medium capitalize">{motif}</label>
                  <textarea
                    value={input.sensory_baseline.target_sensory_palette?.[motif as keyof typeof input.sensory_baseline.target_sensory_palette] || ""}
                    onChange={(e) => updateBaseline("target_sensory_palette", {
                      ...input.sensory_baseline.target_sensory_palette,
                      [motif]: e.target.value
                    })}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-md font-semibold disabled:opacity-50"
        >
          {loading ? "Auditing..." : "Run Sensory Audit"}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Audit Results</h2>
          {/* Display results here */}
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}