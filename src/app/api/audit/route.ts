import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { performAudit } from "@/lib/audit-service";

// Input validation schema
const auditSchema = z.object({
  manuscript_text: z.string().min(10).max(1000000), // Max 1M characters (~150k words) for rudimentary DoS protection
  sensory_baseline: z.object({
    exemplary_chapters: z.array(z.string()),
    richness_threshold: z.number().min(1).max(20),
    target_sensory_palette: z.record(z.string(), z.string()).optional(),
  }),
  chapters_flagged_for_enrichment: z.array(z.object({
    chapter: z.number(),
    section: z.string().optional(),
    issue: z.string(),
    type: z.enum(["Underwritten sensory detail", "Show-don't-tell", "Sensory foreshadowing opportunity"]),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    
    // Validate input
    const validation = auditSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const result = performAudit(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed to process audit" }, { status: 500 });
  }
}
