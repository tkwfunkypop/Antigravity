import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { SeminarTeaser, SEMINAR_TEASER_DURATION } from "./SeminarTeaser";
import { MVComposition } from "./MVComposition";
import { AEFileCollectorPromo, AE_FILE_COLLECTOR_PROMO_DURATION } from "./AEFileCollectorPromo";
import { AEFileCollectorPromo3D, AE_FILE_COLLECTOR_PROMO_3D_DURATION } from "./AEFileCollectorPromo3D";
import { VIBEMotionPromo, VIBE_MOTION_PROMO_DURATION } from "./VIBEMotionPromo";
import { SmartAutoCutPromo, SMART_AUTO_CUT_PROMO_DURATION } from "./SmartAutoCutPromo";
import { PremiereToolsPromo } from "./PremiereToolsPromo";
import { AIGeneratedVideo, AI_GENERATED_VIDEO_DURATION } from "./AIGeneratedVideo";
import { SeminarArchivePromo, SEMINAR_ARCHIVE_PROMO_DURATION } from "./SeminarArchivePromo";

const PREMIERE_TOOLS_PROMO_DURATION = 1350; // 45 seconds at 30fps

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* セミナーアーカイブ告知動画 */}
      <Composition
        id="SeminarArchivePromo"
        component={SeminarArchivePromo}
        durationInFrames={SEMINAR_ARCHIVE_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AI自動生成動画テンプレート */}
      <Composition
        id="AIGeneratedVideo"
        component={AIGeneratedVideo}
        durationInFrames={AI_GENERATED_VIDEO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PremiereToolsPromo"
        component={PremiereToolsPromo}
        durationInFrames={PREMIERE_TOOLS_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="AEFileCollectorPromo"
        component={AEFileCollectorPromo}
        durationInFrames={AE_FILE_COLLECTOR_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="VIBEMotionPromo"
        component={VIBEMotionPromo}
        durationInFrames={VIBE_MOTION_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="AEFileCollectorPromo3D"
        component={AEFileCollectorPromo3D}
        durationInFrames={AE_FILE_COLLECTOR_PROMO_3D_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SmartAutoCutPromo"
        component={SmartAutoCutPromo}
        durationInFrames={SMART_AUTO_CUT_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SeminarTeaser"
        component={SeminarTeaser}
        durationInFrames={SEMINAR_TEASER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="HighQualityMV"
        component={MVComposition}
        durationInFrames={30 * 150} // 2m 30s for the song
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
