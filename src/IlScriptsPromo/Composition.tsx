import React from "react";
import { Sequence } from "remotion";
import { IntroScene } from "./IntroScene";
import { ScriptCardScene } from "./ScriptCardScene";
import { CTAScene } from "./CTAScene";

// Frame timings (30fps)
const INTRO_START = 0;
const INTRO_DURATION = 120; // 4s

const SCRIPT1_START = INTRO_DURATION;
const SCRIPT_DURATION = 150; // 5s each

const SCRIPT2_START = SCRIPT1_START + SCRIPT_DURATION;
const SCRIPT3_START = SCRIPT2_START + SCRIPT_DURATION;
const SCRIPT4_START = SCRIPT3_START + SCRIPT_DURATION;
const SCRIPT5_START = SCRIPT4_START + SCRIPT_DURATION;

const CTA_START = SCRIPT5_START + SCRIPT_DURATION;
const CTA_DURATION = 120; // 4s

export const IL_SCRIPTS_PROMO_DURATION = CTA_START + CTA_DURATION; // 990 frames ≈ 33s

export const IlScriptsPromo: React.FC = () => {
    return (
        <>
            {/* Scene 1: Intro */}
            <Sequence from={INTRO_START} durationInFrames={INTRO_DURATION}>
                <IntroScene />
            </Sequence>

            {/* Scene 2: RenameLayer */}
            <Sequence from={SCRIPT1_START} durationInFrames={SCRIPT_DURATION}>
                <ScriptCardScene
                    icon="✏️"
                    title="Rename Layer"
                    subtitle="レイヤー名一括変更"
                    features={[
                        "ダイアログで全レイヤー名を一覧表示",
                        "一括編集してOKで即反映",
                        "Cmd+Z で元に戻せる",
                    ]}
                    color="#4CAF50"
                />
            </Sequence>

            {/* Scene 3: RenameObject */}
            <Sequence from={SCRIPT2_START} durationInFrames={SCRIPT_DURATION}>
                <ScriptCardScene
                    icon="🏷"
                    title="Rename Object"
                    subtitle="オブジェクト名一括変更"
                    features={[
                        "選択オブジェクトの名前を一覧表示",
                        "SVG書き出し時の ID に直結",
                        "After Effects 連携にも便利",
                    ]}
                    color="#00BCD4"
                />
            </Sequence>

            {/* Scene 4: SeparateToLayers */}
            <Sequence from={SCRIPT3_START} durationInFrames={SCRIPT_DURATION}>
                <ScriptCardScene
                    icon="📑"
                    title="Separate To Layers"
                    subtitle="レイヤー分割"
                    features={[
                        "オブジェクトを個別レイヤーに分割",
                        "自動命名＋重複回避",
                        "AE アニメーション素材に最適",
                    ]}
                    color="#9C27B0"
                />
            </Sequence>

            {/* Scene 5: Fillinger */}
            <Sequence from={SCRIPT4_START} durationInFrames={SCRIPT_DURATION}>
                <ScriptCardScene
                    icon="🔲"
                    title="Fillinger"
                    subtitle="パス充填"
                    features={[
                        "パス形状にオブジェクトを自動充填",
                        "サイズ・回転・間隔をランダム調整",
                        "パターン背景やテクスチャに",
                    ]}
                    color="#E91E63"
                />
            </Sequence>

            {/* Scene 6: MojiBunkai */}
            <Sequence from={SCRIPT5_START} durationInFrames={SCRIPT_DURATION}>
                <ScriptCardScene
                    icon="🔤"
                    title="Moji Bunkai"
                    subtitle="文字を分解する"
                    features={[
                        "テキストを1文字ずつ分解",
                        "フォント・位置・書式を保持",
                        "タイポグラフィ作品や AE 素材に",
                    ]}
                    color="#FFC107"
                />
            </Sequence>

            {/* Scene 7: CTA */}
            <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
                <CTAScene />
            </Sequence>
        </>
    );
};
