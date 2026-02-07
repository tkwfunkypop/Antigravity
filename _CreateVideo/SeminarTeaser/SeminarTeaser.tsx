import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { DynamicBackground } from "./DynamicBackground";
import { KineticTitle } from "./KineticTitle";
import { InfoSlide } from "./InfoSlide";
import { CallToAction } from "./CallToAction";

// Scene components
const Scene1_Hook: React.FC = () => (
    <AbsoluteFill>
        <KineticTitle
            text="After Effects"
            fontSize={140}
            delay={10}
        />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
            <KineticTitle
                text="超入門講座"
                fontSize={160}
                color="#a78bfa"
                delay={30}
            />
        </AbsoluteFill>
    </AbsoluteFill>
);

const Scene2_Catchphrase: React.FC = () => (
    <AbsoluteFill>
        <KineticTitle
            text="必ずAEが"
            fontSize={100}
            delay={5}
        />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 160 }}>
            <KineticTitle
                text="好きになる4日間"
                fontSize={120}
                color="#f472b6"
                delay={20}
            />
        </AbsoluteFill>
    </AbsoluteFill>
);

const Scene3_Details: React.FC = () => (
    <InfoSlide
        lines={[
            { label: "日程", value: "2026年 2/5 - 2/8" },
            { label: "期間", value: "4日間集中" },
            { label: "形式", value: "Zoom オンライン" },
        ]}
        delay={5}
    />
);

const Scene4_CTA: React.FC = () => (
    <CallToAction
        text="参加申込み受付中"
        subtext="定員になり次第締め切り"
        delay={10}
    />
);

export const SeminarTeaser: React.FC = () => {
    const transitionDuration = 15;

    return (
        <AbsoluteFill>
            <DynamicBackground />

            <TransitionSeries>
                {/* Scene 1: Hook */}
                <TransitionSeries.Sequence durationInFrames={90}>
                    <Scene1_Hook />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                />

                {/* Scene 2: Catchphrase */}
                <TransitionSeries.Sequence durationInFrames={75}>
                    <Scene2_Catchphrase />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                />

                {/* Scene 3: Details */}
                <TransitionSeries.Sequence durationInFrames={90}>
                    <Scene3_Details />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({ durationInFrames: transitionDuration })}
                />

                {/* Scene 4: CTA */}
                <TransitionSeries.Sequence durationInFrames={75}>
                    <Scene4_CTA />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};

// Total duration calculation:
// 90 + 75 + 90 + 75 - 15 - 15 - 15 = 285 frames (~9.5 seconds at 30fps)
export const SEMINAR_TEASER_DURATION = 285;
