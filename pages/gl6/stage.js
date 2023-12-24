/**
 * Represents the 3D stage in the game where bricks are placed.
 * @class
 * @name Stage
 */
export class Stage {
  /**
   * Constructs the stage and initializes its properties.
   */
  constructor(height = 24, width = 12, depth = 12) {
    this.height = height;
    this.width = width;
    this.depth = depth;
    this.cubes = [];
    this.dirty = true;
    this.init();
  }

  /**
   * Initializes the stage by creating a 3D array representing all cubes in the stage.
   */
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

  getEmptyCube() {
    return null;
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
 
  fillCube(x, y, z, id, state, color, prevPosition = null) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = {
        color,
        id,
        prevPosition,
        state,
        dirty: true,
      };
      this.dirty = true;
    }
  }

  setEmptyCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = this.getEmptyCube();
      this.dirty = true;
    }
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
