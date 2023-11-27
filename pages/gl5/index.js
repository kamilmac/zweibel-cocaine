import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import Lifeforms from "lifeforms";

const lf = new Lifeforms();

lf
  // .oscillate({ speed: 20, space: 'xyz', distance: 0.001 })
  // .oscillate(0.001, 'xyz')
  .randomWalk()
  .sphereWalk()
  .scaleBy(0.1);

const setupThree = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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

  // const sphereGeo = new THREE.SphereGeometry(0.01, 32, 32);
  // const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
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
   // const afterimagePass = new AfterimagePass();
  // composer.addPass( afterimagePass );
  //  afterimagePass.uniforms['damp'] = { value: 0.7 };
  const effect2 = new ShaderPass(RGBShiftShader);
  effect2.uniforms["amount"].value = 0.004;
  composer.addPass(effect2);

  // const effect1 = new ShaderPass( DotScreenShader );
  // effect1.uniforms[ 'scale' ].value = 0.32;
  // composer.addPass( effect1 );
composer.addPass( bokehPass );
  const effect3 = new OutputPass();
  composer.addPass(effect3);
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
    // controls.zoomToCursor = true
    // controls.zoom = 3
    controls.update();
    // renderer.render(scene, camera);
    composer.render();
  };

  animateScene();
};

setupThree();
