"""Render cached Kokoro ONNX speech; all synthesis runs locally, without API keys.

Dependencies: kokoro-onnx, soundfile, espeakng-loader, misaki. Pass build and model folders.
Model files: official thewh1teagle/kokoro-onnx model-files-v1.1 release.
"""
import json
import sys
import time
from pathlib import Path
from types import SimpleNamespace

import espeakng_loader
import numpy as np
import soundfile as sf
from kokoro_onnx import EspeakConfig, Kokoro
from misaki.espeak import EspeakFallback, EspeakG2P

build, models = map(Path, sys.argv[1:3])
clips = build / 'clips'
clips.mkdir(parents=True, exist_ok=True)
engine = Kokoro(str(models / 'kokoro-v1.0.onnx'), str(models / 'voices-v1.0.bin'),
                espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(),
                                          data_path=espeakng_loader.get_data_path()))
jobs = json.loads((build / 'jobs.json').read_text(encoding='utf-8'))
english = EspeakFallback(british=False)
portuguese = EspeakG2P(language='pt-br')
started = time.monotonic()
for index, job in enumerate(jobs, 1):
    destination = clips / (job['key'] + '.wav')
    if destination.exists():
        # Never accept an incomplete cache entry after an interrupted render.
        cached, _ = sf.read(destination)
        if len(cached) > 2400 and np.isfinite(cached).all() and np.max(np.abs(cached)) > .01:
            continue
    # Use the model's phoneme normalization for affricates and diphthongs.
    # Raw eSpeak IPA is not interchangeable with the Kokoro vocabulary.
    phonemes, _ = (portuguese(job['text']) if job['lang'] == 'pt-BR'
                   else english(SimpleNamespace(text=job['text'])))
    if not phonemes:
        raise RuntimeError('No pronunciation model: ' + job['key'])
    audio, rate = engine.create(phonemes, voice=job['voice'],
                                speed=job['rate'] / 100, is_phonemes=True)
    if not len(audio) or not np.isfinite(audio).all() or np.max(np.abs(audio)) < .01:
        raise RuntimeError('Invalid synthesis: ' + job['key'])
    temporary = destination.with_suffix('.partial.wav')
    sf.write(temporary, audio, rate, subtype='PCM_16')
    temporary.replace(destination)
    print(f'{index}/{len(jobs)} {job["voice"]}: {len(audio)/rate:.1f}s; elapsed {time.monotonic()-started:.0f}s', flush=True)
