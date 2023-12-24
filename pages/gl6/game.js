import { Stage } from "/gl6/stage.js";
import { Brick } from "/gl6/brick.js";
import { Engine } from "/gl6/engine.js";

const CYCLE_LENGTH_MS = 400;

class Game {
  constructor() {
    this.blockCyclesCount = 1;
    this.stage = new Stage(12, 8, 8);
    this.brick = new Brick(this.stage);
    this.engine = new Engine(this.stage);
    this.loop();
  }

  onCycleBlocks(callback) {
    const t = Math.round(performance.now() / 100) * 100;
    if (t % (CYCLE_LENGTH_MS * this.blockCyclesCount) === 0) {
      callback();
      this.blockCyclesCount += 1;
    }
  }

  loop = () => {
    this.onCycleBlocks(() => {
      this.brick.moveDown();
      if (this.brick.locked) {
        this.brick = new Brick(this.stage);
      }
    });
    
    this.engine.render();
    requestAnimationFrame(this.loop);
  }
}


new Game()
