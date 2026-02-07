/**
 * PP-AutoCut - Main Client Script
 * ワンクリック自動カット拡張機能
 */

(function () {
    'use strict';

    var csInterface = new CSInterface();
    var API_URL = 'http://localhost:5050';
    var segments = [];
    var cutRegions = [];
    var isProcessing = false;

    var elements = {};

    document.addEventListener('DOMContentLoaded', function () {
        initElements();
        initEventListeners();
        loadSettings();
    });

    function initElements() {
        elements.statusBar = document.getElementById('statusBar');
        elements.statusText = document.getElementById('statusText');
        elements.btnAutocut = document.getElementById('btnAutocut');
        elements.filePath = document.getElementById('filePath');
        elements.btnBrowse = document.getElementById('btnBrowse');
        elements.btnCutFromFile = document.getElementById('btnCutFromFile');
        elements.silenceThreshold = document.getElementById('silenceThreshold');
        elements.serverUrl = document.getElementById('serverUrl');
        elements.previewSection = document.getElementById('previewSection');
        elements.cutList = document.getElementById('cutList');
        elements.cutStats = document.getElementById('cutStats');
    }

    function initEventListeners() {
        elements.btnAutocut.addEventListener('click', runAutocut);
        elements.btnBrowse.addEventListener('click', browseFile);
        elements.btnCutFromFile.addEventListener('click', cutFromFile);
        elements.serverUrl.addEventListener('change', saveSettings);
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('pp-autocut-settings');
            if (saved) {
                var settings = JSON.parse(saved);
                if (settings.serverUrl) elements.serverUrl.value = settings.serverUrl;
                if (settings.silenceThreshold) elements.silenceThreshold.value = settings.silenceThreshold;
                API_URL = settings.serverUrl || API_URL;
            }
        } catch (e) { }
    }

    function saveSettings() {
        try {
            localStorage.setItem('pp-autocut-settings', JSON.stringify({
                serverUrl: elements.serverUrl.value,
                silenceThreshold: elements.silenceThreshold.value
            }));
            API_URL = elements.serverUrl.value;
        } catch (e) { }
    }

    function updateStatus(message, type) {
        var icons = {
            ready: '📋',
            processing: '⏳',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        elements.statusText.textContent = message;
        elements.statusBar.querySelector('.status-icon').textContent = icons[type] || '📋';
        if (type === 'processing') {
            elements.statusBar.classList.add('processing');
        } else {
            elements.statusBar.classList.remove('processing');
        }
    }

    /**
     * ワンクリック自動カット
     * 1. クリップ情報を取得
     * 2. サーバーで文字起こし・無音検出
     * 3. 自動でカット実行
     */
    function runAutocut() {
        if (isProcessing) return;
        isProcessing = true;
        elements.btnAutocut.disabled = true;

        updateStatus('クリップ情報を取得中...', 'processing');

        // Step 1: Get clip info from Premiere
        csInterface.evalScript('getClipsForAnalysis()', function (result) {
            try {
                var clipInfo = JSON.parse(result);
                if (clipInfo.error) {
                    handleError(clipInfo.error);
                    return;
                }

                updateStatus('音声を分析中...', 'processing');

                // Step 2: Send to server for smart analysis
                var threshold = parseFloat(elements.silenceThreshold.value) || 0.5;

                fetch(API_URL + '/api/smartcut', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audio_path: clipInfo.audio_path,
                        source_in: clipInfo.source_in,
                        source_out: clipInfo.source_out,
                        volume_threshold: 0.3,
                        min_gap_duration: threshold
                    })
                })
                    .then(function (response) {
                        if (!response.ok) throw new Error('サーバーエラー: ' + response.status);
                        return response.json();
                    })
                    .then(function (data) {
                        if (data.error) throw new Error(data.error);

                        var silenceRegions = data.silence_regions || [];
                        if (silenceRegions.length === 0) {
                            updateStatus('カットする無音区間がありませんでした', 'success');
                            isProcessing = false;
                            elements.btnAutocut.disabled = false;
                            return;
                        }

                        updateStatus('カット実行中... (' + silenceRegions.length + ' 区間)', 'processing');

                        // Step 3: Execute cuts
                        var cutData = JSON.stringify({ regions: silenceRegions });
                        csInterface.evalScript('executeCuts(\'' + escapeString(cutData) + '\')', function (cutResult) {
                            try {
                                var res = JSON.parse(cutResult);
                                if (res.success) {
                                    displayResults(silenceRegions, res.cut_count, res.marker_count);
                                    updateStatus('完了: ' + res.cut_count + ' 区間をカット', 'success');
                                } else {
                                    handleError(res.error || 'カット失敗');
                                }
                            } catch (e) {
                                handleError('カット処理エラー: ' + e.message);
                            }
                            isProcessing = false;
                            elements.btnAutocut.disabled = false;
                        });
                    })
                    .catch(function (error) {
                        handleError(error.message);
                        isProcessing = false;
                        elements.btnAutocut.disabled = false;
                    });

            } catch (e) {
                handleError('クリップ情報の解析エラー: ' + e.message);
                isProcessing = false;
                elements.btnAutocut.disabled = false;
            }
        });
    }

    function handleError(message) {
        updateStatus(message, 'error');
    }

    function displayResults(regions, cutCount, markerCount) {
        elements.previewSection.style.display = 'block';
        elements.cutList.innerHTML = '';

        var totalDuration = 0;
        var maxDisplay = 10;

        for (var i = 0; i < Math.min(regions.length, maxDisplay); i++) {
            var region = regions[i];
            totalDuration += region.duration || (region.end - region.start);

            var item = document.createElement('div');
            item.className = 'cut-item';
            item.innerHTML =
                '<span class="cut-time">' + formatTime(region.start) + ' - ' + formatTime(region.end) + '</span>' +
                '<span class="cut-duration">' + (region.duration || (region.end - region.start)).toFixed(1) + 's</span>';
            elements.cutList.appendChild(item);
        }

        if (regions.length > maxDisplay) {
            var more = document.createElement('div');
            more.className = 'more';
            more.textContent = '... 他 ' + (regions.length - maxDisplay) + ' 区間';
            elements.cutList.appendChild(more);
        }

        elements.cutStats.textContent = cutCount + ' 区間カット / ' + totalDuration.toFixed(1) + '秒削減';
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // ファイルからカット
    function browseFile() {
        csInterface.evalScript('browseTimingFile()', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    elements.filePath.value = res.path;
                    parseFile(res.content, res.extension);
                    updateStatus('ファイルを読み込みました', 'success');
                } else if (res.error) {
                    updateStatus(res.error, 'error');
                }
            } catch (e) {
                updateStatus('ファイル読み込みエラー', 'error');
            }
        });
    }

    function parseFile(content, extension) {
        segments = [];
        cutRegions = [];

        switch (extension.toLowerCase()) {
            case 'srt':
                segments = parseSRT(content);
                break;
            case 'txt':
                segments = parseTXT(content);
                break;
            case 'json':
                segments = parseJSON(content);
                break;
        }

        if (segments.length > 0) {
            calculateCutRegions();
        }
    }

    function parseSRT(content) {
        var result = [];
        var blocks = content.trim().split(/\n\n+/);
        for (var i = 0; i < blocks.length; i++) {
            var lines = blocks[i].split('\n');
            if (lines.length >= 2) {
                var timeLine = lines.length >= 3 ? lines[1] : lines[0];
                var match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                if (match) {
                    var start = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
                    var end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
                    result.push({ start: start, end: end });
                }
            }
        }
        return result;
    }

    function parseTXT(content) {
        var result = [];
        var lines = content.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var match = lines[i].match(/^([\d.:,]+)\s*[-–]\s*([\d.:,]+)/);
            if (match) {
                result.push({ start: parseTimeString(match[1]), end: parseTimeString(match[2]) });
            }
        }
        return result;
    }

    function parseJSON(content) {
        try {
            var data = JSON.parse(content);
            var segs = data.segments || data.words || data;
            var result = [];
            if (Array.isArray(segs)) {
                for (var i = 0; i < segs.length; i++) {
                    if (segs[i].start !== undefined && segs[i].end !== undefined) {
                        result.push({ start: segs[i].start, end: segs[i].end });
                    }
                }
            }
            return result;
        } catch (e) { return []; }
    }

    function parseTimeString(timeStr) {
        if (timeStr.indexOf(':') !== -1) {
            var parts = timeStr.replace(',', '.').split(':');
            if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        }
        return parseFloat(timeStr);
    }

    function calculateCutRegions() {
        cutRegions = [];
        var threshold = parseFloat(elements.silenceThreshold.value) || 0.5;
        segments.sort(function (a, b) { return a.start - b.start; });
        for (var i = 1; i < segments.length; i++) {
            var gap = segments[i].start - segments[i - 1].end;
            if (gap >= threshold) {
                cutRegions.push({
                    start: segments[i - 1].end,
                    end: segments[i].start,
                    duration: gap
                });
            }
        }
    }

    function cutFromFile() {
        if (cutRegions.length === 0) {
            updateStatus('カットする区間がありません', 'warning');
            return;
        }

        if (isProcessing) return;
        isProcessing = true;
        elements.btnCutFromFile.disabled = true;
        updateStatus('カット実行中...', 'processing');

        var data = JSON.stringify({ regions: cutRegions });
        csInterface.evalScript('executeCuts(\'' + escapeString(data) + '\')', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    displayResults(cutRegions, res.cut_count, res.marker_count);
                    updateStatus('完了: ' + res.cut_count + ' 区間をカット', 'success');
                } else {
                    updateStatus(res.error || 'カット失敗', 'error');
                }
            } catch (e) {
                updateStatus('エラー: ' + e.message, 'error');
            } finally {
                isProcessing = false;
                elements.btnCutFromFile.disabled = false;
            }
        });
    }

    function escapeString(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

})();
