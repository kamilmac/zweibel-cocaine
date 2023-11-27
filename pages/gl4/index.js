import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const mouse = new THREE.Vector2();

// Add an event listener for the 'mousemove' event
document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


class Attractor {
  constructor() {
    this.intervalId = null;
  }

  position = [0, 0, 0];
  dir = new THREE.Vector3();
  lerp = new THREE.Vector3();

  #generate() {
    return [
      Math.random() * 2 - 1 - (Math.abs(this.position[0]) > 1 ? this.position[0] : 0),
      Math.random() * 2 - 1 - (Math.abs(this.position[1]) > 1 ? this.position[1] : 0),
      Math.random() * 2 - 1 - (Math.abs(this.position[2]) > 1 ? this.position[2] : 0),
    ];
  }

  get() {
    this.lerp.lerpVectors(this.lerp, this.dir, 0.008);
    this.position = [
      this.lerp.x * 0.01 + this.position[0],
      this.lerp.y * 0.01 + this.position[1],
      this.lerp.z * 0.01 + this.position[2],
    ];
    return this.position;
  }

  startGenerating(interval = 1000) {
    if (this.intervalId === null) {
      this.intervalId = setInterval(() => {
        this.dir = new THREE.Vector3(...this.#generate());
      }, interval);
    }
  }
}
const createCylinder = (radius = 0.04, positionVector) => {
  const cylinderGeometry = new THREE.CylinderGeometry(
    radius,
    radius,
    0.1,
    16
  );
  const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(positionVector.x, positionVector.y, positionVector.z);
  return cylinder;
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const scene = new THREE.Scene();

// Define the material for the line
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

// Define the points the line will connect
let points = [];
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

const center = new THREE.Vector3();

let counter = 0;

function animate() {
  requestAnimationFrame(animate);  
  const newPoint = new THREE.Vector3(...attractor.get());
  points = points.slice(-128);
  if (counter % 1 === 0) {
    const lastPoint = points[points.length - 1];
    const distance = newPoint.distanceTo(lastPoint) * 8;
    const circle = createCylinder(distance, newPoint);
    circle.lookAt(lastPoint);
    circle.rotation.x += Math.PI / 2;
    scene.add(circle);
  }
  points.push(newPoint); // Add the new point to the points array
  controls.update();
  renderer.render(scene, camera);
  counter += 1;
}

animate();

