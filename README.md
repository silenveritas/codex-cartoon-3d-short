# Codex Cartoon 3D Short

A Codex skill for making vertical story shorts with ink-outlined 2D characters in painted 3D sets. It uses three.js and Remotion for history, science, and folklore episodes.

![A rendered BridgeShort frame showing cartoon soldiers marching across a wooden bridge](docs/bridge-preview.jpg)

*Frame from the bundled BridgeShort composition.*

## Upstream

This skill adapts the original `cartoon-3d-short` workflow by Mr omi for Codex. The procedural BridgeShort scene, script example, and audio templates come from the upstream project. [Claude Animated Shorts by Mr omi](https://github.com/mromidev/claude-animated-shorts)

## Install

Clone the repo into your Codex skills directory. If an earlier copy is already installed, update that copy or back up any local edits before replacing it.

```bash
skills_dir="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$skills_dir"
git clone https://github.com/silenveritas/codex-cartoon-3d-short.git \
  "$skills_dir/codex-cartoon-3d-short"
```

Open a new Codex chat and invoke the skill by name.

> Use `$codex-cartoon-3d-short` to make a 60-second vertical short about why bridges can sway in the wind. Show the mechanism through an everyday analogy.

## What’s included

- A Remotion starter and the procedural `BridgeShort` example, with reusable character, lighting, camera, and post-processing code.
- Guidance for adapting locations, staging action, and checking the result at phone size.
- An example audio workflow and scripts for frame inspection and export QA.

The default output is a 55–70 second vertical video at 1080 × 1920 and 30 fps. For rendering, use Node.js and npm with a headless browser supported by Remotion. The audio and QA workflows also use FFmpeg, FFprobe, and Python. [Project setup and render commands](references/production.md)

For an edit timed to supplied narration, word-highlighted Boogaloo captions, or the Konon Katanya Sih watermark, invoke the companion skill in the same request. [Codex Caption and Watermark](https://github.com/silenveritas/codex-caption-watermark)

[Skill instructions](SKILL.md) · [MIT license](LICENSE)
