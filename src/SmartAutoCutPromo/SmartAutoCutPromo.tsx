import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { SolutionScene } from "./SolutionScene";
import { DemoScene } from "./DemoScene";
import { CTAScene } from "./CTAScene";

// Scene durations (30fps, ~30 seconds total)
const SCENE_DURATIONS = {
    title: 90,        // 3 seconds
    problem: 150,     // 5 seconds
    solution: 180,    // 6 seconds
    demo: 240,        // 8 seconds
    cta: 120,         // 4 seconds
};

const TRANSITION_DURATION = 15; // 0.5 seconds

export const SmartAutoCutPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
            <TransitionSeries>
                {/* Scene 1: Title with Scissors Animation */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
                    <TitleScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 2: The Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 3: The Solution */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.solution}>
                    <SolutionScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 4: Demo/Features */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.demo}>
                    <DemoScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 5: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

export const SMART_AUTO_CUT_PROMO_DURATION =
    SCENE_DURATIONS.title +
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.solution +
    SCENE_DURATIONS.demo +
    SCENE_DURATIONS.cta -
    (TRANSITION_DURATION * 4);
