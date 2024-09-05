import Lifeforms from "./lifeforms.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";

const lf = new Lifeforms();

lf
  .randomWalk()
  .sphereWalk()
  .scaleBy(0.1);

const setupThree = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('canvas').appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(
    120,
    window.innerWidth / window.innerHeight,
    0.0001,
    100,
  );
  camera.position.z = 2;

  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  // controls.autoRotate = true

  const scene = new THREE.Scene();
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xbcbcbc,
    linewidth: 1,
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);

  line.frustumCulled = false;
  scene.add(line);

  const target = new THREE.Vector3();
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bokehPass = new BokehPass( scene, camera, {
		focus: 0.08,
		aperture: 0.82,
		maxblur: 0.0044
	} );
  composer.addPass( bokehPass );

  const rgbShift = new ShaderPass(RGBShiftShader);
  rgbShift.uniforms.amount.value = 0.004;
  composer.addPass(rgbShift);

  const outPass = new OutputPass();
  composer.addPass(outPass);

  const animateScene = () => {
    requestAnimationFrame(animateScene);
    const n = new THREE.Vector3(...lf.get());
    const cam = new THREE.Vector3(...lf.get());
    cam.z += 0.08;
    points.push(n);
    lineGeometry.setFromPoints(points);
    controls.target.copy(target.lerp(n, 0.01));
    controls.position = camera.position.lerp(cam, 0.04);
    controls.cursor = target.lerp(n, 0.01);
    controls.update();
    composer.render();
  };

  animateScene();
};

setupThree();
