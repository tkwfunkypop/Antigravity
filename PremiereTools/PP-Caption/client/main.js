/**
 * PP-Caption - Main Client Script
 * マーカーから選択テキストレイヤーを複製
 */

(function () {
    'use strict';

    var csInterface = new CSInterface();
    var segments = [];
    var isProcessing = false;
    var templateType = 'landscape';
    var markersInserted = false;

    var elements = {};

    document.addEventListener('DOMContentLoaded', function () {
        initElements();
        initEventListeners();
    });

    function initElements() {
        elements.statusBar = document.getElementById('statusBar');
        elements.statusText = document.getElementById('statusText');
        elements.filePath = document.getElementById('filePath');
        elements.btnBrowse = document.getElementById('btnBrowse');
        elements.trackIndex = document.getElementById('trackIndex');
        elements.fontSize = document.getElementById('fontSize');
        elements.fontFamily = document.getElementById('fontFamily');
        elements.position = document.getElementById('position');
        elements.btnInsertMarkers = document.getElementById('btnInsertMarkers');
        elements.btnDuplicateFromMarkers = document.getElementById('btnDuplicateFromMarkers');
        elements.previewSection = document.getElementById('previewSection');
        elements.captionList = document.getElementById('captionList');
        elements.captionStats = document.getElementById('captionStats');
        elements.btnLandscape = document.getElementById('btnLandscape');
        elements.btnShort = document.getElementById('btnShort');
        elements.step1Status = document.getElementById('step1Status');
        elements.step2Status = document.getElementById('step2Status');
        elements.step3Status = document.getElementById('step3Status');
        elements.step4Status = document.getElementById('step4Status');
    }

    function initEventListeners() {
        elements.btnBrowse.addEventListener('click', browseFile);
        elements.btnInsertMarkers.addEventListener('click', insertMarkers);
        elements.btnDuplicateFromMarkers.addEventListener('click', duplicateFromMarkers);

        elements.btnLandscape.addEventListener('click', function () {
            templateType = 'landscape';
            elements.btnLandscape.classList.add('active');
            elements.btnShort.classList.remove('active');
        });
        elements.btnShort.addEventListener('click', function () {
            templateType = 'short';
            elements.btnShort.classList.add('active');
            elements.btnLandscape.classList.remove('active');
        });
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
    }

    function updateWorkflowStep(step, completed) {
        var statusEl = elements['step' + step + 'Status'];
        if (statusEl) {
            statusEl.textContent = completed ? '✅' : '⬜';
        }
        var stepEl = document.getElementById('step' + step);
        if (stepEl) {
            if (completed) {
                stepEl.classList.add('completed');
            } else {
                stepEl.classList.remove('completed');
            }
        }
    }

    function browseFile() {
        csInterface.evalScript('browseTimingFile()', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    elements.filePath.value = res.path;
                    parseFile(res.content, res.extension);
                    updateStatus('ファイルを読み込みました (' + segments.length + ' テロップ)', 'success');
                    updateWorkflowStep(1, true);
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
        switch (extension.toLowerCase()) {
            case 'srt': segments = parseSRT(content); break;
            case 'txt': segments = parseTXT(content); break;
            case 'json': segments = parseJSON(content); break;
        }
        if (segments.length > 0) {
            displayPreview();
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
                    var text = lines.length >= 3 ? lines.slice(2).join('\n').trim() : '';
                    if (text) result.push({ start: start, end: end, text: text });
                }
            }
        }
        return result;
    }

    function parseTXT(content) {
        var result = [];
        var lines = content.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var match = lines[i].match(/^([\d.:,]+)\s*[-–]\s*([\d.:,]+)\s+(.+)/);
            if (match && match[3].trim()) {
                result.push({ start: parseTimeString(match[1]), end: parseTimeString(match[2]), text: match[3].trim() });
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
                    if (segs[i].start !== undefined && segs[i].end !== undefined && segs[i].text) {
                        result.push({ start: segs[i].start, end: segs[i].end, text: segs[i].text.trim() });
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

    function displayPreview() {
        elements.previewSection.style.display = 'block';
        elements.captionList.innerHTML = '';
        var maxDisplay = 10;
        for (var i = 0; i < Math.min(segments.length, maxDisplay); i++) {
            var seg = segments[i];
            var item = document.createElement('div');
            item.className = 'caption-item';
            item.innerHTML =
                '<span class="caption-time">' + formatTime(seg.start) + '</span>' +
                '<span class="caption-text">' + escapeHtml(seg.text.substring(0, 40)) + (seg.text.length > 40 ? '...' : '') + '</span>';
            elements.captionList.appendChild(item);
        }
        if (segments.length > maxDisplay) {
            var more = document.createElement('div');
            more.className = 'more';
            more.textContent = '... 他 ' + (segments.length - maxDisplay) + ' 件';
            elements.captionList.appendChild(more);
        }
        elements.captionStats.textContent = segments.length + ' テロップ';
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function insertMarkers() {
        if (segments.length === 0) {
            updateStatus('タイミングファイルを読み込んでください', 'warning');
            return;
        }
        if (isProcessing) return;

        isProcessing = true;
        elements.btnInsertMarkers.disabled = true;
        updateStatus('マーカーを挿入中...', 'processing');

        var settings = {
            templateType: templateType,
            fontSize: parseInt(elements.fontSize.value),
            fontFamily: elements.fontFamily.value,
            position: elements.position.value
        };

        var data = JSON.stringify({ segments: segments, settings: settings });

        csInterface.evalScript('insertMarkers(\'' + escapeString(data) + '\')', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    updateStatus(res.message, 'success');
                    markersInserted = true;
                    updateWorkflowStep(2, true);
                } else {
                    updateStatus(res.error || '挿入失敗', 'error');
                }
            } catch (e) {
                updateStatus('エラー: ' + e.message, 'error');
            } finally {
                isProcessing = false;
                elements.btnInsertMarkers.disabled = false;
            }
        });
    }

    function duplicateFromMarkers() {
        if (isProcessing) return;

        isProcessing = true;
        elements.btnDuplicateFromMarkers.disabled = true;
        updateStatus('マーカー位置に複製中...', 'processing');

        var settings = {
            trackIndex: parseInt(elements.trackIndex.value)
        };

        var data = JSON.stringify({ settings: settings });

        csInterface.evalScript('duplicateSelectedToMarkers(\'' + escapeString(data) + '\')', function (result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    updateStatus(res.message, 'success');
                    updateWorkflowStep(3, true);
                    updateWorkflowStep(4, true);
                } else {
                    updateStatus(res.error || '複製失敗', 'error');
                }
            } catch (e) {
                updateStatus('エラー: ' + e.message, 'error');
            } finally {
                isProcessing = false;
                elements.btnDuplicateFromMarkers.disabled = false;
            }
        });
    }

    function escapeString(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

})();
