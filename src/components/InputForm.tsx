"use client";

import { useState } from "react";
import { AuditInput, AuditResult, SensoryBaseline, RichnessScorecard } from "@/types/audit";

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

  const updateBaseline = <K extends keyof SensoryBaseline>(field: K, value: SensoryBaseline[K]) => {
    setInput((prev: AuditInput) => ({
      ...prev,
      sensory_baseline: { ...prev.sensory_baseline, [field]: value }
    }));
  };

  const addExemplaryChapter = () => {
    setInput((prev: AuditInput) => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: [...prev.sensory_baseline.exemplary_chapters, ""]
      }
    }));
  };

  const updateExemplaryChapter = (index: number, value: string) => {
    setInput((prev: AuditInput) => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: prev.sensory_baseline.exemplary_chapters.map((chap: string, i: number) => i === index ? value : chap)
      }
    }));
  };

  const removeExemplaryChapter = (index: number) => {
    setInput((prev: AuditInput) => ({
      ...prev,
      sensory_baseline: {
        ...prev.sensory_baseline,
        exemplary_chapters: prev.sensory_baseline.exemplary_chapters.filter((_: string, i: number) => i !== index)
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
            onChange={(e) => setInput((prev: AuditInput) => ({ ...prev, manuscript_text: e.target.value }))}
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
            {input.sensory_baseline.exemplary_chapters.map((chapter: string, index: number) => (
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
        <div className="mt-8 space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">Audit Results</h2>
          
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded shadow-sm border border-green-100">
              <div className="text-sm text-green-600 font-semibold uppercase">Baseline Met</div>
              <div className="text-3xl font-bold">{results.summary.chapters_at_baseline} Chapters</div>
            </div>
            <div className="p-4 bg-red-50 rounded shadow-sm border border-red-100">
              <div className="text-sm text-red-600 font-semibold uppercase">Below Baseline</div>
              <div className="text-3xl font-bold">{results.summary.chapters_below_baseline.length} Chapters</div>
            </div>
            <div className="p-4 bg-blue-50 rounded shadow-sm border border-blue-100">
              <div className="text-sm text-blue-600 font-semibold uppercase">Baseline Score</div>
              <div className="text-3xl font-bold">{results.sensory_fingerprint.baseline_richness_score.toFixed(1)}/10</div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded border italic text-gray-700">
            <strong>Key Insight:</strong> {results.summary.consistent_weak_points}
          </div>

          {/* Scorecard Table */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Richness Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Chapter</th>
                    <th className="p-2 border">Section</th>
                    <th className="p-2 border">Score</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {results.richness_scorecard.map((row: RichnessScorecard, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border font-medium">{row.chapter}</td>
                      <td className="p-2 border text-sm text-gray-600">{row.section}</td>
                      <td className="p-2 border font-mono">{row.your_score.toFixed(1)}</td>
                      <td className={`p-2 border font-bold ${
                        row.status.includes("GREEN") ? "text-green-600" : 
                        row.status.includes("YELLOW") ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {row.status}
                      </td>
                      <td className="p-2 border text-xs italic text-gray-500">
                        {row.key_sensory_gaps.length > 0 ? row.key_sensory_gaps.join(", ") : "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metadata Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 border rounded">
                <h4 className="font-bold mb-2">Primary Senses</h4>
                <div className="flex flex-wrap gap-2">
                  {results.sensory_fingerprint.favored_senses.map((sense: string) => (
                    <span key={sense} className="px-2 py-1 bg-gray-200 rounded text-sm capitalize">{sense}</span>
                  ))}
                </div>
             </div>
             <div className="p-4 border rounded">
                <h4 className="font-bold mb-2">Style Fingerprint</h4>
                <ul className="text-sm space-y-1">
                  <li><span className="text-gray-500">Syntax:</span> {results.sensory_fingerprint.syntax_signature}</li>
                  <li><span className="text-gray-500">Vocab:</span> {results.sensory_fingerprint.vocabulary_preference}</li>
                  <li><span className="text-gray-500">Metaphors:</span> {results.sensory_fingerprint.metaphor_type}</li>
                </ul>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}