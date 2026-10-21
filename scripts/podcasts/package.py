"""Assemble local voice segments into public MP3 lessons and timed transcripts."""
import sys, json, wave, hashlib, subprocess
from pathlib import Path
import numpy as np

build_dir, root, encoder = map(Path, sys.argv[1:4])
episodes = json.loads((build_dir / 'episodes.json').read_text(encoding='utf-8-sig'))
rate = 24000
audio_dir = root / 'assets' / 'podcasts'
audio_dir.mkdir(parents=True, exist_ok=True)
decoded = {}

def samples(key):
    if key in decoded:
        return decoded[key]
    with wave.open(str(build_dir.parent / 'clips' / (key + '.wav')), 'rb') as clip:
        if clip.getsampwidth() != 2 or clip.getnchannels() != 1:
            raise ValueError('Expected mono, 16-bit source audio')
        pcm = np.frombuffer(clip.readframes(clip.getnframes()), dtype='<i2').astype(np.float64)
        source_rate = clip.getframerate()
    if not len(pcm) or np.max(np.abs(pcm)) < 100:
        raise ValueError('Empty or silent voice segment: ' + key)
    if source_rate != rate:
        count = round(len(pcm) * rate / source_rate)
        pcm = np.interp(np.arange(count) * source_rate / rate, np.arange(len(pcm)), pcm)
    # A short edge ramp prevents clicks between independently synthesized phrases.
    ramp = min(44, len(pcm) // 2)
    pcm[:ramp] *= np.linspace(0, 1, ramp)
    pcm[-ramp:] *= np.linspace(1, 0, ramp)
    decoded[key] = pcm.astype('<i2')
    return decoded[key]

for episode in episodes:
    for language, version in episode['versions'].items():
        pieces, frames = [], 0
        for chapter in version['chapters']:
            chapter['start'] = round(frames / rate, 3)
            for segment in chapter['segments']:
                pcm = samples(segment.pop('clip'))
                segment['start'] = round(frames / rate, 3)
                pieces.append(pcm)
                frames += len(pcm)
                segment['end'] = round(frames / rate, 3)
                silence = np.zeros(round(rate * segment['pauseMs'] / 1000), dtype='<i2')
                pieces.append(silence)
                frames += len(silence)
            chapter['end'] = round(frames / rate, 3)
        pcm_file = build_dir / (episode['id'] + '-' + language + '.wav')
        with wave.open(str(pcm_file), 'wb') as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(rate)
            output.writeframes(np.concatenate(pieces).tobytes())
        name = episode['id'] + '-' + language + '.mp3'
        destination = audio_dir / name
        subprocess.run([str(encoder), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(pcm_file), '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-ar', str(rate), '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '96k', str(destination)], check=True)
        version.update(audio='assets/podcasts/' + name, duration=round(frames / rate, 3), bytes=destination.stat().st_size, sha256=hashlib.sha256(destination.read_bytes()).hexdigest())
        print(f"{name}: {version['duration'] / 60:.1f} min; {version['bytes']} bytes", flush=True)
    episode['disclosure'] = 'Vozes neurais sintetizadas com Kokoro: Dora (português), Heart e Michael (inglês). Cada personagem mantém uma voz própria. Não são gravações de atores.'
(root / 'podcast-data.js').write_text('/* Timed transcripts for original Regular practice lessons. */\nwindow.ISMPodcasts=' + json.dumps(episodes, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
