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

// Film grain shader for VHS tape effect
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    grainIntensity: { value: 0.12 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float grainIntensity;
    varying vec2 vUv;

    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233)) + time * 0.001) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Generate grain
      float grain = random(vUv * 2.0);
      grain = (grain - 0.5) * grainIntensity;

      // Apply grain
      color.rgb += vec3(grain);

      gl_FragColor = color;
    }
  `
};

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
  scene.background = new THREE.Color(0x0a0a0a);
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

  const grainPass = new ShaderPass(FilmGrainShader);
  composer.addPass(grainPass);

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

    // Update grain animation
    grainPass.uniforms.time.value = performance.now();

    composer.render();
  };

  animateScene();
};

setupThree();
