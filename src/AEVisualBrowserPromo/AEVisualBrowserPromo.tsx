import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";

import { TitleScene } from "./TitleScene";
import { ProblemScene } from "./ProblemScene";
import { DemoScene } from "./DemoScene";
import { InstallScene } from "./InstallScene";
import { CTAScene } from "./CTAScene";

// Frame timings (30fps) - 5 cuts = 15 seconds = 450 frames
const SCENE_DURATIONS = [
    90,  // Cut 1: 3s   タイトル
    90,  // Cut 2: 3s   課題
    90,  // Cut 3: 3s   機能紹介＆デモ
    90,  // Cut 4: 3s   インストール
    90,  // Cut 5: 3s   CTA
];

export const AEVisualBrowserPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#050510" }}>
            <TransitionSeries>
                {/* Cut 1: Title */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[0]}>
                    <TitleScene />
                </TransitionSeries.Sequence>

                {/* Cut 2: Problem */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[1]}>
                    <ProblemScene />
                </TransitionSeries.Sequence>

                {/* Cut 3: Demo & Feature */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[2]}>
                    <DemoScene />
                </TransitionSeries.Sequence>

                {/* Cut 4: Install */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[3]}>
                    <InstallScene />
                </TransitionSeries.Sequence>

                {/* Cut 5: CTA */}
                <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[4]}>
                    <CTAScene />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Exactly 15 seconds (450 frames)
export const AE_VISUAL_BROWSER_PROMO_DURATION = 450;
