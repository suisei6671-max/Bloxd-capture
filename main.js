import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
const loader = new GLTFLoader();

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  // 視点固定
  camera.position.set(2, 2.5, 4);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  addLights();
  animate();
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 5);
  scene.add(dir);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const fileInput = document.getElementById("file");

window.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    loader.load(url, (gltf) => {
      scene.clear();
      addLights();

      const model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      setTimeout(takeScreenshot, 100);
    });
  });
});

function takeScreenshot() {
  const dataURL = renderer.domElement.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "gltf_screenshot.png";
  a.click();
}

