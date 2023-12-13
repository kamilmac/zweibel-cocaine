import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { HBAOPass } from 'three/addons/postprocessing/HBAOPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/addons/shaders/DotScreenShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
// import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { ClearPass } from "three/addons/postprocessing/ClearPass.js";
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Stage } from "/gl6/stage.js";
import { Brick } from "/gl6/brick.js";

let renderer, camera, controls, scene, composer;


const bricks = [];

const setupGame = () => {
  renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    antialias: false,
    stencil: false,
    depth: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    1000,
  );
  

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  scene = new THREE.Scene();
  
  // Add ambient light to the scene
  // const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  // scene.add(ambientLight);



  // Add directional lights to the scene
  // const lightColorCyan = 0x00ffff;
  // const lightColorMagenta = 0xff00ff;
  // const lightColorYellow = 0xffff00;

  // const lightDistance = 10;
  // const angleOffset = Math.PI / 3; // 120 degrees in radians

  // const directionalLightCyan = new THREE.DirectionalLight(lightColorCyan, 3);
  // directionalLightCyan.position.set(
  //   10,30,30
  // );
  // scene.add(directionalLightCyan);

  // const directionalLightMagenta = new THREE.DirectionalLight(lightColorMagenta, 3);
  // directionalLightMagenta.position.set(
  //   -30,30,-30
  // );
  // scene.add(directionalLightMagenta);

  // const directionalLightYellow = new THREE.DirectionalLight(lightColorYellow, 3);
  // directionalLightYellow.position.set(
  //   30,30,-30
  // );
  // scene.add(directionalLightYellow);
  // const helper = new THREE.DirectionalLightHelper( directionalLightCyan, 5 );
  // const helper1 = new THREE.DirectionalLightHelper( directionalLightMagenta, 5 );
  // const helper2 = new THREE.DirectionalLightHelper( directionalLightYellow, 5);
  // scene.add( helper );
  // scene.add( helper1 );
  // scene.add( helper2 );
  
  // Set the logarithmic depth buffer to true to fix artifacts at far distances
  // renderer.logarithmicDepthBuffer = true;
  
  const stage = new Stage();
  
  renderFloor(stage);
  camera.position.x = 30;
  camera.position.y = 16;
  camera.position.z = 30;

  camera.position.x = stage.width / 2 - 0.5;
  camera.position.y = 30;
  camera.position.z = stage.depth / 2 - 0.5;
  
  
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  
  // const effect2 = new ShaderPass( RGBShiftShader );
  // effect2.uniforms[ 'amount' ].value = 0.0024;
  // composer.addPass( effect2 );

  
  const hbaoPass = new HBAOPass( scene, camera, width, height );
  hbaoPass.output = HBAOPass.OUTPUT.Default; // Changed from Denoise to Default to fix color visibility issue
  composer.addPass( hbaoPass );
  
  // const effect3 = new ShaderPass( DotScreenShader );
  // effect3.uniforms[ 'scale' ].value = 8;
  // composer.addPass( effect3 );

  const params = {
    shape: 4,
    radius: 2,
    rotateR: Math.PI / 12,
    rotateB: Math.PI / 12 * 2,
    rotateG: Math.PI / 12 * 3,
    scatter: 0.5,
    blending: 0.5,
    blendingMode: 1,
    greyscale: false,
    disable: false
  };
  const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );
  composer.addPass( halftonePass );
  
  // const saoPass = new SAOPass( scene, camera );
  // composer.addPass( saoPass );

  // const outputPass = new OutputPass();
  // composer.addPass( outputPass );

  const hbaoParameters = {
    radius: 2.,
    distanceExponent: 1.,
    bias: 0.01,
    samples: 24,
    halfRes: true,
  };
  const pdParameters = {
    lumaPhi: 100.,
    depthPhi: 2.,
    normalPhi: 3.,
    radius: 10.,
    rings: 4,
    samples: 12,
  };

  hbaoPass.updateHbaoMaterial( hbaoParameters );
  hbaoPass.updatePdMaterial( pdParameters );





// Init gui
// GUI

const controller = {
  radius: halftonePass.uniforms[ 'radius' ].value,
  rotateR: halftonePass.uniforms[ 'rotateR' ].value / ( Math.PI / 180 ),
  rotateG: halftonePass.uniforms[ 'rotateG' ].value / ( Math.PI / 180 ),
  rotateB: halftonePass.uniforms[ 'rotateB' ].value / ( Math.PI / 180 ),
  scatter: halftonePass.uniforms[ 'scatter' ].value,
  shape: halftonePass.uniforms[ 'shape' ].value,
  greyscale: halftonePass.uniforms[ 'greyscale' ].value,
  blending: halftonePass.uniforms[ 'blending' ].value,
  blendingMode: halftonePass.uniforms[ 'blendingMode' ].value,
  disable: halftonePass.uniforms[ 'disable' ].value
};

function onGUIChange() {

  // update uniforms
  halftonePass.uniforms[ 'radius' ].value = controller.radius;
  halftonePass.uniforms[ 'rotateR' ].value = controller.rotateR * ( Math.PI / 180 );
  halftonePass.uniforms[ 'rotateG' ].value = controller.rotateG * ( Math.PI / 180 );
  halftonePass.uniforms[ 'rotateB' ].value = controller.rotateB * ( Math.PI / 180 );
  halftonePass.uniforms[ 'scatter' ].value = controller.scatter;
  halftonePass.uniforms[ 'shape' ].value = controller.shape;
  halftonePass.uniforms[ 'greyscale' ].value = controller.greyscale;
  halftonePass.uniforms[ 'blending' ].value = controller.blending;
  halftonePass.uniforms[ 'blendingMode' ].value = controller.blendingMode;
  halftonePass.uniforms[ 'disable' ].value = controller.disable;

}

const gui = new GUI();
gui.add( controller, 'shape', { 'Dot': 1, 'Ellipse': 2, 'Line': 3, 'Square': 4 } ).onChange( onGUIChange );
gui.add( controller, 'radius', 1, 25 ).onChange( onGUIChange );
gui.add( controller, 'rotateR', 0, 90 ).onChange( onGUIChange );
gui.add( controller, 'rotateG', 0, 90 ).onChange( onGUIChange );
gui.add( controller, 'rotateB', 0, 90 ).onChange( onGUIChange );
gui.add( controller, 'scatter', 0, 1, 0.01 ).onChange( onGUIChange );
gui.add( controller, 'greyscale' ).onChange( onGUIChange );
gui.add( controller, 'blending', 0, 1, 0.01 ).onChange( onGUIChange );
gui.add( controller, 'blendingMode', { 'Linear': 1, 'Multiply': 2, 'Add': 3, 'Lighter': 4, 'Darker': 5 } ).onChange( onGUIChange );
gui.add( controller, 'disable' ).onChange( onGUIChange );



  let counter = 0;
  let frq = 2
  let bricksNum = 0;
  const animateScene = () => {
    if (counter % frq === 0) {
      bricks.forEach((brick) => brick.moveDown());
    }
    if (counter % 13 === 0) {
      // bricks.forEach((brick) => brick.rotate());
    }
    if (counter % (frq * 6) === 0) {
      bricks.push(new Brick(stage, scene));
      bricksNum += 1;
    }
    // if (counter % 120 === 0) {
    //   if (frq > 2) {
    //     frq -= 1
    //   }
    // }
    // controls.target.y = (bricksNum/(stage.width*stage.depth/2)) + 16;
    // controls.target.set(stage.width / 2 - 0.5, 8, stage.depth / 2 - 0.5);
    // camera.focalLength = 1;
    camera.fov = 35;
    const newCameraPosition = new THREE.Vector3(camera.position.x, 24 + stage.highestCube*0.8, camera.position.z);
    camera.position.lerp(newCameraPosition, 0.04);
    controls.target.lerp(new THREE.Vector3(stage.width / 2 - 0.5, 0 + stage.highestCube * 0.4, stage.depth / 2 - 0.5), 0.08);

    camera.updateProjectionMatrix();
    controls.update();
    composer.render();
    counter += 1;
    requestAnimationFrame(animateScene);
  };

  animateScene();
};



const renderFloor = (stage) => {
  const padding = 1
  // create plane for floor
  const w = stage.width + padding*2;
  const d = stage.depth + padding*2;
  const floorGeometry = new THREE.PlaneGeometry(
    w,d,w,d
  );
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xefefef, wireframe: true, castShadow: false, receiveShadow: true });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.x = w/2 - padding - 0.5;
  floor.position.z = d/2 - padding - 0.5;
  floor.position.y = 0.5;
  scene.add(floor);

  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0x00ff00,
  //   wireframe: false,
  // });

  // for (let x = 0; x < stage.width + 16; x++) {
  //   for (let y = 0; y < 1; y++) {
  //     for (let z = 0; z < stage.depth + 16; z++) {
  //       const cube = new THREE.Mesh(geometry, material);
  //       cube.position.x = x - 8;
  //       cube.position.y = y;
  //       cube.position.z = z - 8;
  //       scene.add(cube);
  //     }
  //   }
  // }
}









































// const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
// const wsEndpoint = protocol + window.location.host + '/daddy';
// var ws = new WebSocket(wsEndpoint);


// const normalizeAcc = (acc) => {
//   const x = acc[0] * acc[0] * acc[0] * 0.001;
//   const y = acc[1] * acc[1] * acc[1] * 0.001;
//   const z = acc[2] * acc[2] * acc[2] * 0.001;
//   // const magnitude = Math.sqrt(x * x + y * y + z * z);
//   // return [x / magnitude, y / magnitude, z / magnitude];
//   return [x, y, z];
// };

// ws.onmessage = function(event) {
//   if (event.data === 'hello daddy') { return };
//   const player = JSON.parse(event.data);

//   let acc = player.acc;
//   let rot = player.rot;
//   if (!PLAYERS[player.id]) {
//     PLAYERS[player.id] = player;
//     return;
//   }
//   id = player.id;
//   console.log(event.data)
//   PLAYERS[player.id].on = player.on;
//   PLAYERS[player.id].int = player.int;
//   PLAYERS[player.id].acc[0] = acc[0]
//   PLAYERS[player.id].acc[1] = acc[1]
//   PLAYERS[player.id].acc[2] = acc[2]
//   PLAYERS[player.id].rot[0] = rot[0]
//   PLAYERS[player.id].rot[1] = rot[1]
//   PLAYERS[player.id].rot[2] = rot[2]
// };

// const createRotationContainer = () => {
//   const container = document.createElement('div');
//   container.style.position = 'absolute';
//   container.style.top = '10px';
//   container.style.left = '10px';
//   container.style.color = 'white';
//   container.style.fontFamily = 'Arial';
//   container.style.fontSize = '14px';
//   document.body.appendChild(container);
//   return container;
// };
// const createAccContainer = () => {
//   const container = document.createElement('div');
//   container.style.position = 'absolute';
//   container.style.top = '40px';
//   container.style.left = '10px';
//   container.style.color = 'white';
//   container.style.fontFamily = 'Arial';
//   container.style.fontSize = '14px';
//   document.body.appendChild(container);
//   return container;
// };

// const container = createRotationContainer();
// const c2 = createAccContainer();

// setInterval(() => {
//   if (!id) return;
//   const rotation = PLAYERS[id].rot;
//   const acc = PLAYERS[id].acc;
//   container.innerHTML = `Rotation: X: ${rotation[0].toFixed(2)}, Y: ${rotation[1].toFixed(2)}, Z: ${rotation[2].toFixed(2)}`;
//   c2.innerHTML = `Acc: X: ${acc[0].toFixed(2)}, Y: ${acc[1].toFixed(2)}, Z: ${acc[2].toFixed(2)}`;
// }
// , 50);

setupGame();
