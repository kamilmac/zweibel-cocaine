import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";

let renderer, camera, controls, scene, composer;

const BRICK_SHAPES = [
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1],
    [1],
    [1],
    [1],
  ],
  [
    [1],
    [1],
    [1, 1],
    [1, 1],
  ],
];

class Stage {
  constructor() {
    this.height = 24;
    this.width = 12;
    this.depth = 12;
    this.cubeSize = 64;
    this.init();
  }

  init() {
    this.cubes = [];
    for (let x = 0; x < this.width + 4; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.height + 4; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.depth + 4; z++) {
          this.cubes[x][y][z] = 0;
        }
      }
    }
  }

  setFilledCube(x, y, z, id) {
    this.cubes[x][y][z] = id;
  }

  setEmptyCube(x, y, z) {
    this.cubes[x][y][z] = 0;
  }

  isFilledCube(x, y, z) {
    return this.cubes[x][y][z] !== 0;
  }

  isColliding(x, y, z, id) {
    return this.cubes[x][y][z] !== 0 || this.cubes[x][y][z] !== id;
  }
}


const bricks = [];
class Brick {
  constructor(Stage) {
    this.stage = Stage;
    this.isImmobile = false;
    this.shape = BRICK_SHAPES[Math.floor(Math.random() * BRICK_SHAPES.length)];
    this.x = Math.floor(Math.random() * this.stage.width);
    this.y = this.stage.height - 1;
    this.z = Math.floor(Math.random() * this.stage.depth);
    this.color = 0xff0000;
    this.mounted = false;
    this.id = Math.ceil(Math.random() * 100000000000000000);
    this.threeObjectGroup = new THREE.Group();
    this.createThreeObjectGroup();
  }

  makeImmobile() {
    this.isImmobile = true;
  }

  moveLeft() {
    if (this.isImmobile) return;
    this.threeObjectGroup.position.x -= 1;
    this.x -= 1;
  }

  moveRight() {
    if (this.isImmobile) return;
    this.threeObjectGroup.position.x += 1;
    this.x += 1;
  }

  moveDown() {
    if (this.isImmobile) return;
    this.clearFromStage();
    this.y -= 1;
    const isColliding = this.checkForCollision();
    if(isColliding) {
      this.y += 1;
      this.makeImmobile();
    } else {
      this.threeObjectGroup.position.y -= 1;
    }
    this.updateStage();
    if (this.y === 0) {
      this.makeImmobile();
    }
  }

  checkForCollision() {
    let isColliding = false
    for (let x = 0; x < this.shape.length; x++) {
      for (let y = 0; y < this.shape[x].length; y++) {
        if (this.shape[x][y] === 1) {
          if (this.stage.isFilledCube(this.x + x, this.y + y, this.z)) {
            isColliding = true;
          }
        }
      }
    }
    console.log(isColliding)
    return isColliding;
  }

  clearFromStage() {
    for (let x = 0; x < this.shape.length; x++) {
      for (let y = 0; y < this.shape[x].length; y++) {
        if (this.shape[x][y] === 1) {
          this.stage.setEmptyCube(this.x + x, this.y + y, this.z);
        }
      }
    }
  }

  updateStage() {
    for (let x = 0; x < this.shape.length; x++) {
      for (let y = 0; y < this.shape[x].length; y++) {
        if (this.shape[x][y] === 1) {
          this.stage.setFilledCube(this.x + x, this.y + y, this.z, this.id);
        }
      }
    }
  }

  createThreeObjectGroup() {
    for (let x = 0; x < this.shape.length; x++) {
      for (let y = 0; y < this.shape[x].length; y++) {
        if (this.shape[x][y] === 1) {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshBasicMaterial({
            color: this.color,
            wireframe: true,
          });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.x = this.x + x;
          cube.position.y = this.y + y;
          cube.position.z = this.z;
          this.threeObjectGroup.add(cube);
        }
      }
    }
    scene.add(this.threeObjectGroup);
    this.mounted = true;
  }
}

const setupGame = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.0001,
    100,
  );
  camera.position.z = 2;
  camera.position.y = 1;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  scene = new THREE.Scene();

  const stage = new Stage();
  renderFloor(stage);
  bricks.push(new Brick(stage));
  // setInterval(() => {
  //   b1.moveDown();
  // }, 512)
  // const geometry = new THREE.PlaneGeometry(1, 1, 8, 8);
  // geometry.rotateX(-Math.PI / 2);
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0xcd3d3d3,
  //   wireframe: true,
  // });
  // const plane = new THREE.Mesh(geometry, material);
  // scene.add(plane);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  let counter = 0;
  const animateScene = () => {
    if (counter % 20 === 0) {
      bricks.forEach((brick) => brick.moveDown());
    }
    if (counter % 180 === 0) {
      bricks.push(new Brick(stage));
    }
    requestAnimationFrame(animateScene);
    controls.update();
    composer.render();
    counter += 1;
  };

  animateScene();
};

const renderFloor = (stage) => {
  const geometry = new THREE.BoxGeometry(1, 0.1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });

  for (let x = 0; x < stage.width; x++) {
    for (let y = 0; y < 1; y++) {
      for (let z = 0; z < stage.depth; z++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y - 0.6;
        cube.position.z = z;
        scene.add(cube);
      }
    }
  }
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
