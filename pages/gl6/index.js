import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { HBAOPass } from 'three/addons/postprocessing/HBAOPass.js';

import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Stage } from "/gl6/stage.js";
import { Brick } from "/gl6/brick.js";
import Lifeforms from "lifeforms";

const lf = new Lifeforms();
lf
  // .oscillate({ speed: 20, space: 'xyz', distance: 0.001 })
  // .oscillate(0.001, 'xyz')
  .randomWalk()
  .scaleBy(0.1);

let renderer, camera, controls, scene, composer;


const bricks = [];

function generatePastelColor() {
  const hue = Math.random();
  const saturation = 1;
  const lightness = 0.5;
  const color = new THREE.Color().setHSL(hue, saturation, lightness);
  return color;
}

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
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 0.5;
  scene = new THREE.Scene();

  const stage = new Stage();

  renderFloor(stage);

  camera.position.x = stage.width / 2 - 0.5;
  camera.position.y = 30;
  camera.position.z = 15;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const hbaoPass = new HBAOPass(scene, camera, width, height);
  hbaoPass.output = HBAOPass.OUTPUT.Default; // Changed from Denoise to Default to fix color visibility issue
  composer.addPass(hbaoPass);

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
  const halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, params);
  composer.addPass(halftonePass);

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

  hbaoPass.updateHbaoMaterial(hbaoParameters);
  hbaoPass.updatePdMaterial(pdParameters);


  let counter = 0;
  let frq = 16
  // let bricksNum = 0;
  const animateScene = () => {
    if (counter % frq === 0) {
      bricks.forEach((brick) => brick.moveDown());
    }
    let playerAdded = false
    // bricks.forEach((brick) => {
    //   if (counter % Math.ceil(Math.random() * 660) === 0) {
    //     brick.rotate();
    //   }
    //   if (counter % Math.ceil(Math.random() * 920) === 0) {
    //     brick.moveClose();
    //   }
    //   if (counter % Math.ceil(Math.random() * 920) === 0) {
    //     brick.moveFar();
    //   }
    //   if (counter % Math.ceil(Math.random() * 920) === 0) {
    //     brick.moveLeft();
    //   }
    //   if (counter % Math.ceil(Math.random() * 920) === 0) {
    //     brick.moveRight();
    //   }
    // });
    if (counter % (frq * 10) === 0) {
      PLAYERS.forEach((player) => {
        if (!player.isDriving && !playerAdded) {
          player.isDriving = true;
          playerAdded = true
          const brick = new Brick(stage, scene, player.id);
          bricks.push(brick);
        }
      });
    }
    const p = lf.get()
    camera.position.x = stage.width / 2 - 0.5 + Math.sin(p[0] * 10) * 3;
    camera.position.z = 14 + Math.cos(p[2] * 18) * 5;

    camera.fov = 35;
    const newCameraPosition = new THREE.Vector3(camera.position.x, 32 + stage.highestCube * 0.8, camera.position.z);
    camera.position.lerp(newCameraPosition, 0.04);
    controls.target.lerp(new THREE.Vector3(stage.width / 2 - 0.5, 0 + stage.highestCube * 0.4, stage.depth / 2 - 0.5), 0.08);

    camera.updateProjectionMatrix();
    controls.update();
    composer.render();
    counter += 1;
    requestAnimationFrame(animateScene);
    frq = 16 - Math.floor(PLAYERS.length / 2)
  };

  animateScene();
};



const renderFloor = (stage) => {
  const padding = 1
  // create plane for floor
  const w = stage.width + padding * 2;
  const d = stage.depth + padding * 2;
  const floorGeometry = new THREE.PlaneGeometry(
    w, d, w, d
  );
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xefefef, wireframe: true, castShadow: false, receiveShadow: true });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.x = w / 2 - padding - 0.5;
  floor.position.z = d / 2 - padding - 0.5;
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









































const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
const wsEndpoint = protocol + window.location.host + '/daddy';
const ws = new WebSocket(wsEndpoint);

window.PLAYERS = [];
let activePlayerIndex = 0;

ws.onmessage = function(event) {
  if (event.data.startsWith('register_player')) {
    const color = generatePastelColor();
    const player = {
      id: '',
      turns: 0,
      color,
      isDriving: false,
      alive: true,
    }
    player.id = event.data.split('register_player_')[1];
    ws.send(`color_${player.id}_#${color.getHexString()}`)
    console.log('registering', color.getHexString());
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.style.backgroundColor = color.getStyle();
    document.querySelector('.players').appendChild(playerDiv);
    console.log('registered', player);
    PLAYERS.push(player);
  } else if (event.data.startsWith('swipe_right')) {
    const id = event.data.split('swipe_right_')[1];
    const player = PLAYERS.find(p => p.id === id);
    bricks.forEach((block) => {
      if (block.playerId === id) {
        block.moveRight();
      }
    })
  } else if (event.data.startsWith('swipe_left')) {
    const id = event.data.split('swipe_left_')[1];
    const player = PLAYERS.find(p => p.id === id);
    bricks.forEach((block) => {
      if (block.playerId === id) {
        block.moveLeft();
      }
    })
  } else if (event.data.startsWith('swipe_down')) {
    const id = event.data.split('swipe_down_')[1];
    const player = PLAYERS.find(p => p.id === id);
    bricks.forEach((block) => {
      if (block.playerId === id) {
        block.moveClose();
      }
    })
  } else if (event.data.startsWith('swipe_up')) {
    const id = event.data.split('swipe_up_')[1];
    const player = PLAYERS.find(p => p.id === id);
    bricks.forEach((block) => {
      if (block.playerId === id) {
        block.moveFar();
      }
    })
  } else if (event.data.startsWith('rotate')) {
    const id = event.data.split('rotate_')[1];
    const player = PLAYERS.find(p => p.id === id);
    bricks.forEach((block) => {
      if (block.playerId === id) {
        block.rotate();
      }
    })
  }
  console.log(event.data);
};

// const normalizeAcc = (acc) => {
//   const x = acc[0] * acc[0] * acc[0] * 0.001;
//   const y = acc[1] * acc[1] * acc[1] * 0.001;
//   const z = acc[2] * acc[2] * acc[2] * 0.001;
//   // const magnitude = Math.sqrt(x * x + y * y + z * z);
//   // return [x / magnitude, y / magnitude, z / magnitude];
//   return [x, y, z];
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

var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: window.location.origin,
  width: 196,
  height: 196,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H
});
