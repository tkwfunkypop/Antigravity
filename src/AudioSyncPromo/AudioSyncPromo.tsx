import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { FeatureScene } from "./FeatureScene";
import { WorkflowScene } from "./WorkflowScene";
import { CTAScene } from "./CTAScene";

const TRANSITION_DURATION = 15; // 0.5 seconds

const SCENE_DURATIONS = [
    240,  // Cut 1: 8s    タイトル
    240,  // Cut 2: 8s    課題提起
    300,  // Cut 3: 10s   機能紹介
    270,  // Cut 4: 9s    ワークフロー
    210,  // Cut 5: 7s    CTA
];
// Sum = 1260, minus 4*15=60 overlap = 1200 effective frames = 40s

export const AudioSyncPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#050510" }}>
            <TransitionSeries>
                {/* Cut 1: Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[0]}>
                    <TitleScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 2: Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[1]}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 3: Features */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[2]}>
                    <FeatureScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 4: Workflow */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[3]}>
                    <WorkflowScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Cut 5: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[4]}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Total visual duration = sum(scenes) - (transitions * TRANSITION_DURATION)
// = 1260 - (4 * 15) = 1260 - 60 = 1200 frames = 40 seconds
export const AUDIO_SYNC_PROMO_DURATION = 1200;
