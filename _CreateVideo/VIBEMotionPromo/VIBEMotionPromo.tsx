import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { SolutionScene } from "./SolutionScene";
import { CategoriesScene } from "./CategoriesScene";
import { DemoScene } from "./DemoScene";
import { HowItWorksScene } from "./HowItWorksScene";
import { ComparisonScene } from "./ComparisonScene";
import { CTAScene } from "./CTAScene";

// Scene duration configuration (in frames at 30fps)
const SCENE_DURATIONS = {
    title: 120,        // 4 seconds
    problem: 180,      // 6 seconds
    solution: 180,     // 6 seconds
    categories: 240,   // 8 seconds
    demo: 300,         // 10 seconds - 実際のサイト画面デモ
    howItWorks: 240,   // 8 seconds
    comparison: 180,   // 6 seconds
    cta: 150,          // 5 seconds
};

const TRANSITION_DURATION = 15; // 0.5 seconds

export const VIBEMotionPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0f0f23" }}>
            <TransitionSeries>
                {/* Scene 1: Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
                    <TitleScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 2: Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 3: Solution */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.solution}>
                    <SolutionScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 4: Categories */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.categories}>
                    <CategoriesScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 5: Demo - 実際のサイト画面 */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.demo}>
                    <DemoScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 6: How It Works */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.howItWorks}>
                    <HowItWorksScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 7: Comparison */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.comparison}>
                    <ComparisonScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 8: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Total duration calculation
export const VIBE_MOTION_PROMO_DURATION =
    SCENE_DURATIONS.title +
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.solution +
    SCENE_DURATIONS.categories +
    SCENE_DURATIONS.demo +
    SCENE_DURATIONS.howItWorks +
    SCENE_DURATIONS.comparison +
    SCENE_DURATIONS.cta -
    (TRANSITION_DURATION * 7);
// = 120+180+180+240+300+240+180+150 - 105 = 1590 - 105 = 1485 frames = 49.5 seconds

