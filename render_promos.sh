#!/bin/bash
set -e

cd /Users/takahashikenta/projects/remotion-video

echo "======================================"
echo " Starting Remotion MP4 Renders  "
echo "======================================"

echo "Rendering AEVisualBrowserPromo..."
npx remotion render AEVisualBrowserPromo out/AEVisualBrowserPromo.mp4
cp out/AEVisualBrowserPromo.mp4 ../AfterEffects/AE-VisualBrowser/

echo "Rendering AEFileCollectorPromo..."
npx remotion render AEFileCollectorPromo out/AEFileCollectorPromo.mp4
cp out/AEFileCollectorPromo.mp4 ../AfterEffects/AEFileCollector/

echo "Rendering AEFileCollectorPromo3D..."
npx remotion render AEFileCollectorPromo3D out/AEFileCollectorPromo3D.mp4
cp out/AEFileCollectorPromo3D.mp4 ../AfterEffects/AEFileCollector/

echo "Rendering DirectGIFExportPromo..."
npx remotion render DirectGIFExportPromo out/DirectGIFExportPromo.mp4
cp out/DirectGIFExportPromo.mp4 ../AfterEffects/DirectGIFExport/

echo "Rendering IlScriptsPromo (Suite)..."
npx remotion render IlScriptsPromo out/IlScriptsPromo.mp4
cp out/IlScriptsPromo.mp4 ../Illustrator/IlScripts/

echo "Rendering IlScripts individual promos..."
for script in RenameLayerPromo RenameObjectPromo SeparateToLayersPromo FillingerPromo MojiBunkaiPromo; do
    echo "Rendering $script..."
    npx remotion render $script out/$script.mp4
    cp out/$script.mp4 ../Illustrator/IlScripts/
done

echo "======================================"
echo " All renders complete! "
echo "======================================"
