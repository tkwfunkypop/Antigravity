import { z } from "zod";

// Zod Schema for validation
export const EffectSchema = z.enum(["bounce", "fade", "glitch", "typewriter", "neon", "drop"]);

export const LyricLineSchema = z.object({
    text: z.string(),
    effect: EffectSchema.optional().default("fade"),
    color: z.string().optional(),
    fontSize: z.number().optional(),
});

export const SyncPointSchema = z.object({
    start: z.number(),
    chorus_start: z.number().optional(),
    chorus_end: z.number().optional(),
    end: z.number().optional(),
});

export const MVConfigSchema = z.object({
    project_name: z.string(),
    audio_path: z.string(),
    bpm: z.number().optional(),
    theme: z.enum(["cyberpunk", "kinetic", "emotional"]).default("cyberpunk"),
    sync_points: SyncPointSchema,
    lyrics: z.array(LyricLineSchema),
});

export type MVConfig = z.infer<typeof MVConfigSchema>;
export type EffectType = z.infer<typeof EffectSchema>;
