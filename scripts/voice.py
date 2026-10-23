#!/usr/bin/env python3
"""Pre-generate narration clips with Kokoro-82M (Apache-2.0), voice af_heart.

Run with a Python env that has `kokoro` installed, e.g.
    /home/box/tts2/kokoro-venv/bin/python scripts/voice.py            # all pieces
    /home/box/tts2/kokoro-venv/bin/python scripts/voice.py billy      # one piece
Writes public/audio/<slug>/*.mp3 + index.json ({key: {file, text}}). Unchanged lines are skipped.
The app plays a clip only if its text still matches the JSON, otherwise it falls back to the browser voice.
Keep how_many() in sync with howManyText() in src/data.ts.
"""
import json, os, subprocess, sys, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, SPEED = os.environ.get('VOICE', 'af_heart'), float(os.environ.get('SPEED', '1.0'))
COMMON = {
    'parts': "First, let's check the box. Tap each part as you find it.",
    'allset': "Everything's here. Let's build.",
}

def plural(d): return d.get('plural') or (d['label'] if d['label'].endswith('s') else d['label'] + 's')

def how_many(p, s):
    parts, hw = {}, {}
    for oid in s.get('add', []):
        o = next(x for x in p['objects'] if x['id'] == oid)
        parts[o['part']] = parts.get(o['part'], 0) + 1
    for u in s.get('hardware', []):
        n = len(u['at']) if 'at' in u else u.get('n') or u.get('count') or 0
        hw[u['id']] = hw.get(u['id'], 0) + n
    if not parts and not hw: return 'Nothing new this step. Just you and the frame.'
    word = lambda n, d: f"{n} {(plural(d) if n > 1 else d['label']).lower()}"
    bits = [word(n, next(x for x in p['parts'] if x['id'] == k)) for k, n in parts.items()]
    bits += [word(n, next(x for x in p['hardware'] if x['id'] == k)) for k, n in hw.items()]
    lst = f"{', '.join(bits[:-1])} and {bits[-1]}" if len(bits) > 1 else bits[0]
    return f'This step uses {lst}.'

def lines(slug):
    if slug == 'common': return COMMON
    p = json.load(open(f'{ROOT}/public/pieces/{slug}/piece.json'))
    out = {}
    for i, s in enumerate(p['steps']):
        out[f'step-{i+1}'] = s['say']
        out[f'count-{i+1}'] = how_many(p, s)
    out['done'] = p['done']
    return out

def main():
    slugs = sys.argv[1:] or json.load(open(f'{ROOT}/public/pieces/index.json')) + ['common']
    todo = []
    for slug in slugs:
        d = f'{ROOT}/public/audio/{slug}'; os.makedirs(d, exist_ok=True)
        idx_path = f'{d}/index.json'
        idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
        want = lines(slug)
        idx = {k: v for k, v in idx.items() if k in want}
        for k, t in want.items():
            h = hashlib.sha1(f'{VOICE}|{SPEED}|{t}'.encode()).hexdigest()[:8]
            f = f'{k}-{h}.mp3'
            if idx.get(k, {}).get('file') == f and os.path.exists(f'{d}/{f}'): continue
            todo.append((slug, k, t, f))
        json.dump(idx, open(idx_path, 'w'), indent=1)
    print('to generate:', len(todo), flush=True)
    if not todo: return
    import numpy as np, soundfile as sf, torch
    torch.set_num_threads(int(os.environ.get('THREADS', '2')))
    from kokoro import KModel, KPipeline
    model = KModel(repo_id='hexgrad/Kokoro-82M').eval()
    pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M', model=model)
    for n, (slug, k, t, f) in enumerate(todo):
        d = f'{ROOT}/public/audio/{slug}'
        audio = [r.audio.numpy() for r in pipe(t, voice=VOICE, speed=SPEED) if r.audio is not None]
        a = np.concatenate(audio) if audio else np.zeros(2400, np.float32)
        a = np.concatenate([np.zeros(1200, np.float32), a, np.zeros(4800, np.float32)])  # 50ms lead-in, 200ms tail
        wav = f'/tmp/hk-{slug}-{k}.wav'; sf.write(wav, a, 24000)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '24000', '-ac', '1', '-b:a', '48k', f'{d}/{f}'], check=True)
        os.remove(wav)
        # drop the old clip for this key, then record the new one
        idx_path = f'{d}/index.json'; idx = json.load(open(idx_path))
        old = idx.get(k, {}).get('file')
        if old and old != f and os.path.exists(f'{d}/{old}'): os.remove(f'{d}/{old}')
        idx[k] = {'file': f, 'text': t}; json.dump(idx, open(idx_path, 'w'), indent=1)
        print(n + 1, slug, k, flush=True)
    print('done', flush=True)

if __name__ == '__main__': main()
