# Running an episode project

Work from the Remotion project root. Locate the entry point that calls `registerRoot`, the composition ID, the package manager, and the lockfile. Use the project's installed CLI. In an existing project, register the episode alongside its other compositions.

For a new project, set the Bash variable `skill_dir` to the absolute directory containing this skill's SKILL.md. Run these commands from the empty project directory.

```bash
mkdir -p src public out
cp "$skill_dir/templates/starter/package.json" ./package.json
cp "$skill_dir/templates/starter/index.tsx" src/index.tsx
cp -R "$skill_dir/templates/bridge" src/bridge
npm install
```

The starter registers the procedural `BridgeShort` example. To add optional Kenney models, put the files under `public/bridge/kenney/` and pass their extensionless names in the `kenneyNames` input prop. Supported names are listed in `world.ts`. Inspect any shot that relies on those props. Supply the episode narration and cues, adapt the composition ID, component, timeline, and registered duration, and adjust canvas dimensions when the brief requires it.

Use a project-specific temporary directory outside `public/` for large bundles. Use a supported headless browser available on the machine. To select a local installation, pass its verified path with `--browser-executable`. Test the WebGL backend with a still and open the image. A successful process can produce a frame showing only the background.

```bash
mkdir -p out .render-tmp
export TMPDIR="$PWD/.render-tmp"
entry=src/index.tsx
comp=BridgeShort
./node_modules/.bin/remotion still "$entry" "$comp" out/check.jpg --frame=100 --scale=0.5
./node_modules/.bin/remotion render "$entry" "$comp" out/picture.mp4 --codec=h264 --crf=16 --scale=1
```

Replace frame 100 with a frame inside the shot being checked. For local comparison, run `python3 "$skill_dir/scripts/sbs_sheet.py" out/compare.jpg --ours out/check.jpg --ref "/path/to/your/local/reference.jpg"`. Keep the comparison sheet outside the delivery directory.

## Mixing and final export

Install or locate FFmpeg and FFprobe. The Python QA script uses NumPy and Pillow. The audio synthesis example also uses SciPy. Its layout expects a `voice/` folder containing `voice.wav` (48 kHz) and `words.json` next to `audio/`. Match the mix to the locked picture timeline. Mux the picture and mix from the same revision.

```bash
ffmpeg -i out/picture.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart out/final.mp4
python3 "$skill_dir/scripts/short_qa.py" out/final.mp4 out/qa shots.json
```

Build `shots.json` from the episode shot table. A 60-frame clip with a cut at frame 30 would use:

```json
{"shots":[{"id":1,"a":0,"b":30},{"id":2,"a":30,"b":60}]}
```

Optionally set `flash` to a frame pair and `xfade` or `planned` to lists of pairs for intentional events. When the shot file is unavailable, omit the last argument and review detected cuts manually. Read `report.md`, open the decoded contact sheets, and play the final MP4 with sound. Check frame count, framing, fps, runtime, audio stream, loudness, pauses, and ending against the brief.
