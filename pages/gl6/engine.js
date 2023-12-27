import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { HBAOPass } from 'three/addons/postprocessing/HBAOPass.js';

// import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// import Lifeforms from "lifeforms";

export class Engine {
  constructor(stage) {
    this.stage = stage;
    this.boxes = [];
    this.setup();
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
    this.camera.position.x = 12;
    this.camera.position.y = 6;
    this.camera.position.z = 12;
    this.camera.updateProjectionMatrix();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(
      this.stage.width / 2 - 0.5,
      0,
      this.stage.depth / 2 - 0.5,
    );
    this.controls.update();
    this.scene = new THREE.Scene();

    this.renderFloor();
  }

  handleActiveCube(cube, x, y, z) {
    if (this.boxes[cube.id]) {
      console.log("cube exists", x, y, z);
      this.boxes[cube.id]._targetPosition = new THREE.Vector3(x, y, z);
      this.boxes[cube.id]._lerpDone = false;
      return;
    }
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: cube.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    this.scene.add(mesh);
    this.boxes[cube.id] = mesh;
  }

  handleLockedCube(cube, x, y, z) {
    if (this.boxes[cube.id]) {
      this.boxes[cube.id].material.color.setHex(0xff0000);
      this.boxes[cube.id]._targetScale = new THREE.Vector3(0.9, 0.9, 0.9);
      this.boxes[cube.id]._targetPosition = new THREE.Vector3(x, y, z);
      this.boxes[cube.id]._lerpDone = false;
    }
  }

  handleEmptyCube(cube, x, y, z) {
    if (this.boxes[cube.id]) {
      this.boxes[cube.id].material.color.setHex(0x000000);
      this.boxes[cube.id]._targetScale = new THREE.Vector3(0.0, 0.0, 0.0);
      this.boxes[cube.id]._lerpDone = false;
      // this.scene.remove(this.boxes[cube.id]);
      // delete this.boxes[cube.id];
    }
  }

  renderFloor() {
    const geometry = new THREE.BoxGeometry(this.stage.width, 1, this.stage.depth);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = this.stage.width / 2 - 0.5;
    mesh.position.y = -1;
    mesh.position.z = this.stage.depth / 2 - 0.5;
    this.scene.add(mesh);
  }

  lerpTargets() {
    this.boxes.forEach((box) => {
      if (box._targetPosition && !box._lerpDone) {
        box.position.lerp(box._targetPosition, 0.2);
        if (box.position.distanceTo(box._targetPosition) < 0.001) {
          box._lerpDone = true;
        }
      }
      if (box._targetScale) {
        box.scale.lerp(box._targetScale, 0.2);
      }
    });
  }

  applyStage() {
    if (this.stage.dirty) {
      for (let x = 0; x < this.stage.width; x++) {
        for (let y = 0; y < this.stage.height; y++) {
          for (let z = 0; z < this.stage.depth; z++) {
            const cube = this.stage.cubes[x][y][z];
            if (cube?.dirty) {
              if (cube.state === "active") {
                this.handleActiveCube(cube, x, y, z);
              } else if (cube.state === "locked") {
                this.handleLockedCube(cube, x, y, z);
              } else if (cube.state === "empty") {
                this.handleEmptyCube(cube, x, y, z);
              }
              cube.dirty = false;
            }
          }
        }
      }
      this.stage.dirty = false;
    }
  }

  render() {
    this.applyStage();
    this.lerpTargets();
    this.renderer.render(this.scene, this.camera);
  }
}

