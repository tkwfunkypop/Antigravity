import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { ScriptNameScene } from "./ScriptNameScene";
import { ProblemScene } from "./ProblemScene";
import { FeatureDetailScene } from "./FeatureDetailScene";
import { SolutionScene } from "./SolutionScene";
import { WorkflowDetailScene } from "./WorkflowDetailScene";
import { TrustBadgesScene } from "./TrustBadgesScene";
import { CTAScene } from "./CTAScene";

// TransitionSeries: visual duration = sum(scenes) - sum(transitions)
// 9 cuts, 8 transitions × 15 frames = 120 frames overlap
// visual = sum(scenes) - 120 = 1800 → sum(scenes) = 1920

const TRANSITION_DURATION = 15; // 0.5 seconds

const SCENE_DURATIONS = [
    210,  // Cut 1: 7s    ツール名ドロップ
    225,  // Cut 2: 7.5s  課題提起
    210,  // Cut 3: 7s    特徴① Whisper AI
    210,  // Cut 4: 7s    特徴② 自動カット
    210,  // Cut 5: 7s    特徴③ ワンクリック
    255,  // Cut 6: 8.5s  ソリューション
    210,  // Cut 7: 7s    ワークフロー
    195,  // Cut 8: 6.5s  信頼バッジ
    195,  // Cut 9: 6.5s  CTA
];
// Sum = 1920, minus 8*15=120 overlap = 1800 effective frames = 60s

/** 各カットの映像上の開始フレーム（トランジション分をオフセット） */
function getVisualStartFrames(): number[] {
    const starts: number[] = [0];
    for (let i = 0; i < SCENE_DURATIONS.length - 1; i++) {
        starts.push(starts[i] + SCENE_DURATIONS[i] - TRANSITION_DURATION);
    }
    return starts;
}

const NARRATION_DIR = "SmartAutoCutPromo";

export const SmartAutoCutPromo: React.FC = () => {
    const visualStarts = getVisualStartFrames();

    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
            {/* ── ナレーション音声トラック（TransitionSeriesの外側） ── */}
            {SCENE_DURATIONS.map((dur, i) => (
                <Sequence
                    key={`narration-${i}`}
                    from={visualStarts[i]}
                    durationInFrames={dur - TRANSITION_DURATION}
                >
                    <Audio
                        src={staticFile(`audio/narration/${NARRATION_DIR}/cut_${String(i + 1).padStart(2, "0")}.mp3`)}
                        volume={1}
                    />
                </Sequence>
            ))}

            <TransitionSeries>
                {/* Cut 1: Tool Name Drop */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[0]}>
                    <ScriptNameScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 2: The Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[1]}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 3: Feature 1 - Whisper AI */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[2]}>
                    <FeatureDetailScene featureIndex={0} />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 4: Feature 2 - Auto Cut */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[3]}>
                    <FeatureDetailScene featureIndex={1} />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 5: Feature 3 - One Click */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[4]}>
                    <FeatureDetailScene featureIndex={2} />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 6: Solution Overview */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[5]}>
                    <SolutionScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 7: Workflow Steps */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[6]}>
                    <WorkflowDetailScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 8: Trust Badges */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[7]}>
                    <TrustBadgesScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 9: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[8]}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Total visual duration = sum(scenes) - (transitions * TRANSITION_DURATION)
// = 1920 - (8 * 15) = 1920 - 120 = 1800 frames = 60 seconds
export const SMART_AUTO_CUT_PROMO_DURATION = 1800;
