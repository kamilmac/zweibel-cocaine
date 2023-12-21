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

class Game {
  constructor() {
    this.stage = new Stage();
    this.brick = new Brick(this.stage);
    this.renderer = new Renderer(this.stage);
    this.initGameLoop();
  }

  initGameLoop() {
    setInterval(() => {
      this.brick.moveDown();
      this.brick.rotate()
    }, 1000);
  }
}


class Renderer {
  constructor(stage) {
    this.stage = stage;
    this.boxes = [];
    this.setup();
    this.animate();
  }

  setup() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000,
    );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.scene = new THREE.Scene();
    this.camera.position.x = this.stage.width / 2 - 0.5;
    this.camera.position.y = 30;
    this.camera.position.z = 15;
  }

  animate = () => {
    for (let x = 0; x < this.stage.width; x++) {
      for (let y = 0; y < this.stage.height; y++) {
        for (let z = 0; z < this.stage.depth; z++) {
          const cube = this.stage.cubes[x][y][z];
          // if (cube.dirty) {
            if (cube.state === "active") {
              console.log(cube, this.boxes);
              if (this.boxes[cube.id]) {
                // this.boxes[cube.id].position.x = x;
                // this.boxes[cube.id].position.y = y;
                // this.boxes[cube.id].position.z = z;
                this.boxes[cube.id].position.lerp(new THREE.Vector3(x, y, z), 0.16);
              } else {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: cube.color });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = x;
                mesh.position.y = y;
                mesh.position.z = z;
                this.scene.add(mesh);
                this.boxes[cube.id] = mesh;
              }
              cube.dirty = false;  
            }
          // }
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }
}

new Game()