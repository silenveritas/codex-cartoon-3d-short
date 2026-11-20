---
name: codex-cartoon-3d-short
description: Create a vertical animated short with ink-outlined 2D cartoon characters in a painted 3D world using three.js and Remotion. Use for history, science, or Indonesian folklore stories, including shorts in the style of the marching soldiers and bridge example.
---

# Codex Cartoon 3D Short

Use the episode brief to set the runtime. Default to 55–70 seconds at 1080 × 1920 and 30 fps. The production workflow runs on its own. When the brief also calls for the optional finishing preset, use `$codex-caption-watermark` alongside it. Consult that skill before locking the shot plan if the recording sets the runtime.

## Script and narration

- For history or science, record the facts and their sources at the top of `SCRIPT.md`. Choose an event with a visible cause and effect. Introduce the surprising fact, build toward a turning point, explain the mechanism through an everyday analogy, and pay off the opening in the final beat. Ground factual jokes in research. For folklore, identify the version being told and any dramatized details. [Bridge script example](templates/SCRIPT_example.md)
- For new narration, use an original voice with a consistent tone. With recorded dialogue, use the words actually spoken to time reactions. The audio template reads cues in seconds from `voice/words.json`, for example `[{"w":"Listen","s":0.12,"e":0.42}]`.
- Once the script is approved or the user requests direct production, carry the episode through the requested stage. Save each stage in the episode workspace so production can resume from it.

## Shots, sets, and characters

1. Plan each shot with its inclusive start and exclusive end frame, cue, action and consequence, actor and prop positions, camera, and point of focus. Time a visual reaction to land 0–3 frames before its cue word. For Indonesian productions and new settings, consult the [location and staging guide](references/indonesia-direction.md) before building the set.
2. Copy the starter into the episode workspace or register a composition in the existing project. Adapt the cast, buildings, terrain, props, camera moves, and sound to the story. The bridge timeline shows how to key shots, crossfades, impact shakes, foreground objects, and depth of field to frames. [Project setup and render commands](references/production.md) · [Bridge timeline](templates/bridge/story.ts)
3. Draw bean-shaped heads, stick limbs, varied plum outlines, blinks, planted feet, and contact shadows. Face character cards toward the camera, light them with the scene, and assign them to the `NOINK` layer to prevent double outlines. Use painted textures, two-tone lighting, perspective, and horizon-colored fog for depth. Keep establishing shots sharp, focus close-ups on the eyes, and move the camera when it reveals new information.
4. Apply world ink, lens pre-pass, lens main pass, bloom, neutral tone mapping, and grade in that order. Scale pixel-sized effects with output height. Use the [bridge look measurements](references/bridge-look.md) to tune ink, color, lighting, depth, and movement. Use privately held comparison materials only when available. Keep reference frames and comparison sheets local and outside render bundles and deliverables. Use original stories, shots, characters, and voices. Omit the reference channel's name from narration and descriptions.

## Sound and export

- Lock the picture before scoring music and placing SFX. Apply the standard offsets once against the baseline mix, raising music by 3 dB and lowering SFX by 6 dB. Keep narration gain steady and duck the music under speech. The bridge audio example contains story-specific event times, score, gains, and caches. Adapt them in the episode copy and regenerate affected stems when timing changes. Produce a 48 kHz stereo mix spanning the picture, stems, and cue notes. [Audio template](templates/audio/)
- Render stills of the opening, the midpoint of a camera move, prop contact, both sides of cuts, and the ending. Open the images and inspect silhouettes, eyelines, feet, lighting, focus, and ink at phone size. Play the animatic with sound to check timing. Record frame numbers for defects, fix them, and inspect the same frames again.
- Render the final H.264 MP4 at native scale. Mux the picture and intended audio streams explicitly. Run the frame and audio checks on the final file, open the contact sheets, and compare flagged freezes, flashes, and cuts with the shot plan. Repeat QA after repairs. Deliver a local file link to the checked MP4 and save the inspection notes in the project. [Render and QA commands](references/production.md)
