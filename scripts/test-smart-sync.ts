// scripts/test-smart-sync.ts
import { smartSyncLyrics } from "../src/utils/smartSync";
import { MVConfig } from "../src/types/schema";

const testConfig: MVConfig = {
    project_name: "Test Project",
    audio_path: "dummy.wav",
    theme: "cyberpunk",
    sync_points: {
        start: 17.5,      // Hypothetical Start (Line 4)
        chorus_start: 40.07 // Known Chorus Start (Line 9 - "空蝉よ")
    },
    lyrics: [
        // Verse (Lines 4-8 => 5 lines)
        { text: "擦り切れた夢に愛を注ごう", effect: "bounce" }, // Line 4 (Start)
        { text: "鏡越しの微笑みは蜃気楼", effect: "glitch" },
        { text: "誰かの目に映る僕の影、虚構", effect: "typewriter" },
        { text: "手のひらからこぼれる砂時計", effect: "drop" },
        { text: "消えゆく声だけが真実のフロー", effect: "fade" },

        // Chorus (Line 9 ~)
        { text: "空蝉よ、儚く踊れ", effect: "neon" }, // Line 9 (Chorus Start)
        { text: "夜を裂いて、明日を焦がせ", effect: "neon" },
    ]
};

console.log("--- Testing Smart Sync Logic ---");
console.log(`Start Point: ${testConfig.sync_points.start}s`);
console.log(`Chorus Point: ${testConfig.sync_points.chorus_start}s`);

const syncedLyrics = smartSyncLyrics(testConfig);

console.log("\n--- Calculated Timestamps ---");
syncedLyrics.forEach((line, i) => {
    console.log(`[Line ${i + 1}] ${line.start.toFixed(2)}s : ${line.text}`);
});

// Validation
const calculatedChorusStart = syncedLyrics[5].start;
const expectedChorusStart = testConfig.sync_points.chorus_start!;
const diff = Math.abs(calculatedChorusStart - expectedChorusStart);

if (diff < 0.1) {
    console.log("\n✅ SUCCESS: Chorus aligned correctly!");
} else {
    console.error(`\n❌ FAILURE: Chorus mismatch. Got ${calculatedChorusStart}, expected ${expectedChorusStart}`);
}
