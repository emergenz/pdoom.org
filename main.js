import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-container').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 8);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const loader = new GLTFLoader();
let model
loader.load('/laocoon_and_his_sons.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);
});
camera.position.z = 55;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.1; // Set damping factor

let time = 0; // Initialize a time variable

function animate() {
    requestAnimationFrame(animate);
  
    time += 0.01; // Increment the time variable
  
    // Subtle rotation
    if (model) {
      model.rotation.x += 0.0005;
      model.rotation.y += 0.0003;
    }
  
    // Subtle movement in a sinusoidal pattern
    if (model) {
      model.position.x = 0.1 * Math.sin(time);
      model.position.y = 0.1 * Math.sin(time * 0.5);
    }
  
    controls.update();
    renderer.render(scene, camera);
  }

animate();
