import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { SeminarTeaser, SEMINAR_TEASER_DURATION } from "./SeminarTeaser";
// import { MVComposition } from "./MVComposition"; // TODO: モジュール不在のため一時無効化
import { AEFileCollectorPromo3D, AE_FILE_COLLECTOR_PROMO_3D_DURATION } from "./AEFileCollectorPromo3D";
import { VIBEMotionPromo, VIBE_MOTION_PROMO_DURATION } from "./VIBEMotionPromo";
import { SmartAutoCutPromo, SMART_AUTO_CUT_PROMO_DURATION } from "./SmartAutoCutPromo";
import { PremiereToolsPromo } from "./PremiereToolsPromo";
// import { AIGeneratedVideo, AI_GENERATED_VIDEO_DURATION } from "./AIGeneratedVideo"; // TODO: 依存モジュール不在のため一時無効化
import { SeminarArchivePromo, SEMINAR_ARCHIVE_PROMO_DURATION } from "./SeminarArchivePromo";
import { AETipsVideo, AE_TIPS_VIDEO_DURATION } from "./AETipsVideo";
import { AE3DLayerPromo, AE_3D_LAYER_PROMO_DURATION } from "./AE3DLayerPromo";
import { AETransitionPromo, AE_TRANSITION_PROMO_DURATION } from "./AETransitionPromo";
import {
  AEVisualBrowserPromoNew,
  AEFileCollectorPromoNew,
  DirectGIFExportPromoNew,
  LayerSplitterPromoNew,
  NeoUtilityPromoNew,
  SelectLayerAtPlayheadPromoNew,
  AE_VISUAL_BROWSER_DURATION,
  AE_FILE_COLLECTOR_DURATION,
  DIRECT_GIF_EXPORT_DURATION,
  LAYER_SPLITTER_DURATION,
  NEO_UTILITY_DURATION,
  SELECT_LAYER_AT_PLAYHEAD_DURATION,
} from "./AEScriptsPromo";
import {
  IlScriptsPromo,
  IL_SCRIPTS_PROMO_DURATION,
  RENAME_LAYER_DURATION,
  RENAME_OBJECT_DURATION,
  SEPARATE_TO_LAYERS_DURATION,
  FILLINGER_DURATION,
  MOJI_BUNKAI_DURATION,
  RenameLayerPromo,
  RenameObjectPromo,
  SeparateToLayersPromo,
  FillingerPromo,
  MojiBunkaiPromo,
} from "./IlScriptsPromo";
import { AudioSyncPromo, AUDIO_SYNC_PROMO_DURATION } from "./AudioSyncPromo";
import { RenderToolsProPromo, RENDER_TOOLS_PRO_PROMO_DURATION } from "./RenderToolsProPromo";

const PREMIERE_TOOLS_PROMO_DURATION = 1350; // 45 seconds at 30fps

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* AudioSync 紹介動画 */}
      <Composition
        id="AudioSyncPromo"
        component={AudioSyncPromo}
        durationInFrames={AUDIO_SYNC_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* RenderTools Pro 紹介動画 */}
      <Composition
        id="RenderToolsProPromo"
        component={RenderToolsProPromo}
        durationInFrames={RENDER_TOOLS_PRO_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AEScripts 個別スクリプト動画 (New Standard) */}
      <Composition
        id="AEVisualBrowserPromo"
        component={AEVisualBrowserPromoNew}
        durationInFrames={AE_VISUAL_BROWSER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AEFileCollectorPromo"
        component={AEFileCollectorPromoNew}
        durationInFrames={AE_FILE_COLLECTOR_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DirectGIFExportPromo"
        component={DirectGIFExportPromoNew}
        durationInFrames={DIRECT_GIF_EXPORT_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LayerSplitterPromo"
        component={LayerSplitterPromoNew}
        durationInFrames={LAYER_SPLITTER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NeoUtilityPromo"
        component={NeoUtilityPromoNew}
        durationInFrames={NEO_UTILITY_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SelectLayerAtPlayheadPromo"
        component={SelectLayerAtPlayheadPromoNew}
        durationInFrames={SELECT_LAYER_AT_PLAYHEAD_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AE トランジション超入門講座 告知動画 */}
      <Composition
        id="AETransitionPromo"
        component={AETransitionPromo}
        durationInFrames={AE_TRANSITION_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AE 3Dレイヤー入門講座 告知動画 */}
      <Composition
        id="AE3DLayerPromo"
        component={AE3DLayerPromo}
        durationInFrames={AE_3D_LAYER_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* IlScripts 紹介動画 */}
      <Composition
        id="IlScriptsPromo"
        component={IlScriptsPromo}
        durationInFrames={IL_SCRIPTS_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* IlScripts 個別スクリプト動画 */}
      <Composition
        id="RenameLayerPromo"
        component={RenameLayerPromo}
        durationInFrames={RENAME_LAYER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RenameObjectPromo"
        component={RenameObjectPromo}
        durationInFrames={RENAME_OBJECT_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeparateToLayersPromo"
        component={SeparateToLayersPromo}
        durationInFrames={SEPARATE_TO_LAYERS_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FillingerPromo"
        component={FillingerPromo}
        durationInFrames={FILLINGER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MojiBunkaiPromo"
        component={MojiBunkaiPromo}
        durationInFrames={MOJI_BUNKAI_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* After Effects便利テクニック解説動画 */}
      <Composition
        id="AETipsVideo"
        component={AETipsVideo}
        durationInFrames={AE_TIPS_VIDEO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* セミナーアーカイブ告知動画 */}
      <Composition
        id="SeminarArchivePromo"
        component={SeminarArchivePromo}
        durationInFrames={SEMINAR_ARCHIVE_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* AI自動生成動画テンプレート — 依存モジュール不在のため一時無効化
      <Composition
        id="AIGeneratedVideo"
        component={AIGeneratedVideo}
        durationInFrames={AI_GENERATED_VIDEO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      */}

      <Composition
        id="PremiereToolsPromo"
        component={PremiereToolsPromo}
        durationInFrames={PREMIERE_TOOLS_PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Old AEFileCollectorPromo was removed here */}

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

      {/* MVComposition — モジュール不在のため一時無効化
      <Composition
        id="HighQualityMV"
        component={MVComposition}
        durationInFrames={30 * 150}
        fps={30}
        width={1920}
        height={1080}
      />
      */}

      {/* Old DirectGIFExportPromo was removed here */}

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
