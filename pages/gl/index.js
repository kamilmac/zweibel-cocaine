import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const scene = new THREE.Scene();

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 }
  },
  vertexShader: `
    uniform float time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vPosition = position;
      vNormal = normal;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vec3 vd = normalize(cameraPosition - vPosition);
      float fresnel = 1. - dot(vd, vNormal);
      gl_FragColor = vec4(vec3(fresnel), 1.0);
    }
  `,
});

const geometry = new THREE.BoxGeometry(2, 2, 2, 12, 12, 12);
const mesh = new THREE.Mesh(geometry, shaderMaterial);

scene.add(mesh);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  shaderMaterial.uniforms.time.value = performance.now() * 0.001; // update time uniform
  controls.update();
  renderer.render(scene, camera);
}

animate();
