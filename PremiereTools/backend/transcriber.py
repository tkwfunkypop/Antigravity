import whisper
import sys
import json
import os
import warnings
import torch

# Suppress warnings
warnings.filterwarnings("ignore")

def load_model(model_size="base"):
    """
    Load Whisper model.
    Available models: tiny, base, small, medium, large
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading Whisper model '{model_size}' on {device}...", file=sys.stderr)
    model = whisper.load_model(model_size, device=device)
    return model

def transcribe_audio(audio_path, model_size="base"):
    """
    Transcribe audio file and return segments with timestamps.
    """
    if not os.path.exists(audio_path):
        return {"error": f"File not found: {audio_path}"}

    try:
        model = load_model(model_size)
        
        print(f"Transcribing {audio_path}...", file=sys.stderr)
        
        # Transcribe
        result = model.transcribe(audio_path, fp16=False) # fp16=False for CPU compatibility if GPU not better
        
        return {
            "text": result["text"],
            "segments": [
                {
                    "id": s["id"],
                    "start": s["start"],
                    "end": s["end"],
                    "text": s["text"].strip()
                }
                for s in result["segments"]
            ]
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python transcriber.py <audio_path>"}), indent=2)
        sys.exit(1)

    audio_file = sys.argv[1]
    
    # Run transcription
    data = transcribe_audio(audio_file)
    
    # Print JSON to stdout for other programs to capture
    print(json.dumps(data, indent=2, ensure_ascii=False))
