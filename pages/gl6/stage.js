/**
 * Represents the 3D stage in the game where bricks are placed.
 * @class
 * @name Stage
 */
export class Stage {
  /**
   * The height of the stage.
   * @type {number}
   */
  height = 32;

  /**
   * The width of the stage.
   * @type {number}
   */
  width = 12;

  /**
   * The depth of the stage.
   * @type {number}
   */
  depth = 12;

  /**
   * Represents all the cubes in the stage.
   * @public
   * @type {{
   *  color: number,
   *  id: number,
   *  state: ('floor'|'wall'|'active'|'locked'),
   *  prevPosition: number[],
   *  dirty: boolean,
   * }[][][]}
   */
  cubes = [];

  /**
   * Constructs the stage and initializes its properties.
   */
  constructor() {
    this.init();
  }

  /**
   * Initializes the stage by creating a 3D array representing all cubes in the stage.
   */
  init() {
    for (let x = 0; x < this.width; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.depth; z++) {
          this.cubes[x][y][z] = this.getEmptyCube();
        }
      }
    }
  }

  getEmptyCube() {
    return {
      color: null,
      id: null,
      prevPosition: null,
      state: null,
      dirty: true,
    };
  }

 
  setFilledCube(x, y, z, id, state, color, prevPosition = null) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = {
        color,
        id,
        prevPosition,
        state,
        dirty: true,
      };
    }
  }

  setEmptyCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      this.cubes[x][y][z] = this.getEmptyCube();
    }
  }

  isCubeDefined(x, y, z) {
    return this.cubes[x] && this.cubes[x][y] && this.cubes[x][y][z] !== undefined;
  }

  /**
   * Checks if a cube at the specified coordinates is filled.
   * @param {number} x - The x-coordinate of the cube.
   * @param {number} y - The y-coordinate of the cube.
   * @param {number} z - The z-coordinate of the cube.
   * @returns {boolean} True if the cube is filled, false otherwise.
   */
  isCollidingCube(x, y, z) {
    if (this.isCubeDefined(x, y, z)) {
      return ['floor', 'wall', 'locked'].includes(this.cubes[x][y][z].state);
    }
    return false;
  }  

}