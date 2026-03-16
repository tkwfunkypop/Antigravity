import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";

import { Title3DScene } from "./Title3DScene";
import { Problem3DScene } from "./Problem3DScene";
import { Features3DScene } from "./Features3DScene";
import { Workflow3DScene } from "./Workflow3DScene";
import { CTA3DScene } from "./CTA3DScene";

// テンポ感重視のシーン配分（30fpsで15秒）
const SCENE_DURATIONS = {
    title: 90,        // 3 seconds
    problem: 90,      // 3 seconds
    features: 90,     // 3 seconds
    workflow: 90,     // 3 seconds
    cta: 90,          // 3 seconds
};

export const AEFileCollectorPromo3D: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
            <TransitionSeries>
                {/* Scene 1: 3D Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
                    <Title3DScene />
                </TransitionSeries.Sequence>

                {/* Scene 2: 3D Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.problem}>
                    <Problem3DScene />
                </TransitionSeries.Sequence>

                {/* Scene 3: 3D Features Carousel */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.features}>
                    <Features3DScene />
                </TransitionSeries.Sequence>

                {/* Scene 4: 3D Workflow */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.workflow}>
                    <Workflow3DScene />
                </TransitionSeries.Sequence>

                {/* Scene 5: 3D CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <CTA3DScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Exactly 15s (450 frames)
export const AE_FILE_COLLECTOR_PROMO_3D_DURATION = 450;
