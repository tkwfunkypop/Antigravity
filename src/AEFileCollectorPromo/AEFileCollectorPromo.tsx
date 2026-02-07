import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { DemoScene } from "./DemoScene";
import { FeaturesScene } from "./FeaturesScene";
import { WorkflowScene } from "./WorkflowScene";
import { FolderStructureScene } from "./FolderStructureScene";
import { BenefitsScene } from "./BenefitsScene";
import { CTAScene } from "./CTAScene";

// Scene duration configuration (in frames at 30fps)
const SCENE_DURATIONS = {
    title: 120,       // 4 seconds
    problem: 150,     // 5 seconds
    demo: 240,        // 8 seconds
    features: 300,    // 10 seconds
    workflow: 240,    // 8 seconds
    folder: 150,      // 5 seconds
    benefits: 180,    // 6 seconds
    cta: 120,         // 4 seconds
};

const TRANSITION_DURATION = 15; // 0.5 seconds

export const AEFileCollectorPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
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

                {/* Scene 3: Demo (NEW) */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.demo}>
                    <DemoScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 4: Features (NEW) */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.features}>
                    <FeaturesScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 5: Workflow (NEW) */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.workflow}>
                    <WorkflowScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 6: Folder Structure */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.folder}>
                    <FolderStructureScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 7: Benefits (NEW) */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.benefits}>
                    <BenefitsScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
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

// Total duration: 120+150+240+300+240+150+180+120 - 15*7 = 1500 - 105 = 1395 frames = ~46.5 seconds
export const AE_FILE_COLLECTOR_PROMO_DURATION =
    SCENE_DURATIONS.title +
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.demo +
    SCENE_DURATIONS.features +
    SCENE_DURATIONS.workflow +
    SCENE_DURATIONS.folder +
    SCENE_DURATIONS.benefits +
    SCENE_DURATIONS.cta -
    (TRANSITION_DURATION * 7);
