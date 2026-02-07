import { Composition, Sequence } from "remotion";
import { IntroScene } from "./IntroScene";
import { ProblemScene } from "./ProblemScene";
import { ToolCardScene } from "./ToolCardScene";
import { WorkflowScene } from "./WorkflowScene";
import { CTAScene } from "./CTAScene";

// Frame timings (30fps)
const INTRO_START = 0;
const INTRO_DURATION = 150; // 5 seconds

const PROBLEM_START = INTRO_DURATION;
const PROBLEM_DURATION = 210; // 7 seconds

const TOOL1_START = PROBLEM_START + PROBLEM_DURATION;
const TOOL1_DURATION = 210; // 7 seconds

const TOOL2_START = TOOL1_START + TOOL1_DURATION;
const TOOL2_DURATION = 210; // 7 seconds

const TOOL3_START = TOOL2_START + TOOL2_DURATION;
const TOOL3_DURATION = 210; // 7 seconds

const WORKFLOW_START = TOOL3_START + TOOL3_DURATION;
const WORKFLOW_DURATION = 210; // 7 seconds

const CTA_START = WORKFLOW_START + WORKFLOW_DURATION;
const CTA_DURATION = 150; // 5 seconds

const TOTAL_DURATION = CTA_START + CTA_DURATION; // 1350 frames = 45 seconds

export const PremiereToolsPromo: React.FC = () => {
    return (
        <>
            {/* Scene 1: Intro */}
            <Sequence from={INTRO_START} durationInFrames={INTRO_DURATION}>
                <IntroScene />
            </Sequence>

            {/* Scene 2: Problem */}
            <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_DURATION}>
                <ProblemScene />
            </Sequence>

            {/* Scene 3.1: PP-Transcriber */}
            <Sequence from={TOOL1_START} durationInFrames={TOOL1_DURATION}>
                <ToolCardScene
                    icon="🎙️"
                    title="PP-Transcriber"
                    subtitle="AI文字起こし"
                    features={[
                        "faster-whisper による高精度変換",
                        "SRT / TXT / JSON 出力対応",
                        "タイムライン連動の自動解析",
                    ]}
                    color="#9966FF"
                    screenshotPath="premiere-tools/pp-transcriber.png"
                />
            </Sequence>

            {/* Scene 3.2: PP-AutoCut */}
            <Sequence from={TOOL2_START} durationInFrames={TOOL2_DURATION}>
                <ToolCardScene
                    icon="✂️"
                    title="PP-AutoCut"
                    subtitle="自動カット"
                    features={[
                        "無音区間を一括検出",
                        "リップル削除で隙間なくカット",
                        "Cmd+Z で完全に元に戻せる",
                    ]}
                    color="#FF6B6B"
                    screenshotPath="premiere-tools/pp-autocut.png"
                />
            </Sequence>

            {/* Scene 3.3: PP-Caption */}
            <Sequence from={TOOL3_START} durationInFrames={TOOL3_DURATION}>
                <ToolCardScene
                    icon="💬"
                    title="PP-Caption"
                    subtitle="テロップ配置"
                    features={[
                        "SRTからマーカー自動生成",
                        "トラック指定で整理配置",
                        "タイミング調整が簡単",
                    ]}
                    color="#4ECDC4"
                    screenshotPath="premiere-tools/pp-caption.png"
                />
            </Sequence>

            {/* Scene 4: Workflow */}
            <Sequence from={WORKFLOW_START} durationInFrames={WORKFLOW_DURATION}>
                <WorkflowScene />
            </Sequence>

            {/* Scene 5: CTA */}
            <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
                <CTAScene />
            </Sequence>
        </>
    );
};

// Remotion Composition export
export const PremiereToolsPromoComposition: React.FC = () => {
    return (
        <Composition
            id="PremiereToolsPromo"
            component={PremiereToolsPromo}
            durationInFrames={TOTAL_DURATION}
            fps={30}
            width={1920}
            height={1080}
        />
    );
};
