import { Stage } from "/gl6/stage.js";
import { Brick } from "/gl6/brick.js";
import { Engine } from "/gl6/engine.js";

const CYCLE_LENGTH_MS = 400;

class Game {
  constructor() {
    this.blockCyclesCount = 1;
    this.stage = new Stage(12, 8, 8);
    this.engine = new Engine(this.stage);
    this.controls = new Controls();
    this.addBrick();
    this.loop();
  }

  onCycleBlocks(callback) {
    const t = Math.round(performance.now() / 100) * 100;
    if (t % (CYCLE_LENGTH_MS * this.blockCyclesCount) === 0) {
      callback();
      this.blockCyclesCount += 1;
    }
  }

  addBrick() {
    delete this.brick;
    this.brick = new Brick(this.stage);
  }

  loop = () => {
    const actions = this.controls.getActions();
    actions.forEach((action) => {
      switch (action) {
        case 'left':
          this.brick.move(-1, 0);
          break;
        case 'right':
          this.brick.move(1, 0);
          break;
        case 'up':
          this.brick.move(0, -1);
          break;
        case 'down':
          this.brick.move(0, 1);
          break;
        case 'fall':
          this.brick.moveDown();
          break;
        case 'rotate':
          this.brick.rotate();
          break;
        default:
          break;
      }
    });
    this.onCycleBlocks(() => {
      this.brick.moveDown();
      if (this.brick.locked) {
        this.addBrick();
      }
    });
    this.engine.render();
    requestAnimationFrame(this.loop);
  }
}


class Controls {
  constructor() {
    this.addControls()
    this.actions = [];
  }

  addControls() {
    if (this.currentKeyUpHandler) {
      document.removeEventListener('keydown', this.currentKeyUpHandler);
      this.currentKeyUpHandler = null;
    }
    const keyUpHandler = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.actions.push('left');
          break;
        case 'ArrowRight':
          this.actions.push('right');
          break;
        case 'ArrowUp':
          this.actions.push('up');
          break;
        case 'ArrowDown':
          this.actions.push('down');
          break;
        case 'r':
          this.actions.push('rotate');
          break;
        case ' ':
          this.actions.push('fall');
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', keyUpHandler);
    this.currentKeyUpHandler = keyUpHandler;
  }

  getActions() {
    const actions = this.actions;
    this.actions = [];
    return actions;
  }
}


new Game()
