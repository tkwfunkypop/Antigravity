/**
 * PP-AutoCut - ExtendScript Host
 * カット区間を正確に分割して削除
 */

/**
 * 分析用にクリップ情報を取得
 */
function getClipsForAnalysis() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ error: "アクティブなシーケンスがありません" });
        }

        var clips = [];
        var selectedClips = [];

        // オーディオトラックをチェック
        var audioTracks = seq.audioTracks;
        for (var a = 0; a < audioTracks.numTracks; a++) {
            var track = audioTracks[a];
            for (var c = 0; c < track.clips.numItems; c++) {
                var clip = track.clips[c];
                var projectItem = clip.projectItem;
                if (projectItem && projectItem.getMediaPath) {
                    var mediaPath = projectItem.getMediaPath();
                    if (mediaPath) {
                        var clipInfo = {
                            path: mediaPath,
                            name: projectItem.name || "Unknown",
                            timeline_start: clip.start.seconds,
                            timeline_end: clip.end.seconds,
                            source_in: clip.inPoint.seconds,
                            source_out: clip.outPoint.seconds
                        };
                        clips.push(clipInfo);
                        if (clip.isSelected()) selectedClips.push(clipInfo);
                    }
                }
            }
        }

        // ビデオトラックもチェック
        var videoTracks = seq.videoTracks;
        for (var v = 0; v < videoTracks.numTracks; v++) {
            var vTrack = videoTracks[v];
            for (var vc = 0; vc < vTrack.clips.numItems; vc++) {
                var vClip = vTrack.clips[vc];
                var vProjectItem = vClip.projectItem;
                if (vProjectItem && vProjectItem.getMediaPath) {
                    var vMediaPath = vProjectItem.getMediaPath();
                    if (vMediaPath) {
                        var exists = false;
                        for (var i = 0; i < clips.length; i++) {
                            if (clips[i].path === vMediaPath) { exists = true; break; }
                        }
                        if (!exists) {
                            var vClipInfo = {
                                path: vMediaPath,
                                name: vProjectItem.name || "Unknown",
                                timeline_start: vClip.start.seconds,
                                timeline_end: vClip.end.seconds,
                                source_in: vClip.inPoint.seconds,
                                source_out: vClip.outPoint.seconds
                            };
                            clips.push(vClipInfo);
                            if (vClip.isSelected()) selectedClips.push(vClipInfo);
                        }
                    }
                }
            }
        }

        var targetClips = selectedClips.length > 0 ? selectedClips : clips;
        if (targetClips.length === 0) {
            return JSON.stringify({ error: "クリップが見つかりません" });
        }

        return JSON.stringify({
            success: true,
            audio_path: targetClips[0].path,
            source_in: targetClips[0].source_in,
            source_out: targetClips[0].source_out,
            timeline_start: targetClips[0].timeline_start
        });

    } catch (e) {
        return JSON.stringify({ error: "getClipsForAnalysis: " + e.toString() });
    }
}

/**
 * タイミングファイルを選択
 */
function browseTimingFile() {
    try {
        var file = File.openDialog("タイミングファイルを選択", "*.srt;*.txt;*.json");
        if (!file) return JSON.stringify({ error: "キャンセル" });

        file.encoding = "UTF-8";
        file.open("r");
        var content = file.read();
        file.close();

        return JSON.stringify({
            success: true,
            path: file.fsName,
            content: content,
            extension: file.name.split('.').pop().toLowerCase()
        });
    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
}

/**
 * カット実行（正確な区間のみ削除）
 */
function executeCuts(jsonStr) {
    try {
        var data = JSON.parse(jsonStr);
        var regions = data.regions || [];

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ error: "アクティブなシーケンスがありません" });
        }

        // QE DOMを有効化
        try {
            if (typeof app.enableQE === "function") {
                app.enableQE();
            }
        } catch (e) { }

        // 後ろから順にソート（タイムラインずれ防止）
        regions.sort(function (a, b) { return b.start - a.start; });

        var cutCount = 0;
        var deleteCount = 0;
        var ticksPerSecond = 254016000000;

        $.writeln("[AutoCut] ========================================");
        $.writeln("[AutoCut] Processing " + regions.length + " regions");

        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            var startSec = region.start;
            var endSec = region.end;
            var startTicks = Math.round(startSec * ticksPerSecond);
            var endTicks = Math.round(endSec * ticksPerSecond);

            $.writeln("[AutoCut] ----------------------------------------");
            $.writeln("[AutoCut] Region " + (i + 1) + ": " + startSec.toFixed(3) + "s - " + endSec.toFixed(3) + "s");

            // ステップ1: まずレーザーカットを実行（開始点と終了点）
            razorAllTracks(seq, startTicks);
            razorAllTracks(seq, endTicks);
            $.writeln("[AutoCut] Razor cuts applied");

            // ステップ2: カット後のクリップを検索して削除
            // 重要: カット後に生成された「区間内に完全に収まるクリップ」のみを削除
            var deleted = deleteClipsInExactRange(seq, startTicks, endTicks, ticksPerSecond);
            deleteCount += deleted;

            if (deleted > 0) {
                cutCount++;
                $.writeln("[AutoCut] Deleted " + deleted + " clips");
            } else {
                $.writeln("[AutoCut] No clips found in this exact range");
            }
        }

        $.writeln("[AutoCut] ========================================");
        $.writeln("[AutoCut] Total: " + cutCount + " regions, " + deleteCount + " clips deleted");

        return JSON.stringify({
            success: true,
            cut_count: cutCount,
            delete_count: deleteCount,
            message: deleteCount + " 個のクリップを削除（" + cutCount + " 区間）"
        });

    } catch (e) {
        $.writeln("[AutoCut] Error: " + e.toString());
        return JSON.stringify({ error: e.toString() });
    }
}

/**
 * 指定した正確な範囲内のクリップのみを削除
 * クリップの開始と終了が両方とも範囲内に収まっている場合のみ削除
 */
function deleteClipsInExactRange(seq, startTicks, endTicks, ticksPerSecond) {
    var deletedCount = 0;
    var tolerance = ticksPerSecond * 0.05; // 50ms の許容誤差

    // 削除対象を収集（削除中にインデックスが変わるため）
    var toDelete = [];

    // ビデオトラック
    for (var v = 0; v < seq.videoTracks.numTracks; v++) {
        var vTrack = seq.videoTracks[v];
        for (var vc = 0; vc < vTrack.clips.numItems; vc++) {
            var vClip = vTrack.clips[vc];
            var clipStart = vClip.start.ticks;
            var clipEnd = vClip.end.ticks;

            // クリップがカット区間内に「完全に」収まっているか確認
            // 開始が区間開始と同じ（誤差許容）かつ 終了が区間終了と同じ（誤差許容）
            var isInRange = (
                Math.abs(clipStart - startTicks) < tolerance &&
                Math.abs(clipEnd - endTicks) < tolerance
            );

            $.writeln("[AutoCut] V" + (v + 1) + " clip: " + (clipStart / ticksPerSecond).toFixed(3) + "s - " + (clipEnd / ticksPerSecond).toFixed(3) + "s, inRange=" + isInRange);

            if (isInRange) {
                toDelete.push(vClip);
            }
        }
    }

    // オーディオトラック
    for (var a = 0; a < seq.audioTracks.numTracks; a++) {
        var aTrack = seq.audioTracks[a];
        for (var ac = 0; ac < aTrack.clips.numItems; ac++) {
            var aClip = aTrack.clips[ac];
            var aClipStart = aClip.start.ticks;
            var aClipEnd = aClip.end.ticks;

            var aIsInRange = (
                Math.abs(aClipStart - startTicks) < tolerance &&
                Math.abs(aClipEnd - endTicks) < tolerance
            );

            $.writeln("[AutoCut] A" + (a + 1) + " clip: " + (aClipStart / ticksPerSecond).toFixed(3) + "s - " + (aClipEnd / ticksPerSecond).toFixed(3) + "s, inRange=" + aIsInRange);

            if (aIsInRange) {
                toDelete.push(aClip);
            }
        }
    }

    // 削除実行
    for (var d = 0; d < toDelete.length; d++) {
        try {
            toDelete[d].remove(false, false);
            deletedCount++;
        } catch (e) {
            $.writeln("[AutoCut] Remove error: " + e.toString());
        }
    }

    return deletedCount;
}

/**
 * 全トラックでレーザーカット
 */
function razorAllTracks(seq, timeTicks) {
    for (var v = 0; v < seq.videoTracks.numTracks; v++) {
        try {
            seq.videoTracks[v].razorClipAtTime(timeTicks);
        } catch (e) { }
    }

    for (var a = 0; a < seq.audioTracks.numTracks; a++) {
        try {
            seq.audioTracks[a].razorClipAtTime(timeTicks);
        } catch (e) { }
    }
}
