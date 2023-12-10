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
    this.padding = 4
    this.init();
  }

  init() {
    this.cubes = [];
    for (let x = 0; x < this.width + this.padding; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.height + this.padding; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.depth + this.padding; z++) {
          this.cubes[x][y][z] = 0;
          if (y === 0) {
            this.cubes[x][y][z] = 1;
          }
        }
      }
    }
  }

  setFilledCube(x, y, z, id) {
    if (this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined) {
      this.cubes[x][y][z] = id;
    }
  }

  setEmptyCube(x, y, z) {
    if (this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined) {
      this.cubes[x][y][z] = 0;
    }
  }

  isFilledCube(x, y, z) {
    if (this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined) {
      return this.cubes[x][y][z] !== 0;
    }
    return false;
  }
}


const bricks = [];

class Brick {
  constructor(Stage) {
    this.stage = Stage;
    this.isImmobile = false;
    this.color = 0xff0000;
    this.id = Math.ceil(Math.random() * 100000000000000000);
    this.cubes = [];
    const shape = BRICK_SHAPES[Math.floor(Math.random() * BRICK_SHAPES.length)];
    this.mount(
      shape,
      {
        x: Math.floor(Math.random() * this.stage.width),
        y: this.stage.height - 1,
        z: Math.floor(Math.random() * this.stage.depth),
      }
    );
  }

  makeImmobile() {
    this.isImmobile = true;
  }

  moveLeft() {
    if (this.isImmobile) return;
    this.x -= 1;
  }

  moveRight() {
    if (this.isImmobile) return;
    this.x += 1;
  }

  moveDown() {
    if (this.isImmobile) return;
    this.clearFromStage();
    const newPosition = this.cubes.map(cube => [
      cube.position.x,
      cube.position.y - 1,
      cube.position.z,
    ]);
    const isColliding = this.checkForCollision(newPosition);
    if(isColliding) {
      this.makeImmobile();
    } else {
      this.applyNewPosition(newPosition);
    }
    this.updateStage();
  }

  applyNewPosition(newPosition) {
    this.cubes.forEach((cube, index) => {
      cube.position.x = newPosition[index][0];
      cube.position.y = newPosition[index][1];
      cube.position.z = newPosition[index][2];
    });
  }

  checkForCollision(newPosition) {
    let isColliding = false
    newPosition.forEach((position) => {
      if (this.stage.isFilledCube(position[0], position[1], position[2])) {
        isColliding = true;
      }
    });
    return isColliding;
  }

  rotate() {
    if (this.isImmobile) return;
    this.clearFromStage();
    const pivot = this.cubes[0].position;
    const newPosition = this.cubes.map(cube => {
      const x = cube.position.x - pivot.x;
      const y = cube.position.y - pivot.y;
      return [
        pivot.x - y,
        pivot.y + x,
        cube.position.z,
      ];
    });
    const isColliding = this.checkForCollision(newPosition);
    if(!isColliding) {
      this.applyNewPosition(newPosition);
    }
    this.updateStage();
  }

  clearFromStage() {
    this.cubes.forEach((cube) => {
      this.stage.setEmptyCube(cube.position.x, cube.position.y, cube.position.z);
    });
  }

  updateStage() {
    this.cubes.forEach((cube) => {
      this.stage.setFilledCube(cube.position.x, cube.position.y, cube.position.z, this.id);
    });
  }

  mount(shape, startPosition) {
    for (let x = 0; x < shape.length; x++) {
      for (let y = 0; y < shape[x].length; y++) {
        if (shape[x][y] === 1) {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshBasicMaterial({
            color: this.color,
            wireframe: false,
          });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.x = startPosition.x + x;
          cube.position.y = startPosition.y + y;
          cube.position.z = startPosition.z;
          this.cubes.push(cube);
          scene.add(cube);
        }
      }
    }
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
  // bricks.push(new Brick(stage));
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
    if (counter % 2 === 0) {
      bricks.forEach((brick) => brick.moveDown());
    }
    if (counter % 50 === 0) {
      bricks.forEach((brick) => brick.rotate());
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
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: false,
  });

  for (let x = 0; x < stage.width + 16; x++) {
    for (let y = 0; y < 1; y++) {
      for (let z = 0; z < stage.depth + 16; z++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x - 8;
        cube.position.y = y;
        cube.position.z = z - 8;
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
