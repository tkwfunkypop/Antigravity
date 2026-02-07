"""
Smart Auto-Cut Backend Server v2.0
High-accuracy transcription with faster-whisper + audio preprocessing + VAD
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import warnings
import tempfile
import base64
import subprocess
import json

# Suppress warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# Global model cache
_model = None
_vad_model = None

def get_model(model_size="large-v3"):
    """Load and cache faster-whisper model."""
    global _model
    if _model is None:
        try:
            from faster_whisper import WhisperModel
            
            # Use GPU if available, with int8 quantization for speed
            device = "cuda" if is_cuda_available() else "cpu"
            compute_type = "float16" if device == "cuda" else "int8"
            
            print(f"[Server] Loading faster-whisper model '{model_size}' on {device}...")
            print(f"[Server] Compute type: {compute_type}")
            
            _model = WhisperModel(
                model_size,
                device=device,
                compute_type=compute_type,
                download_root=os.path.expanduser("~/.cache/whisper")
            )
            print(f"[Server] faster-whisper model loaded successfully!")
            
        except ImportError:
            # Fallback to standard whisper
            print("[Server] faster-whisper not found, falling back to openai-whisper...")
            import whisper
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            _model = whisper.load_model(model_size, device=device)
            print(f"[Server] OpenAI Whisper model loaded on {device}")
            
    return _model

def is_cuda_available():
    """Check if CUDA is available."""
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False

def get_vad_model():
    """Load silero VAD model for voice activity detection."""
    global _vad_model
    if _vad_model is None:
        try:
            import torch
            model, utils = torch.hub.load(
                repo_or_dir='snakers4/silero-vad',
                model='silero_vad',
                force_reload=False,
                onnx=False
            )
            _vad_model = (model, utils)
            print("[Server] Silero VAD model loaded!")
        except Exception as e:
            print(f"[Server] VAD model not available: {e}")
            _vad_model = None
    return _vad_model

def preprocess_audio(input_path, output_path=None, source_in=None, source_out=None):
    """
    Preprocess audio for optimal transcription:
    - Trim to source_in/source_out if specified (for timeline clips)
    - Convert to 16kHz mono WAV (Whisper's optimal format)
    - Apply noise reduction
    - Normalize volume
    """
    if output_path is None:
        output_path = tempfile.mktemp(suffix='.wav')
    
    try:
        # Build FFmpeg command
        cmd = ['ffmpeg', '-y']
        
        # Add seek if source_in is specified (faster seeking)
        if source_in is not None and source_in > 0:
            cmd.extend(['-ss', str(source_in)])
        
        cmd.extend(['-i', input_path])
        
        # Add duration if source_out is specified
        if source_in is not None and source_out is not None:
            duration = source_out - (source_in if source_in else 0)
            if duration > 0:
                cmd.extend(['-t', str(duration)])
        
        # Audio filters for optimal transcription
        cmd.extend([
            '-af', ','.join([
                'highpass=f=80',           # Remove low-frequency noise
                'lowpass=f=8000',          # Focus on speech frequencies
                'afftdn=nf=-20',           # Noise reduction
                'loudnorm=I=-16:LRA=11:TP=-1.5',  # Volume normalization
                'aresample=16000'          # Resample to 16kHz
            ]),
            '-ac', '1',                    # Mono
            '-acodec', 'pcm_s16le',        # 16-bit PCM
            output_path
        ])
        
        print(f"[Server] FFmpeg command: {' '.join(cmd[:10])}...")
        if source_in is not None:
            print(f"[Server] Trimming audio: {source_in:.2f}s - {source_out:.2f}s")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            print(f"[Server] Audio preprocessed: {output_path}")
            return output_path
        else:
            print(f"[Server] FFmpeg warning: {result.stderr}")
            # Return original if preprocessing fails
            return input_path
            
    except FileNotFoundError:
        print("[Server] FFmpeg not found, using original audio")
        return input_path
    except Exception as e:
        print(f"[Server] Preprocessing error: {e}")
        return input_path

def transcribe_clip(model, audio_path, language, initial_prompt, timeline_offset=0):
    """
    Transcribe a single clip and adjust timestamps for timeline position.
    
    Args:
        model: Whisper model
        audio_path: Path to audio file
        language: Language code
        initial_prompt: Initial prompt for transcription
        timeline_offset: Offset to add to timestamps (seconds)
    
    Returns:
        List of segments with adjusted timestamps
    """
    segments = []
    
    try:
        if 'faster_whisper' in str(type(model)):
            # faster-whisper API
            raw_segments, info = model.transcribe(
                audio_path,
                language=language,
                task="transcribe",
                beam_size=5,
                best_of=5,
                temperature=0,
                initial_prompt=initial_prompt,
                condition_on_previous_text=True,
                word_timestamps=True,
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=500,
                    speech_pad_ms=400
                )
            )
            
            for seg in raw_segments:
                segments.append({
                    "start": seg.start + timeline_offset,
                    "end": seg.end + timeline_offset,
                    "text": seg.text.strip(),
                    "confidence": getattr(seg, 'avg_logprob', 0)
                })
        else:
            # Standard OpenAI Whisper API
            result = model.transcribe(
                audio_path,
                language=language,
                task="transcribe",
                fp16=False,
                beam_size=5,
                best_of=5,
                temperature=0,
                initial_prompt=initial_prompt,
                condition_on_previous_text=True,
                word_timestamps=True,
                verbose=False
            )
            
            for s in result.get("segments", []):
                segments.append({
                    "start": s["start"] + timeline_offset,
                    "end": s["end"] + timeline_offset,
                    "text": s["text"].strip()
                })
    except Exception as e:
        print(f"[Server] Transcription error: {e}")
    
    return segments

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    # Check available features
    features = {
        "faster_whisper": False,
        "vad": False,
        "ffmpeg": False
    }
    
    try:
        from faster_whisper import WhisperModel
        features["faster_whisper"] = True
    except ImportError:
        pass
    
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True)
        features["ffmpeg"] = result.returncode == 0
    except:
        pass
    
    return jsonify({
        "status": "ok",
        "service": "Smart Auto-Cut Backend v2.0",
        "version": "2.0.0",
        "features": features
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """
    High-accuracy transcription with preprocessing and VAD.
    Supports multiple clips with timeline-aware timestamps.
    """
    try:
        data = request.get_json()
        
        temp_files = []
        all_segments = []
        full_text = ""
        
        # Get settings
        language = data.get('language', 'ja')
        initial_prompt = data.get('initial_prompt', 
            "これは日本語の音声です。句読点を正確に付けてください。丁寧な日本語で文字起こしをしてください。")
        
        # Handle clips array (new format)
        clips = data.get('clips', [])
        
        # Fallback to single audio_path for backward compatibility
        if not clips and 'audio_path' in data:
            clips = [{
                'path': data['audio_path'],
                'source_in': data.get('source_in'),
                'source_out': data.get('source_out'),
                'timeline_start': 0,
                'timeline_end': None
            }]
        
        if not clips:
            return jsonify({"error": "Missing 'clips' or 'audio_path'"}), 400
        
        print(f"[Server] Processing {len(clips)} clip(s)")
        
        # Load model once
        model = get_model()
        
        # Process each clip
        for i, clip in enumerate(clips):
            audio_path = clip.get('path')
            if not audio_path or not os.path.exists(audio_path):
                print(f"[Server] Clip {i+1}: File not found: {audio_path}")
                continue
            
            source_in = clip.get('source_in')
            source_out = clip.get('source_out')
            timeline_start = clip.get('timeline_start', 0)
            
            print(f"[Server] Clip {i+1}/{len(clips)}: {os.path.basename(audio_path)}")
            if source_in is not None and source_out is not None:
                print(f"  Source trim: {source_in:.2f}s - {source_out:.2f}s")
                print(f"  Timeline position: {timeline_start:.2f}s")
            
            # Preprocess audio with trim range
            processed_path = preprocess_audio(audio_path, source_in=source_in, source_out=source_out)
            if processed_path != audio_path:
                temp_files.append(processed_path)
            
            # Transcribe this clip
            clip_segments = transcribe_clip(model, processed_path, language, initial_prompt, timeline_start)
            all_segments.extend(clip_segments)
            
            for seg in clip_segments:
                full_text += seg.get('text', '') + " "
        # Sort segments by start time
        all_segments.sort(key=lambda x: x['start'])
        
        # Re-number segment IDs
        for i, seg in enumerate(all_segments):
            seg['id'] = i
        
        response = {
            "success": True,
            "text": full_text.strip(),
            "segments": all_segments,
            "clips_processed": len(clips),
            "engine": "faster-whisper"
        }
        
        # Clean up temp files
        for f in temp_files:
            try:
                os.unlink(f)
            except:
                pass
        
        print(f"[Server] Transcribed {len(response['segments'])} segments using {response['engine']}")
        return jsonify(response)
        
    except Exception as e:
        import traceback
        print(f"[Server] Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_for_cuts():
    """
    Analyze transcription and suggest cut points.
    Includes retake detection and silence analysis.
    """
    try:
        data = request.get_json()
        segments = data.get('segments', [])
        silence_threshold = data.get('silence_threshold', 1.0)
        retake_similarity_threshold = data.get('retake_similarity', 0.7)
        
        analyzed = []
        silence_regions = []
        retake_regions = []
        total_silence = 0
        
        # First pass: detect retakes (similar consecutive segments)
        retake_groups = detect_retakes(segments, retake_similarity_threshold)
        
        for i, seg in enumerate(segments):
            # Correct text based on context
            corrected_text = correct_text_with_context(
                seg["text"],
                segments[i-1]["text"] if i > 0 else "",
                segments[i+1]["text"] if i < len(segments)-1 else ""
            )
            
            entry = {
                **seg,
                "original_text": seg["text"],
                "text": corrected_text,
                "text_corrected": corrected_text != seg["text"],
                "keep": True,
                "reason": "content",
                "marker_color": "green",
                "is_retake": False,
                "retake_group": None
            }
            
            # Check if this segment is part of a retake group
            for group_id, group in enumerate(retake_groups):
                if i in group["segment_ids"]:
                    entry["retake_group"] = group_id
                    # Keep only the last segment in a retake group
                    if i != group["segment_ids"][-1]:
                        entry["keep"] = False
                        entry["is_retake"] = True
                        entry["reason"] = "retake"
                        entry["marker_color"] = "red"
                    else:
                        entry["reason"] = "final_take"
                        entry["marker_color"] = "blue"
            
            # Check for silence before this segment
            if i > 0:
                prev_end = segments[i-1]["end"]
                gap = seg["start"] - prev_end
                
                # Detect silences: lower threshold for more aggressive cutting
                # 0.3s minimum for detection, 0.5s or more triggers cut action
                if gap >= 0.3:
                    total_silence += gap
                    silence_regions.append({
                        "start": prev_end,
                        "end": seg["start"],
                        "duration": gap,
                        "action": "cut" if gap >= 0.5 else "trim"  # Cut if >= 0.5s
                    })
                    entry["pause_before"] = gap
                    if entry["marker_color"] == "green":
                        entry["marker_color"] = "orange" if gap > 1.0 else "yellow"
            
            analyzed.append(entry)
        
        # Build retake regions for cutting
        for group in retake_groups:
            if len(group["segment_ids"]) > 1:
                first_id = group["segment_ids"][0]
                last_id = group["segment_ids"][-2]  # All but the last (kept) segment
                retake_regions.append({
                    "start": segments[first_id]["start"],
                    "end": segments[last_id]["end"],
                    "segment_ids": group["segment_ids"][:-1],
                    "action": "cut",
                    "reason": "retake"
                })
        
        # Stats
        retake_count = sum(1 for s in analyzed if s.get("is_retake"))
        
        return jsonify({
            "success": True,
            "segments": analyzed,
            "silence_regions": silence_regions,
            "retake_regions": retake_regions,
            "stats": {
                "total_segments": len(analyzed),
                "total_silence": round(total_silence, 2),
                "silence_count": len(silence_regions),
                "retake_count": retake_count,
                "corrected_texts": sum(1 for s in analyzed if s.get("text_corrected"))
            },
            "summary": f"Analyzed {len(analyzed)} segments, found {len(silence_regions)} silences ({round(total_silence, 1)}s), {retake_count} retakes"
        })
        
    except Exception as e:
        import traceback
        print(f"[Server] Analyze error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def detect_retakes(segments, similarity_threshold=0.7):
    """
    Detect retake segments (similar consecutive segments).
    Returns groups of segment IDs that are likely retakes.
    """
    from difflib import SequenceMatcher
    
    groups = []
    current_group = None
    
    for i in range(1, len(segments)):
        prev_text = segments[i-1]["text"].strip()
        curr_text = segments[i]["text"].strip()
        
        # Calculate similarity
        similarity = SequenceMatcher(None, prev_text, curr_text).ratio()
        
        # Also check for partial matches (one contains the other)
        partial_match = (
            prev_text in curr_text or 
            curr_text in prev_text or
            prev_text[:len(prev_text)//2] == curr_text[:len(curr_text)//2]  # Same start
        )
        
        is_similar = similarity >= similarity_threshold or (partial_match and similarity >= 0.5)
        
        if is_similar:
            if current_group is None:
                current_group = {
                    "segment_ids": [i-1, i],
                    "similarity": similarity
                }
            else:
                current_group["segment_ids"].append(i)
        else:
            if current_group is not None:
                groups.append(current_group)
                current_group = None
    
    # Don't forget the last group
    if current_group is not None:
        groups.append(current_group)
    
    return groups


@app.route('/api/export_srt', methods=['POST'])
def export_srt():
    """
    Export segments as SRT subtitle file.
    """
    try:
        data = request.get_json()
        segments = data.get('segments', [])
        output_path = data.get('output_path', None)
        include_retakes = data.get('include_retakes', False)
        
        # Filter segments based on settings
        filtered_segments = []
        for seg in segments:
            if not include_retakes and seg.get('is_retake', False):
                continue
            if seg.get('keep', True):
                filtered_segments.append(seg)
        
        # Generate SRT content
        srt_content = ""
        for i, seg in enumerate(filtered_segments):
            srt_content += f"{i + 1}\n"
            srt_content += f"{format_srt_time(seg['start'])} --> {format_srt_time(seg['end'])}\n"
            srt_content += f"{seg['text']}\n\n"
        
        # Save to file if path provided
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(srt_content)
            return jsonify({
                "success": True,
                "path": output_path,
                "segment_count": len(filtered_segments)
            })
        
        # Otherwise return content
        return jsonify({
            "success": True,
            "content": srt_content,
            "segment_count": len(filtered_segments)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def format_srt_time(seconds):
    """Format time for SRT format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{hours:02d}:{mins:02d}:{secs:02d},{ms:03d}"


def correct_text_with_context(text, prev_text, next_text):
    """Correct text based on context using pattern matching."""
    import re
    
    corrected = text
    
    corrections = [
        # Filler words cleanup
        (r'えーと\s*', ''),
        (r'あのー?\s*', ''),
        (r'まあ\s*', ''),
        (r'んー+\s*', ''),
        
        # Common mishearings
        (r'ていうか', 'というか'),
        (r'じゃなくて', 'ではなくて'),
        (r'ってゆう', 'という'),
        (r'っていう', 'という'),
        
        # Repeated words (stuttering)
        (r'(\S+)\s+\1\s*', r'\1'),
        
        # Extra spaces
        (r'\s+', ' '),
        
        # Trailing/leading spaces
        (r'^\s+|\s+$', ''),
    ]
    
    for pattern, replacement in corrections:
        corrected = re.sub(pattern, replacement, corrected)
    
    if prev_text and (prev_text.endswith('…') or prev_text.endswith('...')):
        corrected = re.sub(r'^(で|と|が|を|に|は)\s*', '', corrected)
    
    return corrected.strip()


@app.route('/api/smartcut', methods=['POST'])
def smart_cut():
    """
    Smart cut analysis:
    1. Transcribe audio to find speech segments
    2. Detect low volume sections (compared to average)
    3. Find gaps with no transcript text
    Returns cut regions for both conditions.
    """
    try:
        data = request.get_json()
        audio_path = data.get('audio_path')
        source_in = data.get('source_in')
        source_out = data.get('source_out')
        volume_threshold = data.get('volume_threshold', 0.3)  # 30% of average
        min_gap_duration = data.get('min_gap_duration', 0.5)  # 0.5 seconds

        if not audio_path or not os.path.exists(audio_path):
            return jsonify({"error": f"ファイルが見つかりません: {audio_path}"}), 400

        print(f"[SmartCut] Analyzing: {os.path.basename(audio_path)}")
        
        # Step 1: Preprocess and transcribe
        processed_path = preprocess_audio(audio_path, source_in=source_in, source_out=source_out)
        temp_files = []
        if processed_path != audio_path:
            temp_files.append(processed_path)

        model = get_model()
        segments = transcribe_clip(model, processed_path, 'ja', 
            "これは日本語の音声です。句読点を正確に付けてください。", 0)

        print(f"[SmartCut] Found {len(segments)} speech segments")

        # Step 2: Analyze volume levels
        low_volume_regions = analyze_volume(processed_path, volume_threshold)
        print(f"[SmartCut] Found {len(low_volume_regions)} low volume regions")

        # Step 3: Find regions with no transcript text (gaps between segments)
        no_text_regions = []
        if len(segments) > 0:
            # Check gap at the beginning
            if segments[0]['start'] > min_gap_duration:
                no_text_regions.append({
                    'start': 0,
                    'end': segments[0]['start'],
                    'duration': segments[0]['start'],
                    'reason': 'no_text_start'
                })

            # Check gaps between segments
            for i in range(1, len(segments)):
                gap_start = segments[i-1]['end']
                gap_end = segments[i]['start']
                gap_duration = gap_end - gap_start
                
                if gap_duration >= min_gap_duration:
                    no_text_regions.append({
                        'start': gap_start,
                        'end': gap_end,
                        'duration': gap_duration,
                        'reason': 'no_text_gap'
                    })

        print(f"[SmartCut] Found {len(no_text_regions)} no-text regions")

        # Step 4: Merge overlapping regions
        all_regions = low_volume_regions + no_text_regions
        merged_regions = merge_overlapping_regions(all_regions)
        
        # Sort by start time
        merged_regions.sort(key=lambda x: x['start'])

        # Clean up
        for f in temp_files:
            try: os.unlink(f)
            except: pass

        return jsonify({
            "success": True,
            "segments": segments,
            "silence_regions": merged_regions,
            "low_volume_regions": low_volume_regions,
            "no_text_regions": no_text_regions,
            "stats": {
                "speech_segments": len(segments),
                "cut_regions": len(merged_regions),
                "total_cut_duration": sum(r['duration'] for r in merged_regions)
            }
        })

    except Exception as e:
        import traceback
        print(f"[SmartCut] Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def analyze_volume(audio_path, threshold=0.3):
    """
    Analyze audio to find low volume sections.
    Uses FFmpeg to get volume data and finds sections below threshold.
    """
    try:
        import numpy as np
        import wave
        import struct
        
        # Read WAV file
        with wave.open(audio_path, 'rb') as wf:
            n_channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            framerate = wf.getframerate()
            n_frames = wf.getnframes()
            
            raw_data = wf.readframes(n_frames)
        
        # Convert to numpy array
        if sample_width == 2:
            data = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
        else:
            data = np.frombuffer(raw_data, dtype=np.int8).astype(np.float32)
        
        if n_channels > 1:
            data = data[::n_channels]  # Take first channel
        
        # Normalize
        max_val = np.max(np.abs(data))
        if max_val > 0:
            data = data / max_val
        
        # Calculate RMS in windows (100ms windows)
        window_size = int(framerate * 0.1)  # 100ms
        hop_size = int(framerate * 0.05)    # 50ms hop
        
        rms_values = []
        for i in range(0, len(data) - window_size, hop_size):
            window = data[i:i + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            rms_values.append(rms)
        
        rms_values = np.array(rms_values)
        
        # Calculate average RMS (excluding very quiet parts for baseline)
        non_quiet = rms_values[rms_values > np.percentile(rms_values, 20)]
        avg_rms = np.mean(non_quiet) if len(non_quiet) > 0 else np.mean(rms_values)
        
        # Find regions below threshold
        threshold_value = avg_rms * threshold
        low_volume_mask = rms_values < threshold_value
        
        # Convert to time regions
        low_volume_regions = []
        in_low_region = False
        region_start = 0
        
        for i, is_low in enumerate(low_volume_mask):
            time_pos = i * 0.05  # hop_size in seconds
            
            if is_low and not in_low_region:
                region_start = time_pos
                in_low_region = True
            elif not is_low and in_low_region:
                duration = time_pos - region_start
                if duration >= 0.3:  # Minimum 0.3s
                    low_volume_regions.append({
                        'start': region_start,
                        'end': time_pos,
                        'duration': duration,
                        'reason': 'low_volume'
                    })
                in_low_region = False
        
        # Handle region at end
        if in_low_region:
            time_pos = len(rms_values) * 0.05
            duration = time_pos - region_start
            if duration >= 0.3:
                low_volume_regions.append({
                    'start': region_start,
                    'end': time_pos,
                    'duration': duration,
                    'reason': 'low_volume'
                })
        
        return low_volume_regions
        
    except Exception as e:
        print(f"[SmartCut] Volume analysis error: {e}")
        return []


def merge_overlapping_regions(regions):
    """Merge overlapping or adjacent regions."""
    if not regions:
        return []
    
    # Sort by start time
    sorted_regions = sorted(regions, key=lambda x: x['start'])
    
    merged = [sorted_regions[0].copy()]
    
    for region in sorted_regions[1:]:
        last = merged[-1]
        
        # Check if overlapping or adjacent (within 0.1s)
        if region['start'] <= last['end'] + 0.1:
            # Extend the last region
            last['end'] = max(last['end'], region['end'])
            last['duration'] = last['end'] - last['start']
            # Combine reasons if different
            if region.get('reason') and region['reason'] != last.get('reason'):
                last['reason'] = 'low_volume+no_text'
        else:
            merged.append(region.copy())
    
    return merged


if __name__ == '__main__':
    print("=" * 60)
    print("  Smart Auto-Cut Backend Server v2.0")
    print("  High-accuracy transcription system")
    print("  http://localhost:5050")
    print("=" * 60)
    
    # Check features
    print("\n[Checking features...]")
    
    try:
        from faster_whisper import WhisperModel
        print("✅ faster-whisper: Available")
    except ImportError:
        print("⚠️  faster-whisper: Not installed (using openai-whisper)")
        print("    Install with: pip install faster-whisper")
    
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True)
        if result.returncode == 0:
            print("✅ FFmpeg: Available (audio preprocessing enabled)")
        else:
            print("⚠️  FFmpeg: Not working properly")
    except FileNotFoundError:
        print("⚠️  FFmpeg: Not installed (audio preprocessing disabled)")
        print("    Install with: brew install ffmpeg")
    
    print("\n[Pre-loading model...]")
    get_model()
    
    print("\n[Server ready!]")
    app.run(host='0.0.0.0', port=5050, debug=False)
