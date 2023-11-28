function lerp3D(pointA, pointB, t) {
  return [
    lerp(pointA[0], pointB[0], t),
    lerp(pointA[1], pointB[1], t),
    lerp(pointA[2], pointB[2], t),
  ];
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

const modifiers = {
  oscillate: function(args) {
    const speed = args.speed || 1;
    const space = args.space || 'xyz';
    const distance = args.distance || 1;
    const skipX = !space.includes("x");
    const skipY = !space.includes("y");
    const skipZ = !space.includes("z");
    return (vec) => {
      const pn = performance.now() * 0.001 * speed
      if (!skipX) {
        vec[0] = distance * Math.sin(pn) + vec[0];
      }
      if (!skipY) {
        vec[1] = distance * Math.cos(pn) + vec[1];
      }
      if (!skipZ) {
        vec[2] = distance * Math.sin(pn) + vec[2];
      }
      return vec;
    };
  },
  scaleBy: (amount = 1, space = "xyz") => {
    const skipX = !space.includes("x");
    const skipY = !space.includes("y");
    const skipZ = !space.includes("z");
    return (vec) => {
      if (!skipX) {
        vec[0] = amount * vec[0];
      }
      if (!skipY) {
        vec[1] = amount * vec[1];
      }
      if (!skipZ) {
        vec[2] = amount * vec[2];
      }
      return vec;
    };
  },
  randomWalk: () => {
    let dir = [0, 0, 0];
    let lerp = [0, 0, 0];
    let prev = [0, 0, 0]
    let counter = 0;
    return (vec) => {
      if (counter > 120) {
        dir = [
          Math.random() * 2 - 1 - (Math.abs(prev[0]) > 8 ? prev[0] : 0),
          Math.random() * 2 - 1 - (Math.abs(prev[1]) > 8 ? prev[1] : 0),
          Math.random() * 2 - 1 - (Math.abs(prev[2]) > 8 ? prev[2] : 0),
        ];
        counter = 0;
      }
      lerp = lerp3D(lerp, dir, 0.008);
      const newV = [
        lerp[0] * 0.01 + prev[0],
        lerp[1] * 0.01 + prev[1],
        lerp[2] * 0.01 + prev[2],
      ];
      prev = [
        newV[0],
        newV[1],
        newV[2],
      ]
      counter += 1;
      return newV;
    };
  },
  sphereWalk: (args) => {
    return (vec) => {
      const distance = 0.2;
      let rx = (Math.random() * 2 - 1)
      let ry = (Math.random() * 2 - 1)
      let rz = (Math.random() * 2 - 1)
      const o = 1/Math.sqrt(rx*rx + ry*ry + rz*rz)
      rx = rx * o * distance
      ry = ry * o * distance
      rz = rz * o * distance
      const randVec = [
        rx + vec[0], ry + vec[1], rz + vec[2]
      ]
      return randVec
    }
  }
};

export default class Lifeforms {
  modifiers = [];

  constructor(v = [0, 0, 0]) {
    this.v = v
    this.compute();
  }

  oscillate(args) {
    this.modifiers.push(modifiers.oscillate(args));
    return this;
  }

  sphereWalk(args) {
    this.modifiers.push(modifiers.sphereWalk(args));
    return this;
  }

  randomWalk(amount) {
    this.modifiers.push(modifiers.randomWalk(amount));
    return this;
  }

  scaleBy(amount, space) {
    this.modifiers.push(modifiers.scaleBy(amount, space));
    return this;
  }

  compute() {
    this.v = [0,0,0]
    for (let i = 0; i < this.modifiers.length; i += 1) {
      this.v = [...this.modifiers[i](this.v)]
    }
    requestAnimationFrame(() => this.compute());
  }

  get() {
    return this.v;
  }
}
