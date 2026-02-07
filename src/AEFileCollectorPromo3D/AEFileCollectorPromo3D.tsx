import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { Title3DScene } from "./Title3DScene";
import { Problem3DScene } from "./Problem3DScene";
import { Features3DScene } from "./Features3DScene";
import { Workflow3DScene } from "./Workflow3DScene";
import { Folder3DScene } from "./Folder3DScene";
import { CTA3DScene } from "./CTA3DScene";

// テンポ感重視のシーン配分（30fpsで約40秒）
const SCENE_DURATIONS = {
    title: 90,        // 3 seconds
    problem: 120,     // 4 seconds
    features: 300,    // 10 seconds (carousel rotation)
    workflow: 150,    // 5 seconds
    folder: 120,      // 4 seconds
    cta: 120,         // 4 seconds
};

const TRANSITION_DURATION = 12; // 0.4 seconds - faster transitions

export const AEFileCollectorPromo3D: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
            <TransitionSeries>
                {/* Scene 1: 3D Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
                    <Title3DScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 2: 3D Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
                    <Problem3DScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 3: 3D Features Carousel */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.features}>
                    <Features3DScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 4: 3D Workflow */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.workflow}>
                    <Workflow3DScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 5: 3D Folder Structure */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.folder}>
                    <Folder3DScene />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Scene 6: 3D CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <CTA3DScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Total: 90+120+300+150+120+120 - 12*5 = 900 - 60 = 840 frames = 28 seconds
export const AE_FILE_COLLECTOR_PROMO_3D_DURATION =
    SCENE_DURATIONS.title +
    SCENE_DURATIONS.problem +
    SCENE_DURATIONS.features +
    SCENE_DURATIONS.workflow +
    SCENE_DURATIONS.folder +
    SCENE_DURATIONS.cta -
    (TRANSITION_DURATION * 5);
