import * as THREE from "three";

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

function generatePastelColor() {
  const hue = Math.random();
  const saturation = 1;
  const lightness = 0.5;
  const color = new THREE.Color().setHSL(hue, saturation, lightness);
  return color;
}

export class Brick {
  constructor(stage, scene) {
    this.stage = stage;
    this.scene = scene;
    this.isImmobile = false;
    this.color = generatePastelColor();
    this.id = Math.ceil(Math.random() * 100000000000000000);
    this.cubes = [];
    this.shadowPlanes = [];
    const shape = BRICK_SHAPES[Math.floor(Math.random() * BRICK_SHAPES.length)];
    this.mount(
      shape,
      {
        x: Math.floor(Math.random() * (this.stage.width - 3)),
        y: this.stage.height - 1,
        z: Math.floor(Math.random() * this.stage.depth),
      }
    );
  }
  
  getBox(color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1).scale(0.9, 0.9, 0.9);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  makeImmobile() {
    this.isImmobile = true;
    this.cubes.forEach((cube) => {
      this.stage.markAsImmobile(cube.position.x, cube.position.y, cube.position.z);
    });
    this.shadowPlanes.forEach((plane) => {
      this.scene.remove(plane);
    })
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
    if (isColliding) {
      this.makeImmobile();
      this.cubes.forEach((cube) => {
        cube.geometry.scale(1.1, 1.1, 1.1);
        cube.material.color = new THREE.Color().setHSL(1, 0, 0.85);
        this.stage.updateHighestCube(cube.position.y);
      })
    } else {
      this.applyNewPosition(newPosition);
      this.updateStage();
    }
  }

  applyNewPosition(newPosition) {
    this.cubes.forEach((cube, index) => {
      cube.position.x = newPosition[index][0];
      cube.position.y = newPosition[index][1];
      cube.position.z = newPosition[index][2];
    });
    this.recalculateShadow();
  }

  recalculateShadow() {
    this.shadowPlanes.forEach((plane) => {
      const y = this.stage.getTopYInColumn(plane.position.x, plane.position.z);
      plane.position.y = y + 0.501
    })
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
    if (!isColliding) {
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
          const cube = this.getBox(this.color);
          cube.position.x = startPosition.x + x;
          cube.position.y = startPosition.y + y;
          cube.position.z = startPosition.z;
          this.cubes.push(cube);
          this.scene.add(cube);
          // add shadow
          const planeGeometry = new THREE.PlaneGeometry(1, 1);
          const planeMaterial = new THREE.MeshBasicMaterial({
            // color: new THREE.Color(this.color).offsetHSL(0, -0.2, 0.2),
            color: this.color,
            side: THREE.DoubleSide,
          });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.rotation.x = Math.PI / 2;
          plane.position.x = startPosition.x + x;
          plane.position.y = 0.501;
          plane.position.z = startPosition.z;
          plane.scale.set(0.9, 0.9, 0.9); // Scale the plane to 0.8
          this.shadowPlanes.push(plane);
          this.scene.add(plane);
        }
      }
    }
  }
}