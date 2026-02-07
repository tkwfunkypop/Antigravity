/**
 * PP-Caption - ExtendScript Host
 * 選択テキストレイヤーをマーカー位置に複製
 * 修正版: プロジェクトパネルからテンプレートを検索する方式
 */

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
 * マーカーを挿入
 */
function insertMarkers(jsonStr) {
    try {
        var data = JSON.parse(jsonStr);
        var segments = data.segments || [];
        var settings = data.settings || {};

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ error: "アクティブなシーケンスがありません" });
        }

        var count = 0;

        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            try {
                var marker = seq.markers.createMarker(seg.start);
                marker.name = seg.text;
                marker.comments = "End:" + seg.end.toFixed(3);
                marker.end = seg.end;
                marker.setColorByIndex(1);
                count++;
            } catch (e) {
                $.writeln("[PP-Caption] Marker error: " + e.toString());
            }
        }

        return JSON.stringify({
            success: true,
            count: count,
            message: count + " 個のマーカーを挿入"
        });

    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
}

/**
 * 選択中のテキストレイヤーをマーカー位置に複製
 * 方式: 選択クリップをコピーし、マーカー位置にペースト
 */
function duplicateSelectedToMarkers(jsonStr) {
    try {
        var data = {};
        try { data = JSON.parse(jsonStr); } catch (e) { }

        var settings = data.settings || {};
        var trackIndex = (settings.trackIndex || 2) - 1;

        var seq = app.project.activeSequence;
        if (!seq) {
            return JSON.stringify({ error: "アクティブなシーケンスがありません" });
        }

        // QE DOMを有効化
        try {
            app.enableQE();
        } catch (e) { }

        var qeSeq = null;
        try {
            qeSeq = qe.project.getActiveSequence();
        } catch (e) { }

        // 選択中のクリップを取得
        var selectedClip = null;
        var selectedTrackIndex = -1;
        var videoTracks = seq.videoTracks;

        for (var v = 0; v < videoTracks.numTracks; v++) {
            var track = videoTracks[v];
            for (var c = 0; c < track.clips.numItems; c++) {
                var clip = track.clips[c];
                try {
                    if (clip.isSelected()) {
                        selectedClip = clip;
                        selectedTrackIndex = v;
                        break;
                    }
                } catch (e) { }
            }
            if (selectedClip) break;
        }

        if (!selectedClip) {
            return JSON.stringify({
                error: "テキストレイヤーが選択されていません\n\nタイムラインでテキストレイヤーをクリックして選択してください"
            });
        }

        // マーカーを取得
        var markers = seq.markers;
        if (markers.numMarkers === 0) {
            return JSON.stringify({ error: "マーカーがありません\n\n先に「マーカー挿入」を実行してください" });
        }

        // マーカー情報を収集
        var markerList = [];
        var marker = markers.getFirstMarker();
        while (marker) {
            var markerStart = marker.start.seconds;
            var markerEnd = marker.end.seconds;
            var markerName = marker.name || "";

            var endMatch = (marker.comments || "").match(/End:([\d.]+)/);
            if (endMatch) {
                markerEnd = parseFloat(endMatch[1]);
            }

            markerList.push({
                start: markerStart,
                end: markerEnd,
                name: markerName
            });

            marker = markers.getNextMarker(marker);
        }

        // 選択クリップの情報を取得
        var clipDuration = selectedClip.end.seconds - selectedClip.start.seconds;
        var clipProjectItem = selectedClip.projectItem;

        // プロジェクトアイテムがない場合は、プロジェクトパネルから検索
        if (!clipProjectItem) {
            clipProjectItem = findProjectItemByName(selectedClip.name);
        }

        if (!clipProjectItem) {
            return JSON.stringify({
                error: "テンプレートが見つかりません\n\n選択したテキストをプロジェクトパネルにドラッグして保存してから再試行してください"
            });
        }

        var targetTrack = videoTracks[trackIndex];
        if (!targetTrack) {
            return JSON.stringify({ error: "トラック V" + (trackIndex + 1) + " がありません" });
        }

        var ticksPerSecond = 254016000000;
        var count = 0;

        // マーカー位置にクリップを挿入
        for (var m = 0; m < markerList.length; m++) {
            var markerInfo = markerList[m];
            var startTicks = Math.round(markerInfo.start * ticksPerSecond);
            var duration = markerInfo.end - markerInfo.start;
            var endTicks = Math.round(markerInfo.end * ticksPerSecond);
            var text = markerInfo.name || "";

            try {
                targetTrack.insertClip(clipProjectItem, startTicks);

                // 挿入したクリップを見つけて設定
                for (var c = targetTrack.clips.numItems - 1; c >= 0; c--) {
                    var insertedClip = targetTrack.clips[c];
                    if (Math.abs(insertedClip.start.ticks - startTicks) < ticksPerSecond * 0.5) {
                        // 長さを調整
                        try {
                            var newEnd = new Time();
                            newEnd.ticks = endTicks;
                            insertedClip.end = newEnd;
                        } catch (e) { }

                        // クリップ名を設定
                        try {
                            insertedClip.name = text.substring(0, 50);
                        } catch (e) { }

                        count++;
                        break;
                    }
                }
            } catch (e) {
                $.writeln("[PP-Caption] Insert error: " + e.toString());
            }
        }

        if (count === 0) {
            return JSON.stringify({
                error: "クリップを挿入できませんでした\n\nテキストをプロジェクトパネルに保存してから再試行してください"
            });
        }

        return JSON.stringify({
            success: true,
            count: count,
            message: count + " 個のテキストレイヤーを複製"
        });

    } catch (e) {
        return JSON.stringify({ error: "エラー: " + e.toString() });
    }
}

/**
 * プロジェクトパネルからアイテムを名前で検索
 */
function findProjectItemByName(name) {
    try {
        var rootItem = app.project.rootItem;
        return searchProjectItem(rootItem, name);
    } catch (e) {
        return null;
    }
}

function searchProjectItem(item, name) {
    if (!item.children) return null;

    var searchName = name.toLowerCase();

    for (var i = 0; i < item.children.numItems; i++) {
        var child = item.children[i];

        if (child.name.toLowerCase().indexOf(searchName) !== -1 ||
            searchName.indexOf(child.name.toLowerCase()) !== -1) {
            if (child.type === ProjectItemType.CLIP) {
                return child;
            }
        }

        if (child.type === ProjectItemType.BIN) {
            var found = searchProjectItem(child, name);
            if (found) return found;
        }
    }

    // テキストテンプレートも検索
    var keywords = ["texttemplate", "template", "テンプレート", "text"];
    for (var k = 0; k < keywords.length; k++) {
        for (var j = 0; j < item.children.numItems; j++) {
            var child2 = item.children[j];
            if (child2.name.toLowerCase().indexOf(keywords[k]) !== -1) {
                if (child2.type === ProjectItemType.CLIP) {
                    // PSD/画像ファイルは除外
                    var mediaPath = "";
                    try { mediaPath = child2.getMediaPath() || ""; } catch (e) { }
                    if (mediaPath.toLowerCase().indexOf(".psd") === -1 &&
                        mediaPath.toLowerCase().indexOf(".png") === -1 &&
                        mediaPath.toLowerCase().indexOf(".jpg") === -1) {
                        return child2;
                    }
                }
            }
        }
    }

    return null;
}

/**
 * テキストテンプレートの存在を確認
 */
function checkTextTemplate() {
    try {
        var template = findGraphicsTextTemplate();
        if (template) {
            return JSON.stringify({ found: true, name: template.name });
        } else {
            return JSON.stringify({ found: false, name: "" });
        }
    } catch (e) {
        return JSON.stringify({ found: false, name: "" });
    }
}

function findGraphicsTextTemplate() {
    try {
        return findProjectItemByName("template");
    } catch (e) {
        return null;
    }
}
