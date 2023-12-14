export class Stage {
  constructor() {
    this.height = 32;
    this.width = 12;
    this.depth = 12;
    this.cubeSize = 64;
    this.highestCube = 0;
    this.init();
  }

  init() {
    this.cubes = [];
    for (let x = 0; x < this.width; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.depth; z++) {
          if (y === 0) {
            this.cubes[x][y][z] = 1;
          } else {
            this.cubes[x][y][z] = 0;
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

  markAsImmobile(x, y, z) {
    if (this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined) {
      this.cubes[x][y][z] = -1;
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

  isImmobileCube(x, y, z) {
    if (this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined) {
      return this.cubes[x][y][z] === -1;
    }
    return false;
  }

  updateHighestCube(y) {
    if (y > this.highestCube) {
      this.highestCube = y;
    }
  }

  getTopYInColumn(x, z) {
    for (let y = this.height - 1; y > 0; y--) {
      if (this.isImmobileCube(x, y, z)) {
        return y;
      }
    }
    return 0;
  }
}