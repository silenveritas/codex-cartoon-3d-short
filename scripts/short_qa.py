# Frame-by-frame QA of a rendered vertical short (every frame at 30 fps): specs, loudness, per-frame luma / saturation /
# motion, black-white-frozen-pop detection (ignoring planned flashes and crossfades), per-shot colour stats and 2 s
# contact sheets (60 frames each, frame numbers burned in for the reviewer only).
# Usage: python scripts/short_qa.py <video.mp4> <outdir> [shots.json]
#   shots.json: {"shots":[{"id":1,"a":0,"b":130}], "flash":[30,34], "xfade":[]}
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

vid, out = sys.argv[1], sys.argv[2]
meta = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
shots = meta.get("shots", [])
planned = set()
for a, b in meta.get("xfade", []) + meta.get("planned", []) + ([meta["flash"]] if "flash" in meta else []):
    planned.update(range(a - 1, b + 1))
for s in shots:
    planned.update((s["a"] - 1, s["a"]))
os.makedirs(out, exist_ok=True)
run = lambda *a: subprocess.run(a, capture_output=True, text=True, check=True)
R = []

pr = json.loads(run("ffprobe", "-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels:format=duration", "-of", "json", vid).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
au = [s for s in pr["streams"] if s["codec_type"] == "audio"]
R.append(f"SPECS {v['width']}x{v['height']} {v['r_frame_rate']} fps, {v.get('nb_frames')} frames, {float(pr['format']['duration']):.3f} s; audio: "
         + (", ".join(f"{s['codec_name']} {s['sample_rate']} Hz {s['channels']}ch" for s in au) or "NONE"))
if au:
    e = run("ffmpeg", "-i", vid, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-").stderr
    tail = e[e.rfind("Summary:"):]
    I = [l.strip() for l in tail.splitlines() if l.strip().startswith(("I:", "LRA:", "Peak:"))]
    R.append("LOUDNESS " + " | ".join(I))
    e = run("ffmpeg", "-i", vid, "-map", "0:a:0", "-af", "silencedetect=n=-45dB:d=0.3", "-f", "null", "-").stderr
    R.append("SILENCES " + ("; ".join(l.split("] ")[-1] for l in e.splitlines() if "silence_" in l) or "none"))

W, H = 180, 320
command = ["ffmpeg", "-v", "error", "-i", vid, "-map", "0:v:0", "-vf",
           f"scale={W}:{H}:flags=area", "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
stats = {k: [] for k in ("mean", "std", "p2", "p98", "sat")}
diff = []
previous = None
n = 0
cw, ch = 108, 192
with subprocess.Popen(command, stdout=subprocess.PIPE) as decoder:
    while True:
        raw = decoder.stdout.read(W * H * 3)
        if not raw:
            break
        frame = np.frombuffer(raw, np.uint8).reshape(H, W, 3)
        rgb = frame.astype(np.float32) / 255
        luma = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        high = rgb.max(axis=2)
        saturation = np.where(high > 0.06, (high - rgb.min(axis=2)) / np.maximum(high, 1e-6), 0)
        p2, p98 = np.percentile(luma, [2, 98])
        for key, val in zip(stats, (luma.mean(), luma.std(), p2, p98, saturation.mean())):
            stats[key].append(float(val))
        if previous is not None:
            diff.append(np.abs(frame.astype(np.int16) - previous).mean())
        previous = frame
        slot = n % 60
        if slot == 0:
            sheet = Image.new("RGB", (cw * 10, ch * 6), "black")
            draw = ImageDraw.Draw(sheet)
        x, y = slot % 10 * cw, slot // 10 * ch
        sheet.paste(Image.fromarray(frame).resize((cw, ch)), (x, y))
        draw.rectangle([x, y, x + 34, y + 12], fill="black")
        draw.text((x + 2, y + 1), str(n), fill="yellow")
        n += 1
        if n % 60 == 0:
            sheet.save(os.path.join(out, f"sheet_{n - 60:04d}.jpg"), quality=85)
    if decoder.wait():
        sys.exit("FFmpeg could not decode the complete video")
if n == 0:
    sys.exit("No video frames decoded")
if n % 60:
    sheet.save(os.path.join(out, f"sheet_{n - n % 60:04d}.jpg"), quality=85)
declared = v.get("nb_frames")
if declared and declared.isdigit() and int(declared) != n:
    sys.exit(f"Decoded {n} frames but the stream declares {declared}")
diff = np.asarray(diff)
med = np.array([np.median(diff[max(0, i - 8):i + 9]) for i in range(len(diff))])
pops = [i + 1 for i in range(len(diff)) if diff[i] > 3 * med[i] + 1.0 and (i + 1) not in planned]
black = [i for i in range(n) if stats["mean"][i] < 0.04]
white = [i for i in range(n) if stats["mean"][i] > 0.93 and i not in planned]
frozen, run_start = [], None
for i in range(len(diff)):
    if diff[i] < 0.02:
        run_start = i if run_start is None else run_start
    else:
        if run_start is not None and i - run_start >= 12: frozen.append((run_start, i))
        run_start = None
if run_start is not None and len(diff) - run_start >= 12:
    frozen.append((run_start, n - 1))
R.append(f"FRAMES {n}; black {black[:20]}; unplanned white {white[:20]}; frozen spans >=12f {frozen[:20]}")
flat = [i for i, spread in enumerate(stats["std"]) if spread < 0.002 and i not in planned]
R.append(f"NEAR-UNIFORM frames (inspect for missing scene): {flat[:20]} ({len(flat)} total)")
R.append(f"POPS (unplanned frame-diff spikes > 3x local median): {pops[:40]}")
if len(diff):
    R.append(f"MOTION mean diff {diff.mean():.2f}; frames with diff<0.3 (held): {int((diff < 0.3).sum())} ({(diff < 0.3).mean() * 100:.0f}%)")

R.append("\nPER SHOT  (luma mean / std / p2 / p98 / saturation mean, medians over the shot)")
for s in shots or [{"id": 0, "a": 0, "b": n}]:
    a, b = s["a"], min(s["b"], n)
    if a >= b: continue
    R.append(f"  shot {s['id']:>2} f{a}-{b - 1}: " + " / ".join(f"{np.median(stats[k][a:b]):.3f}" for k in ("mean", "std", "p2", "p98", "sat")))
np.savez(os.path.join(out, "perframe.npz"), diff=diff, **stats)

open(os.path.join(out, "report.md"), "w", encoding="utf-8").write("\n".join(R) + "\n")
print("\n".join(R))
