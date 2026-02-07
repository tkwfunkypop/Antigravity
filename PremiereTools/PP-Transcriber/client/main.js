/**
 * PP-Transcriber - Main Client Script
 * 高精度文字起こし専用拡張機能
 */

(function () {
    'use strict';

    // Configuration
    var API_URL = 'http://localhost:5050';
    var csInterface = new CSInterface();

    // State
    var transcriptionResult = null;
    var isProcessing = false;

    // DOM Elements
    var elements = {};

    // Initialize
    document.addEventListener('DOMContentLoaded', function () {
        initElements();
        initEventListeners();
        loadSettings();
        updateClipInfo();
    });

    function initElements() {
        elements.statusBar = document.getElementById('statusBar');
        elements.statusText = document.getElementById('statusText');
        elements.clipName = document.getElementById('clipName');
        elements.btnTranscribe = document.getElementById('btnTranscribe');
        elements.resultSection = document.getElementById('resultSection');
        elements.resultContent = document.getElementById('resultContent');
        elements.resultStats = document.getElementById('resultStats');
        elements.btnExportSRT = document.getElementById('btnExportSRT');
        elements.btnExportTXT = document.getElementById('btnExportTXT');
        elements.btnExportJSON = document.getElementById('btnExportJSON');
        elements.language = document.getElementById('language');
        elements.serverUrl = document.getElementById('serverUrl');
    }

    function initEventListeners() {
        elements.btnTranscribe.addEventListener('click', startTranscription);
        elements.btnExportSRT.addEventListener('click', function () { exportResult('srt'); });
        elements.btnExportTXT.addEventListener('click', function () { exportResult('txt'); });
        elements.btnExportJSON.addEventListener('click', function () { exportResult('json'); });
        elements.serverUrl.addEventListener('change', saveSettings);
        elements.language.addEventListener('change', saveSettings);
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('pp-transcriber-settings');
            if (saved) {
                var settings = JSON.parse(saved);
                if (settings.serverUrl) elements.serverUrl.value = settings.serverUrl;
                if (settings.language) elements.language.value = settings.language;
                API_URL = settings.serverUrl || API_URL;
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    function saveSettings() {
        try {
            var settings = {
                serverUrl: elements.serverUrl.value,
                language: elements.language.value
            };
            localStorage.setItem('pp-transcriber-settings', JSON.stringify(settings));
            API_URL = settings.serverUrl;
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
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

    function updateClipInfo() {
        csInterface.evalScript('getSelectedClipInfo()', function (result) {
            try {
                var info = JSON.parse(result);
                if (info.error) {
                    elements.clipName.textContent = 'なし';
                } else if (info.clips && info.clips.length > 0) {
                    var count = info.clips.length;
                    var name = info.clips[0].name || 'クリップ';
                    elements.clipName.textContent = count > 1
                        ? name + ' 他 ' + (count - 1) + '件'
                        : name;
                } else {
                    elements.clipName.textContent = info.name || '選択中';
                }
            } catch (e) {
                elements.clipName.textContent = '取得エラー';
            }
        });
    }

    function startTranscription() {
        if (isProcessing) return;

        isProcessing = true;
        elements.btnTranscribe.disabled = true;
        elements.resultSection.style.display = 'none';
        updateStatus('クリップ情報を取得中...', 'processing');

        // Step 1: Get clip info from Premiere
        csInterface.evalScript('getSelectedClipInfo()', function (result) {
            try {
                var clipInfo = JSON.parse(result);

                if (clipInfo.error) {
                    handleError(clipInfo.error);
                    return;
                }

                updateStatus('サーバーに接続中...', 'processing');

                // Step 2: Send to server for transcription
                var requestBody = {
                    clips: clipInfo.clips || [{
                        path: clipInfo.audio_path,
                        source_in: clipInfo.source_in,
                        source_out: clipInfo.source_out,
                        timeline_start: clipInfo.timeline_start || 0
                    }],
                    language: elements.language.value
                };

                fetch(API_URL + '/api/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                })
                    .then(function (response) {
                        if (!response.ok) throw new Error('サーバーエラー: ' + response.status);
                        return response.json();
                    })
                    .then(function (data) {
                        if (data.error) throw new Error(data.error);

                        transcriptionResult = data;
                        displayResult(data);
                        updateStatus('文字起こし完了', 'success');
                    })
                    .catch(function (error) {
                        handleError(error.message);
                    })
                    .finally(function () {
                        isProcessing = false;
                        elements.btnTranscribe.disabled = false;
                    });

            } catch (e) {
                handleError('クリップ情報の解析に失敗: ' + e.message);
            }
        });
    }

    function displayResult(data) {
        elements.resultSection.style.display = 'block';
        elements.resultContent.textContent = data.text || '';

        var segmentCount = data.segments ? data.segments.length : 0;
        var clipCount = data.clips_processed || 1;
        elements.resultStats.textContent = clipCount + 'クリップ / ' + segmentCount + 'セグメント';
    }

    function handleError(message) {
        updateStatus(message, 'error');
        isProcessing = false;
        elements.btnTranscribe.disabled = false;
    }

    function exportResult(format) {
        if (!transcriptionResult) {
            updateStatus('エクスポートする結果がありません', 'warning');
            return;
        }

        var content = '';
        var extension = format;

        switch (format) {
            case 'srt':
                content = generateSRT(transcriptionResult.segments || []);
                break;
            case 'txt':
                content = transcriptionResult.text || '';
                break;
            case 'json':
                content = JSON.stringify(transcriptionResult, null, 2);
                break;
        }

        // Save file via ExtendScript
        csInterface.evalScript('saveTextFile("' + escapeString(content) + '", "' + extension + '")', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    updateStatus(format.toUpperCase() + 'をエクスポートしました', 'success');
                } else {
                    updateStatus('エクスポート失敗: ' + (res.error || '不明なエラー'), 'error');
                }
            } catch (e) {
                updateStatus('エクスポート処理エラー', 'error');
            }
        });
    }

    function generateSRT(segments) {
        var srt = '';
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            srt += (i + 1) + '\n';
            srt += formatSRTTime(seg.start) + ' --> ' + formatSRTTime(seg.end) + '\n';
            srt += seg.text + '\n\n';
        }
        return srt;
    }

    function formatSRTTime(seconds) {
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        var ms = Math.floor((seconds % 1) * 1000);
        return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ',' + pad(ms, 3);
    }

    function pad(num, size) {
        var s = '000' + num;
        return s.substr(s.length - size);
    }

    function escapeString(str) {
        return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

})();
