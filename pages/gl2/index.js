import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function lerp3D(pointA, pointB, t, momentum = 0.4) {
  const dx = (pointB[0] - pointA[0]) * t;
  const dy = (pointB[1] - pointA[1]) * t;
  const dz = (pointB[2] - pointA[2]) * t;

  return [
    pointA[0] + dx * momentum,
    pointA[1] + dy * momentum,
    pointA[2] + dz * momentum
  ];
}

class Attractor {
  constructor() {
    this.intervalId = null;
  }

  #target = [0, 0, 0];
  #position = [0, 0, 0];

  #generate() {
    return [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ];
  }

  get() {
    this.#position = lerp3D(this.#position, this.#target, 0.3);
    return this.#position;
  }

  startGenerating(interval = 1000) {
    if (this.intervalId === null) {
      this.intervalId = setInterval(() => {
        this.#target = this.#generate();
      }, interval);
    }
  }
}




const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const scene = new THREE.Scene();

// Define the material for the line
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

// Define the points the line will connect
const points = [];
points.push(new THREE.Vector3(0, 0, 0));

// Create the geometry and add the points
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

// Create the line with the defined geometry and material
const line = new THREE.Line(lineGeometry, lineMaterial);

// Add the line to the scene
scene.add(line);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const attractor = new Attractor();
attractor.startGenerating();

function animate() {
  requestAnimationFrame(animate);  

  const newPoint = new THREE.Vector3(...attractor.get());
  points.push(newPoint); // Add the new point to the points array
  lineGeometry.setFromPoints(points);

  controls.update();
  renderer.render(scene, camera);
}

animate();
