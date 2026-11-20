// Original modular blocking kit; units in metres, +Y up, +Z towards the yard.
import * as THREE from 'three';

export function createPorch() {
  const root = new THREE.Group();
  function box(parent, name, size, position, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({color}));
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  for (let i = 0; i < 16; i++) box(root, 'floorboard', [.245,.08,2.4], [i*.25-1.875,-.04,0], '#96714e');
  for (const x of [-1.9,1.9]) box(root,'post',[.12,2.5,.12],[x,1.25,.95],'#76513f');
  const shutter = new THREE.Group();
  shutter.position.set(-.65,1.25,-1.1);
  root.add(shutter);
  box(shutter,'shutter',[.7,.85,.05],[.35,.425,0],'#796959');
  const latch = box(shutter,'latch',[.13,.035,.05],[.61,.39,.055],'#574d43');
  box(root,'tabletop',[1.1,.06,.65],[0,.74,.25],'#ae7952');
  for(const x of [-.46,.46]) for(const z of [0,.5]) box(root,'leg',[.06,.71,.06],[x,.355,z],'#72533f');
  const cup = new THREE.Group();
  root.add(cup);
  cup.position.set(.12,.77,.36);
  const profile = [[.032,0],[.047,.075],[.043,.075],[.029,.008]].map(([x,y])=>new THREE.Vector2(x,y));
  cup.add(new THREE.Mesh(new THREE.LatheGeometry(profile,48),new THREE.MeshStandardMaterial({color:'#eee1c3',side:THREE.DoubleSide})));
  const tea = new THREE.Mesh(new THREE.CircleGeometry(.042,48),new THREE.MeshStandardMaterial({color:'#5e3221'}));
  tea.rotation.x=-Math.PI/2;
  tea.position.y=.068;
  cup.add(tea);
  const spoon = new THREE.Group();
  cup.add(spoon);
  spoon.position.y=.068;
  box(spoon,'spoon-stem',[.004,.095,.003],[0,.03,0],'#c3beb6');
  const grip = new THREE.Object3D();
  grip.position.y=.067;
  spoon.add(grip);
  function stir(phase) {
    spoon.position.x=.012*Math.cos(phase);
    spoon.position.z=.012*Math.sin(phase);
    spoon.rotation.z=.17;
  }
  return {root,shutter,latch,cup,spoon,grip,stir};
}
