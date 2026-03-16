import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { DemoScene } from "./DemoScene";
import { FeaturesScene } from "./FeaturesScene";
import { CTAScene } from "./CTAScene";

// Scene duration configuration (in frames at 30fps) - 5 cuts = 15s
const SCENE_DURATIONS = {
    title: 90,
    problem: 90,
    demo: 90,
    features: 90,
    cta: 90,
};

export const AEFileCollectorPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
            <TransitionSeries>
                {/* Scene 1: Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
                    <TitleScene />
                </TransitionSeries.Sequence>

                {/* Scene 2: Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                {/* Scene 3: Demo (NEW) */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.demo}>
                    <DemoScene />
                </TransitionSeries.Sequence>

                {/* Scene 4: Features */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.features}>
                    <FeaturesScene />
                </TransitionSeries.Sequence>

                {/* Scene 5: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Exactly 15s
export const AE_FILE_COLLECTOR_PROMO_DURATION = 450;
