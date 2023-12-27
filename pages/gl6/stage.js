export class Stage {
  static id = 0;

  constructor(height = 24, width = 12, depth = 12) {
    this.height = height;
    this.width = width;
    this.depth = depth;
    this.cubes = [];
    this.dirty = true;
    this.init();
  }

  init() {
    for (let x = -1; x < this.width + 1; x++) {
      this.cubes[x] = [];
      for (let y = -1; y < this.height; y++) {
        this.cubes[x][y] = [];
        for (let z = -1; z < this.depth + 1; z++) {
          if (y === -1) {
            this.cubes[x][y][z] = this.getFloorCube();
            continue;
          }
          if (x > -1 && x < this.width && z > -1 && z < this.depth) {
            this.cubes[x][y][z] = this.getEmptyCube();
            continue;
          }
          this.cubes[x][y][z] = this.getWallCube();
        }
      }
    }
  }

  getNewID() {
    Stage.id += 1;
    return Stage.id;
  }

  getEmptyCube() {
    return {
      id: null,
      state: 'empty',
      dirty: false,
    };
  }

  getFloorCube() {
    return {
      color: 0x724722,
      id: null,
      state: 'floor',
      dirty: false,
    };
  }

  getWallCube() {
    return {
      color: 0x255377,
      id: null,
      state: 'wall',
      dirty: false,
    };
  }

  fillCube(x, y, z, id, state, color) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = {
        color,
        id,
        state,
        dirty: true,
      };
      this.dirty = true;
    }
  }

  resetCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = this.getEmptyCube();
      this.dirty = true;
    }
  }

  setToBeRemovedCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      const id = this.cubes[x][y][z].id;
      this.cubes[x][y][z] = this.getEmptyCube();
      this.cubes[x][y][z].id = id;
      this.cubes[x][y][z].dirty = true;
      this.dirty = true;
    }
  }

  setToBeMovedDownCube(x, y, z) {
    if (this.isCubeDefined(x, y, z) && this.cubes[x][y][z].state === 'locked') {
      const id = this.cubes[x][y][z].id;
      const color = this.cubes[x][y][z].color;
      this.fillCube(x, y-1, z, id, 'locked', color);
      this.cubes[x][y][z] = this.getEmptyCube();
      this.cubes[x][y][z].dirty = true;
      this.dirty = true;
    }
  }

  checkForFilledLines() {
    let zLine = [];
    let y = 0;
    for (let x = 0; x < this.width; x++) {
      zLine[x] = 0;
      for (let z = 0; z < this.depth; z++) {
        if (this.cubes[x][y][z]?.state === 'locked') {
          zLine[x] += 1;
        }
      }
    }

    zLine.forEach((n, index) => {
      if (n === 8) {
        for (let z = 0; z < this.depth; z++) {
          this.setToBeRemovedCube(index, 0, z);
          for (let y = 1; y < this.height; y++) {
            if (this.cubes[index][y][z]?.state === 'locked') {
              this.setToBeMovedDownCube(index, y, z);
            }
          }
        }
      }
    });
  }

  isCubeDefined(x, y, z) {
    return this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined;
  }

  isCollidingCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      return ['floor', 'wall', 'locked'].includes(this.cubes[x][y][z]?.state);
    }
    return false;
  }  
}
