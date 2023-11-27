import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Lifeforms from "lifeforms";


const lf = new Lifeforms();

lf
  // .oscillate({ speed: 20, space: 'xyz', distance: 0.001 })
  // .oscillate(0.001, 'xyz')
  .randomWalk()
  .sphereWalk()
  .scaleBy(0.1);










const setupThree = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    130,
    window.innerWidth / window.innerHeight,
    0.0001,
    100,
  );
  camera.position.z = 2;

  const points = []
  points.push(new THREE.Vector3(0, 0, 0))
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  // controls.autoRotate = true

  const scene = new THREE.Scene();

  // const sphereGeo = new THREE.SphereGeometry(0.01, 32, 32);
  // const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xbcbcbc, linewidth: 1 });
  const line = new THREE.Line(lineGeometry, lineMaterial)

  scene.add(line);

  const target = new THREE.Vector3()
  const animateScene = () => {
    requestAnimationFrame(animateScene);
    const n = new THREE.Vector3(...lf.get())
    const cam = new THREE.Vector3(...lf.get())
    cam.z += 0.2
    points.push(n)
    lineGeometry.setFromPoints(points)
    controls.target.copy(target.lerp(n, 0.01))

    controls.position = (camera.position.lerp(cam, 0.1))
    // controls.cursor = target.lerp(n, 0.01)
    // controls.zoomToCursor = true
    // controls.zoom = 3
    controls.update()
    renderer.render(scene, camera);
  };

  animateScene();
};

setupThree();
