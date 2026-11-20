// Render each pose and post-processing pass before Remotion captures the canvas.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, cancelRender, continueRender, delayRender, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import type { Kit } from "./build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from "./story";

export const BRIDGE_FRAMES = TOTAL;

type PostOptions = {
  ink?: boolean; lens?: boolean; pre?: boolean; bloom?: boolean;
  grade?: boolean; grain?: boolean; dpr?: number;
};

function setup(canvas: HTMLCanvasElement, kit: Kit, width: number, height: number) {
  const { post = {} } = getInputProps() as { post?: PostOptions };
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(post.dpr ?? 1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 1500);
  const scene = new THREE.Scene();
  const world = new World(kit);
  scene.add(world.root);
  const composer = new EffectComposer(renderer, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  if (post.ink !== false) composer.addPass(new InkPass(scene, camera));
  const lens = new LensBlur({ maxCoC: 24, nearScale: 1.2 });
  if (post.lens !== false) {
    if (post.pre !== false) composer.addPass(new EffectPass(camera, lens.pre));
    composer.addPass(new EffectPass(camera, lens.main));
  }
  const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5,
    luminanceThreshold: 1, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  const grade = new GradeEffect(GRADES.day, GRADE_STRENGTH.day);
  const grain = new GrainEffect({ amount: 0.025, cellPx: 1.5 });
  composer.addPass(new EffectPass(camera, ...(post.bloom === false ? [] : [bloom]), tone,
    ...(post.grade === false ? [] : [grade]), ...(post.grain ? [grain] : [])));
  return { world, scene, camera, renderer, composer, lens, grade, grain };
}

const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<ReturnType<typeof setup> | null>(null);
  useLayoutEffect(() => {
    const view = setup(canvas.current!, kit, width, height);
    state.current = view;
    return () => {
      view.composer.dispose();
      view.renderer.dispose();
      view.renderer.forceContextLoss();
      state.current = null;
    };
  }, [kit, width, height]);
  useLayoutEffect(() => {
    const { camera, world, scene, lens, grade, grain, composer } = state.current!;
    const target = world.update(id, frame, camera, scene).clone();
    noInkFallback(world.root);
    const dof = dofAt(frame);
    if (dof.focus) target.set(...dof.focus(frame));
    lens.focus = Math.max(0.3, target.sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())));
    lens.cInf = dof.cInf;
    gradeFor(grade, SHOTS[id - 1].light);
    grain.seed = frame;
    composer.render(1 / fps);
  }, [frame, id, kit, fps, width, height]);
  return <AbsoluteFill style={{ opacity: alpha }}><canvas ref={canvas} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};

export const BridgeShort: React.FC = () => {
  const frame = useCurrentFrame();
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("Loading episode props"));
  useEffect(() => { loadKit().then(setKit).catch(cancelRender); }, []);
  useEffect(() => { if (kit) continueRender(handle); }, [handle, kit]);
  if (!kit) return null;
  const flash = frame >= FLASH_AT && frame < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][frame - FLASH_AT] : 0;
  return <AbsoluteFill style={{ background: "#cfe3f2" }}>
    {layersAt(frame).map((layer, index) => <ShotView key={index} id={layer.id} kit={kit} alpha={layer.alpha} />)}
    {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
  </AbsoluteFill>;
};
