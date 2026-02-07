// AEFileCollectorPromo3D with Narration Audio Example
// 
// This file shows how to integrate narration audio with the main composition.
// Copy the relevant parts to AEFileCollectorPromo3D.tsx to enable audio.

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

// ★ナレーション音声コンポーネントをインポート
import { NarrationAudio, BackgroundMusic } from "./narration";

const SCENE_DURATIONS = {
    title: 90,
    problem: 120,
    features: 300,
    workflow: 150,
    folder: 120,
    cta: 120,
};

const TRANSITION_DURATION = 12;

export const AEFileCollectorPromo3DWithAudio: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
            {/* ★ナレーション音声を追加 */}
            <NarrationAudio />

            {/* ★BGMを追加（オプション - public/audio/bgm.mp3 を配置） */}
            {/* <BackgroundMusic volume={0.2} /> */}

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
