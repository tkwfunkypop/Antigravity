/**
 * PP-Transcriber - ExtendScript Host
 * Premiere Pro 用の文字起こし専用拡張機能
 */

/**
 * 選択中のクリップ情報を取得
 */
function getSelectedClipInfo() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ error: "アクティブなシーケンスがありません" });
        }

        var clips = [];
        var allClips = [];
        var selectedClips = [];
        var ticksPerSecond = 254016000000;

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
                            source_out: clip.outPoint.seconds,
                            type: "audio"
                        };
                        allClips.push(clipInfo);
                        if (clip.isSelected()) {
                            selectedClips.push(clipInfo);
                        }
                    }
                }
            }
        }

        // ビデオトラックをチェック（オーディオ付き）
        var videoTracks = seq.videoTracks;
        for (var v = 0; v < videoTracks.numTracks; v++) {
            var vTrack = videoTracks[v];
            for (var vc = 0; vc < vTrack.clips.numItems; vc++) {
                var vClip = vTrack.clips[vc];
                var vProjectItem = vClip.projectItem;
                if (vProjectItem && vProjectItem.getMediaPath) {
                    var vMediaPath = vProjectItem.getMediaPath();
                    if (vMediaPath) {
                        // 重複チェック
                        var alreadyAdded = false;
                        for (var i = 0; i < allClips.length; i++) {
                            if (allClips[i].path === vMediaPath &&
                                allClips[i].timeline_start === vClip.start.seconds) {
                                alreadyAdded = true;
                                break;
                            }
                        }
                        if (!alreadyAdded) {
                            var vClipInfo = {
                                path: vMediaPath,
                                name: vProjectItem.name || "Unknown",
                                timeline_start: vClip.start.seconds,
                                timeline_end: vClip.end.seconds,
                                source_in: vClip.inPoint.seconds,
                                source_out: vClip.outPoint.seconds,
                                type: "video"
                            };
                            allClips.push(vClipInfo);
                            if (vClip.isSelected()) {
                                selectedClips.push(vClipInfo);
                            }
                        }
                    }
                }
            }
        }

        // 選択クリップがあれば選択のみ、なければ全クリップ
        clips = selectedClips.length > 0 ? selectedClips : allClips;

        if (clips.length === 0) {
            return JSON.stringify({ error: "クリップが見つかりません" });
        }

        // タイムライン順にソート
        clips.sort(function (a, b) {
            return a.timeline_start - b.timeline_start;
        });

        return JSON.stringify({
            success: true,
            clips: clips,
            selection_mode: selectedClips.length > 0,
            audio_path: clips[0].path,
            name: clips[0].name,
            source_in: clips[0].source_in,
            source_out: clips[0].source_out,
            timeline_start: clips[0].timeline_start
        });

    } catch (e) {
        return JSON.stringify({ error: "getSelectedClipInfo: " + e.toString() });
    }
}

/**
 * テキストファイルを保存（ファイル選択ダイアログを表示）
 */
function saveTextFile(content, extension) {
    try {
        var file = File.saveDialog("保存先を選択", "*." + extension);
        if (!file) {
            return JSON.stringify({ error: "キャンセルされました" });
        }

        // 拡張子を確認・追加
        if (file.name.indexOf("." + extension) === -1) {
            file = new File(file.fsName + "." + extension);
        }

        file.encoding = "UTF-8";
        file.open("w");
        file.write(content);
        file.close();

        return JSON.stringify({
            success: true,
            path: file.fsName
        });

    } catch (e) {
        return JSON.stringify({ error: "saveTextFile: " + e.toString() });
    }
}
