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

let xx = 0;
let yy = 0;
let zz = 0;

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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });

  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bokehPass = new BokehPass(scene, camera, {
    focus: 0.08,
    aperture: 0.82,
    maxblur: 0.0044,
  });
  composer.addPass(bokehPass);

  const effect2 = new ShaderPass(RGBShiftShader);
  effect2.uniforms["amount"].value = 0.004;
  composer.addPass(effect2);

  const effect3 = new OutputPass();
  composer.addPass(effect3);

  const animateScene = () => {
    requestAnimationFrame(animateScene);

    plane.position.x = -xx;
    plane.position.y = -yy;
    plane.position.z = -zz;

    controls.update();
    composer.render();
  };

  animateScene();
};

// const acl = new Accelerometer({ frequency: 60 });
// acl.addEventListener("reading", () => {
//   alert(acl.x)
//   console.log(`Acceleration along the X-axis ${acl.x}`);
//   console.log(`Acceleration along the Y-axis ${acl.y}`);
//   console.log(`Acceleration along the Z-axis ${acl.z}`);
// });

// acl.start();
// window.addEventListener("devicemotion", (event) => {
//   xx = event.acceleration.x / 10;
//   yy = event.acceleration.y / 10;
//   zz = event.acceleration.z / 10;
//   console.log(`${event.acceleration.x} m/s2`);
// });
// alert(window.DeviceOrientationEvent)
// let gyroscope = new Gyroscope({ frequency: 60 });

// gyroscope.addEventListener("reading", (e) => {
//   alert('g')
//   console.log(`Angular velocity along the X-axis ${gyroscope.x}`);
//   console.log(`Angular velocity along the Y-axis ${gyroscope.y}`);
//   console.log(`Angular velocity along the Z-axis ${gyroscope.z}`);
// });
// gyroscope.start();
const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
const wsEndpoint = protocol + window.location.host + '/daddy';
var ws = new WebSocket(wsEndpoint);

const PLAYERS = {};

ws.onmessage = function(event) {
  const player = JSON.parse(event.data);
  let acc = player.pos;
  // if (
  //   Math.abs(acc[0]) < 0.1 ||
  //   Math.abs(acc[1]) < 0.1 ||
  //   Math.abs(acc[2]) < 0.1
  // ) {
  //   acc = [0, 0, 0]
  // }
  if (!PLAYERS[player.id]) {
    PLAYERS[player.id] = player;
    return;
  }
  PLAYERS[player.id].pos[0] = acc[0]
  PLAYERS[player.id].pos[1] = acc[1]
  PLAYERS[player.id].pos[2] = acc[2]
  // console.log(PLAYERS)
};

setupThree();
