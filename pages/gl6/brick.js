export class Brick {
  static SHAPES = [
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
      [1, 0],
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
    [
      [1, 0],
      [1, 0],
    ],
  ];
  
  static idCounter = 0;

  constructor(stage) {
    this.stage = stage;
    this.locked = false;
    this.color = 0x008833;
    this.id = Brick.idCounter++;
    this.cubes = [];
    this.create();
  }

  lock() {
    this.locked = true;
    this.cubes.forEach((cube) => {
      cube.locked = true;
    });
    this.updateStage();
  }

  move(x, z) {
    if (this.locked) return;
    this.clearFromStage();
    const newPosition = this.cubes.map(cube => [
      cube.position[0] + x,
      cube.position[1],
      cube.position[2] + z,
    ]);
    if (!this.isColliding(newPosition)) {
      this.applyNewPosition(newPosition);
    }
  }

  moveDown() {
    if (this.locked) return;
    this.clearFromStage();
    const newPosition = this.cubes.map(cube => [
      cube.position[0],
      cube.position[1] - 1,
      cube.position[2],
    ]);
    if (this.isColliding(newPosition)) {
      this.lock();
    } else {
      this.applyNewPosition(newPosition);
    }
  }

  applyNewPosition(newPosition) {
    for (let index = 0; index < this.cubes.length; index += 1) {
      this.cubes[index].position[0] = newPosition[index][0];
      this.cubes[index].position[1] = newPosition[index][1];
      this.cubes[index].position[2] = newPosition[index][2];
    }
    this.updateStage();
  }

  isColliding(newPosition) {
    for (let i = 0; i < newPosition.length; i++) {
      if (this.stage.isCollidingCube(newPosition[i][0], newPosition[i][1], newPosition[i][2])) {
        return true;
      }
    }
    return false;
  }

  rotate() {
    if (this.locked) return;
    this.clearFromStage();
    // Find the pivot cube around which to rotate
    const pivotIndex = Math.floor(this.cubes.length / 2);
    const pivot = this.cubes[pivotIndex].position;
    // Calculate new positions for each cube after rotation
    const newPosition = this.cubes.map(cube => {
      const x = cube.position[0] - pivot[0];
      const z = cube.position[2] - pivot[2];
      // Rotate 90 degrees around the pivot on the Y axis
      return [
        pivot[0] + z,
        cube.position[1],
        pivot[2] - x,
      ];
    });
    // Apply new position if there is no collision
    if (!this.isColliding(newPosition)) {
      this.applyNewPosition(newPosition);
    }
  }

  clearFromStage() {
    this.cubes.forEach((cube) => {
      this.stage.setEmptyCube(cube.position[0], cube.position[1], cube.position[2]);
    });
  }

  updateStage() {
    this.cubes.forEach((cube) => {
      this.stage.fillCube(
        cube.position[0],
        cube.position[1],
        cube.position[2],
        cube.id,
        cube.locked ? 'locked' : 'active',
        cube.color,
      );
    });
  }

  correctToBounds() {
    let extremeX = 0;
    let extremeZ = 0;
    for (let i = 0; i < this.cubes.length; i++) {
      if (this.cubes[i].position[0] > extremeX) {
        extremeX = this.cubes[i].position[0];
      }
      if (this.cubes[i].position[2] > extremeZ) {
        extremeZ = this.cubes[i].position[2];
      }
    }
    if (extremeX >= this.stage.width) {
      for (let i = 0; i < this.cubes.length; i++) {
        this.cubes[i].position[0] -= (extremeX - this.stage.width + 1);
      }
    }
    if (extremeZ >= this.stage.width) {
      for (let i = 0; i < this.cubes.length; i++) {
        this.cubes[i].position[2] -= (extremeZ - this.stage.depth + 1);
      }
    }
  }

  create() {
    const shape = Brick.SHAPES[Math.floor(Math.random() * Brick.SHAPES.length)];
    const startPosition = [
      Math.floor(Math.random() * this.stage.width),
      this.stage.height - 1,
      Math.floor(Math.random() * this.stage.depth),
    ];
    for (let x = 0; x < shape.length; x++) {
      for (let y = 0; y < shape[x].length; y++) {
        if (shape[x][y] === 1) {
          const cube = {
            position: [],
            id: this.id * 100 + this.cubes.length,
            color: this.color,
            locked: false,
          };
          cube.position[0] = startPosition[0] + x;
          cube.position[1] = startPosition[1] + y;
          cube.position[2] = startPosition[2];
          this.cubes.push(cube);
        }
      }
    }
    this.correctToBounds();
    this.updateStage();
  }
}
