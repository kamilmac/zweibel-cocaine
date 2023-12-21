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

let idCounter = 0;

export class Brick {
  /**
   * Create a Brick.
   * @param {Stage} stage - The stage where the brick will be placed.
   */
  constructor(stage) {
    this.stage = stage;
    this.locked = false;
    this.color = 0x008833;
    this.id = idCounter++;
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
      cube.position.x + x,
      cube.position.y,
      cube.position.z + z,
    ]);
    if (!this.isColliding(newPosition)) {
      this.applyNewPosition(newPosition);
    }
  }

  moveLeft() {
    this.move(-1, 0);
  }

  moveRight() {
    this.move(1, 0);
  }

  moveClose() {
    this.move(0, 1);
  }

  moveFar() {
    this.move(0, -1);
  }

  moveDoubleFar() {
    this.move(0, -2);
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
    const prevPosition = this.cubes.map(cube => [
      cube.position[0],
      cube.position[1],
      cube.position[2],
    ]);
    this.cubes.forEach((cube, index) => {
      cube.position[0] = newPosition[index][0];
      cube.position[1] = newPosition[index][1];
      cube.position[2] = newPosition[index][2];
    });
    this.updateStage(prevPosition);
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
    const pivot = this.cubes[Math.ceil(this.cubes.length / 2)].position;
    const newPosition = this.cubes.map(cube => {
      const x = cube.position[0] - pivot[0];
      const z = cube.position[2] - pivot[2];
      return [
        pivot[0] - z,
        cube.position[1],
        pivot[2] + x,
      ];
    });
    if (!this.isColliding(newPosition)) {
      this.applyNewPosition(newPosition);
    }
  }

  clearFromStage() {
    this.cubes.forEach((cube) => {
      this.stage.setEmptyCube(cube.position[0], cube.position[1], cube.position[2]);
    });
  }

  updateStage(prevPosition = null) {
    this.cubes.forEach((cube) => {
      this.stage.setFilledCube(
        cube.position[0],
        cube.position[1],
        cube.position[2],
        cube.id,
        cube.locked ? 'locked' : 'active',
        cube.color,
        prevPosition,
      );
    });
  }

  create(startPosition) {
    const shape = BRICK_SHAPES[Math.floor(Math.random() * BRICK_SHAPES.length)];
    const startPosition = [
      Math.floor(Math.random() * (this.stage.width - shape.length)),
      this.stage.height - 1,
      Math.floor(Math.random() * this.stage.depth),
    ];
    for (let x = 0; x < shape.length; x++) {
      for (let y = 0; y < shape[x].length; y++) {
        if (shape[x][y] === 1) {
          const cube = {
            position: [],
            id: this.id * 1000 + (x + 1) * (y + 1),
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
    this.updateStage();
  }
}
