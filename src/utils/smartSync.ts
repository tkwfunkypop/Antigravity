import { MVConfig } from "../types/schema";

export type TimedLyricLine = {
    text: string;
    effect: string;
    start: number;
    duration: number;
    style?: React.CSSProperties;
};

/**
 * Calculates start times and durations for lyrics based on Sync anchor points.
 */
export const smartSyncLyrics = (config: MVConfig): TimedLyricLine[] => {
    const { lyrics, sync_points } = config;
    const timedLines: TimedLyricLine[] = [];

    // 1. Identify Sections (Simple version: Start -> Chorus -> End)
    // For now, we'll assume linear distribution if only Start/End provided.
    // If Chorus is provided, we split into 2 sections: Start->Chorus, Chorus->End.

    // NOTE: Ideally, the config.lyrics should explicitly say which line starts the chorus.
    // For this prototype, we'll just distribute evenly for now, or manually mapping for testing.

    // Let's implement a simple "Anchor-based Distribution"
    // Assuming the user manually split the lyrics array in the config if they want sectioning.
    // Or, we can just take "Start" and "Gap" if provided.

    // PROTOTYPE LOGIC:
    // If we have Start and a Gap (calculated from BPM or manual), use that.
    // If we have Anchor A and Anchor B, distribute lines between them.

    let currentTime = sync_points.start;
    // Default interval if not calculating
    let interval = 4.0;

    // Check if we can calculate interval from Chorus Start
    // Assuming Chorus starts at index X. (This needs data from the user: "Which line is chorus?")
    // For "Utsusemi", Chorus starts at Line 8 ("空蝉よ...").

    const chorusIndex = lyrics.findIndex(l => l.text.includes("空蝉よ"));

    if (chorusIndex !== -1 && sync_points.chorus_start) {
        // Calculate interval for Verse (Start -> Chorus)
        const verseDuration = sync_points.chorus_start - sync_points.start;
        const verseLines = chorusIndex; // Lines before chorus
        const verseInterval = verseDuration / verseLines;

        // Apply for Verse
        for (let i = 0; i < chorusIndex; i++) {
            timedLines.push({
                text: lyrics[i].text,
                effect: lyrics[i].effect || "fade",
                start: sync_points.start + (i * verseInterval),
                duration: verseInterval - 0.2, // Small gap
                style: { color: lyrics[i].color, fontSize: lyrics[i].fontSize }
            });
        }

        // Apply for Chorus (and beyond) - defaulting to same interval or recalculated?
        // For now, assume consistent tempo, so use verseInterval or specific Chorus BPM.
        // Let's stick to the calculated interval.

        const chorusInterval = verseInterval; // Usually same tempo

        for (let i = chorusIndex; i < lyrics.length; i++) {
            const offset = i - chorusIndex;
            timedLines.push({
                text: lyrics[i].text,
                effect: lyrics[i].effect || "fade",
                start: sync_points.chorus_start + (offset * chorusInterval),
                duration: chorusInterval - 0.2,
                style: { color: lyrics[i].color, fontSize: lyrics[i].fontSize }
            });
        }

    } else {
        // Fallback: Linear from Start
        lyrics.forEach((line, i) => {
            timedLines.push({
                text: line.text,
                effect: line.effect || "fade",
                start: currentTime,
                duration: interval,
                style: { color: line.color, fontSize: line.fontSize }
            });
            currentTime += interval;
        });
    }

    return timedLines;
};
