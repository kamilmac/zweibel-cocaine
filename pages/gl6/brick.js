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
  constructor(stage) {
    this.stage = stage;
    this.color = window.PLAYERS.find(player => player.id === this.playerId).color;
    this.id = idCounter++;
    this.cubes = [];
    const shape = BRICK_SHAPES[Math.floor(Math.random() * BRICK_SHAPES.length)];
    this.create(
      {
        x: Math.floor(Math.random() * (this.stage.width - 3)),
        y: this.stage.height - 1,
        z: Math.floor(Math.random() * this.stage.depth),
      }
    );
  }

  kill() {
    this.cubes.forEach((cube) => {
      cube.alive = false;
    });
    this.updateStage();
  }

  move(x, z) {
    if (this.isImmobile) return;
    this.clearFromStage();
    const newPosition = this.cubes.map(cube => [
      cube.position.x + x,
      cube.position.y,
      cube.position.z + z,
    ]);
    const isColliding = this.checkForWallCollision(newPosition);
    if (!isColliding) {
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
    if (!this.alive) return;
    this.clearFromStage();
    const newPosition = this.cubes.map(cube => [
      cube.position[0],
      cube.position[1] - 1,
      cube.position[2],
    ]);
    const isColliding = this.checkForCollision(newPosition);
    if (isColliding) {
      this.kill();
    } else {
      this.applyNewPosition(newPosition);
    }
  }

  applyNewPosition(newPosition) {
    this.cubes.forEach((cube, index) => {
      cube.position[0] = newPosition[index][0];
      cube.position[1] = newPosition[index][1];
      cube.position[2] = newPosition[index][2];
    });
    this.updateStage();
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

  checkForWallCollision(newPosition) {
    let isColliding = false
    newPosition.forEach((position) => {
      if (position[0] < 0 || position[0] > this.stage.width - 1) {
        isColliding = true;
      }
      if (position[2] < 0 || position[2] > this.stage.depth - 1) {
        isColliding = true;
      }
    });
    return isColliding;
  }

  rotate() {
    if (!this.alive) return;
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
    const isColliding = this.checkForCollision(newPosition);
    if (!isColliding) {
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
      this.stage.setFilledCube(cube.position[0], cube.position[1], cube.position[2], this.id);
    });
  }

  create(startPosition) {
    for (let x = 0; x < shape.length; x++) {
      for (let y = 0; y < shape[x].length; y++) {
        if (shape[x][y] === 1) {
          const cube = {
            position: [],
            id: this.id * 1000 + (x + 1) * (y + 1),
            color: this.color,
            alive: true,
          };
          cube.position[0] = startPosition.x + x;
          cube.position[1] = startPosition.y + y;
          cube.position[2] = startPosition.z;
          this.cubes.push(cube);
        }
      }
    }
    this.updateStage();
  }
}
