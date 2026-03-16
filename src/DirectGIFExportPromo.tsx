import React from "react";
import {
    AbsoluteFill,
    Sequence,
    useVideoConfig,
    useCurrentFrame,
    spring,
    interpolate,
} from "remotion";
import { z } from "zod";

export const DirectGIFExportPromoSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    features: z.array(z.string()),
    callToAction: z.string(),
});

type Props = z.infer<typeof DirectGIFExportPromoSchema>;

export const DIRECT_GIF_EXPORT_PROMO_DURATION = 450;

const TitleScene: React.FC<{ title: string; subtitle: string }> = ({
    title,
    subtitle,
}) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    const scale = spring({ fps, frame, config: { damping: 12 } });
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#2B2B2B",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontFamily: "sans-serif",
            }}
        >
            <div style={{ transform: `scale(${scale})`, opacity, textAlign: "center" }}>
                <h1 style={{ fontSize: 120, margin: 0, fontWeight: "bold", color: "#FF6B6B" }}>
                    {title}
                </h1>
                <p style={{ fontSize: 40, marginTop: 20, color: "#E0E0E0" }}>{subtitle}</p>
            </div>
        </AbsoluteFill>
    );
};

const SingleFeatureScene: React.FC<{ feature: string }> = ({ feature }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    const slideIn = spring({ fps, frame, config: { damping: 14 } });
    const translateY = interpolate(slideIn, [0, 1], [50, 0]);
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#1E1E1E",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 100px",
                color: "white",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    fontSize: 60,
                    transform: `translateY(${translateY}px)`,
                    opacity,
                    backgroundColor: "#333",
                    padding: "40px 60px",
                    borderRadius: 20,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    textAlign: "center"
                }}
            >
                ✅ {feature}
            </div>
        </AbsoluteFill>
    );
};

const CTAScene: React.FC<{ cta: string }> = ({ cta }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    const scale = spring({ fps, frame, config: { damping: 12 } });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: "80px 120px",
                    borderRadius: 40,
                }}
            >
                <h1 style={{ fontSize: 100, margin: 0, fontWeight: "bold" }}>Download Now!</h1>
                <p style={{ fontSize: 50, marginTop: 40 }}>{cta}</p>
            </div>
        </AbsoluteFill>
    );
};

export const DirectGIFExportPromo: React.FC<Props> = ({
    title,
    subtitle,
    features,
    callToAction,
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Cut 1 (3s) */}
            <Sequence from={0} durationInFrames={90}>
                <TitleScene title={title} subtitle={subtitle} />
            </Sequence>
            {/* Cut 2 (3s) */}
            <Sequence from={90} durationInFrames={90}>
                <SingleFeatureScene feature={features[0]} />
            </Sequence>
            {/* Cut 3 (3s) */}
            <Sequence from={180} durationInFrames={90}>
                <SingleFeatureScene feature={features[1]} />
            </Sequence>
            {/* Cut 4 (3s) */}
            <Sequence from={270} durationInFrames={90}>
                <SingleFeatureScene feature={features[2]} />
            </Sequence>
            {/* Cut 5 (3s) */}
            <Sequence from={360} durationInFrames={90}>
                <CTAScene cta={callToAction} />
            </Sequence>
        </AbsoluteFill>
    );
};
